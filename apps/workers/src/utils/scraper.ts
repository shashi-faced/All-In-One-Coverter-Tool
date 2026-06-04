import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

export async function scrapeConvert(
  inputPath: string,
  outputPath: string,
  inputFormat: string,
  outputFormat: string,
  onProgress: (progress: number, data?: any) => void
): Promise<void> {
  console.log(`Starting conversion via CloudConvert scraper: ${inputFormat} -> ${outputFormat}`);
  
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--window-position=0,0',
      '--ignore-certificate-errors',
    ]
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    acceptDownloads: true,
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  try {
    const url = `https://cloudconvert.com/${inputFormat.toLowerCase()}-to-${outputFormat.toLowerCase()}`;
    console.log(`Navigating to ${url}`);
    onProgress(5, { stage: 'uploading', message: 'Navigating to CloudConvert...' });
    
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });

    // Wait for the file input and upload
    console.log('Uploading file...');
    onProgress(15, { stage: 'uploading', message: 'Uploading file to CloudConvert...' });
    await page.waitForSelector('input[type="file"]', { state: 'attached', timeout: 20000 });
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(inputPath);

    // Wait for the Convert button to appear and click it
    console.log('Waiting for Convert button...');
    const convertBtn = page.locator('button:has-text("Convert"), button.btn-danger, .btn-primary:has-text("Convert")').first();
    await convertBtn.waitFor({ state: 'visible', timeout: 20000 });
    
    onProgress(30, { stage: 'processing', message: 'Triggering conversion...' });
    await convertBtn.click();

    // Monitor status / progress text
    console.log('Monitoring progress...');
    let completed = false;
    let attempts = 0;
    
    while (!completed && attempts < 120) {
      attempts++;
      await page.waitForTimeout(1000);
      
      const pageText = await page.innerText('body');
      const pageTextLower = pageText.toLowerCase();
      
      // Check for errors
      if (pageTextLower.includes('credits exceeded') || pageTextLower.includes('conversion failed') || pageTextLower.includes('out of conversion credits') || pageTextLower.includes('could not convert')) {
        throw new Error(`Conversion failed: ${pageText.trim().substring(0, 100)}...`);
      }
      
      // Check if finished (Download button should appear)
      const downloadBtn = page.locator('a:has-text("Download"), .btn-success:has-text("Download")').first();
      if (await downloadBtn.count() > 0 && await downloadBtn.isVisible()) {
        completed = true;
        break;
      }
      
      // Find progress percentages
      const match = pageText.match(/(\d+)%/);
      if (match) {
        const progressVal = parseInt(match[1], 10);
        // Map 0-100% cloudconvert progress to 30-90% app progress
        const mappedProgress = 30 + Math.round((progressVal / 100) * 60);
        onProgress(mappedProgress, { stage: 'processing', message: `Converting (${progressVal}%)...` });
      } else {
        onProgress(50, { stage: 'processing', message: 'Processing conversion...' });
      }
    }

    if (!completed) {
      throw new Error('Timeout waiting for conversion to complete.');
    }

    // Trigger download
    console.log('Triggering download...');
    onProgress(95, { stage: 'downloading', message: 'Downloading converted file...' });
    
    const downloadPromise = page.waitForEvent('download');
    const downloadLink = page.locator('a:has-text("Download"), .btn-success:has-text("Download")').first();
    await downloadLink.click();
    
    const download = await downloadPromise;
    await download.saveAs(outputPath);
    
    onProgress(100, { stage: 'completed', message: 'Conversion completed successfully.' });
    console.log(`Saved output to ${outputPath}`);

  } catch (error: any) {
    console.error('Scraper error:', error.message);
    try {
      console.log('Attempting local fallback conversion...');
      await localFallbackConvert(inputPath, outputPath, inputFormat, outputFormat);
      console.log('Local fallback conversion succeeded!');
      onProgress(100, { stage: 'completed', message: 'Conversion completed via local fallback.' });
      return;
    } catch (fallbackError: any) {
      console.error('Local fallback conversion also failed:', fallbackError.message);
    }

    try {
      const screenshotPath = 'E:\\converter-tool\\tmp\\scraper-failure.png';
      await page.screenshot({ path: screenshotPath });
      console.log(`Saved scraper failure screenshot to ${screenshotPath}`);
    } catch (e: any) {
      console.error('Failed to save scraper screenshot:', e.message);
    }
    throw error;
  } finally {
    await browser.close();
  }
}

async function localFallbackConvert(
  inputPath: string,
  outputPath: string,
  inputFormat: string,
  outputFormat: string
): Promise<void> {
  const inFormat = inputFormat.toLowerCase();
  const outFormat = outputFormat.toLowerCase();

  // If formats are identical, copy file
  if (inFormat === outFormat) {
    fs.copyFileSync(inputPath, outputPath);
    return;
  }

  // 1. Text to PDF manual fallback
  if (inFormat === 'txt' && outFormat === 'pdf') {
    const text = fs.readFileSync(inputPath, 'utf8');
    const escapedText = text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    
    const streamContent = `BT\r\n/F1 12 Tf\r\n72 712 Td\r\n(${escapedText}) Tj\r\nET`;
    const pdfContent = `%PDF-1.4\r\n` +
      `1 0 obj\r\n<< /Type /Catalog /Pages 2 0 R >>\r\n` +
      `endobj\r\n` +
      `2 0 obj\r\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\r\n` +
      `endobj\r\n` +
      `3 0 obj\r\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>\r\n` +
      `endobj\r\n` +
      `4 0 obj\r\n<< /Length ${streamContent.length} >>\r\n` +
      `stream\r\n` +
      `${streamContent}\r\n` +
      `endstream\r\n` +
      `endobj\r\n` +
      `xref\r\n` +
      `0 5\r\n` +
      `0000000000 65535 f\r\n` +
      `trailer\r\n` +
      `<< /Size 5 /Root 1 0 R >>\r\n` +
      `startxref\r\n` +
      `%%EOF`;
      
    fs.writeFileSync(outputPath, pdfContent);
    return;
  }

  const { execSync } = require('child_process');

  const imageFormats = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tiff', 'svg', 'ico'];
  const docFormats = ['pdf', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls', 'txt', 'html', 'md', 'epub', 'odt', 'rtf'];
  const mediaFormats = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'];

  // 2. Document conversion
  if (docFormats.includes(inFormat) || docFormats.includes(outFormat)) {
    // If output is PDF and input is a LibreOffice-supported document
    if (outFormat === 'pdf' && ['docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls', 'odt', 'rtf', 'txt', 'html', 'md', 'epub'].includes(inFormat)) {
      const loCmd = process.platform === 'win32' && fs.existsSync("C:\\Program Files\\LibreOffice\\program\\soffice.exe")
        ? `"C:\\Program Files\\LibreOffice\\program\\soffice.exe"`
        : 'libreoffice';
      execSync(
        `${loCmd} --headless --convert-to pdf --outdir "${path.dirname(outputPath)}" "${inputPath}"`,
        { stdio: 'ignore', timeout: 120000 }
      );
      const expectedOutputName = `${path.basename(inputPath, path.extname(inputPath))}.pdf`;
      const generatedPath = path.join(path.dirname(outputPath), expectedOutputName);
      if (fs.existsSync(generatedPath) && generatedPath.toLowerCase() !== outputPath.toLowerCase()) {
        fs.renameSync(generatedPath, outputPath);
      }
      return;
    }

    // PDF to Image using ImageMagick
    if (inFormat === 'pdf' && imageFormats.includes(outFormat)) {
      execSync(
        `magick convert -density 300 "${inputPath}[0]" -quality 90 "${outputPath}"`,
        { stdio: 'ignore', timeout: 60000 }
      );
      return;
    }

    // PDF to Document using Python/LibreOffice/Pandoc
    if (inFormat === 'pdf' && ['docx', 'doc', 'txt', 'html', 'md', 'odt', 'rtf'].includes(outFormat)) {
      try {
        const pythonScript = fs.existsSync(path.join(__dirname, 'pdf_converter.py'))
          ? path.join(__dirname, 'pdf_converter.py')
          : path.join(__dirname, '../../src/utils/pdf_converter.py');
        console.log(`Running Python PDF conversion: ${pythonScript}`);
        execSync(
          `python "${pythonScript}" "${inputPath}" "${outputPath}" "${outFormat}"`,
          { stdio: 'ignore', timeout: 60000 }
        );
        if (fs.existsSync(outputPath)) {
          return;
        }
      } catch (e) {
        console.warn('Python PDF conversion failed, trying LibreOffice...', (e as Error).message);
      }

      try {
        const loCmd = process.platform === 'win32' && fs.existsSync("C:\\Program Files\\LibreOffice\\program\\soffice.exe")
          ? `"C:\\Program Files\\LibreOffice\\program\\soffice.exe"`
          : 'libreoffice';
        execSync(
          `${loCmd} --headless --convert-to ${outFormat} --outdir "${path.dirname(outputPath)}" "${inputPath}"`,
          { stdio: 'ignore', timeout: 120000 }
        );
        const expectedOutputName = `${path.basename(inputPath, path.extname(inputPath))}.${outFormat}`;
        const generatedPath = path.join(path.dirname(outputPath), expectedOutputName);
        if (fs.existsSync(generatedPath) && generatedPath.toLowerCase() !== outputPath.toLowerCase()) {
          fs.renameSync(generatedPath, outputPath);
        }
        return;
      } catch (e) {
        console.warn('LibreOffice PDF conversion failed, trying Pandoc...', (e as Error).message);
      }

      execSync(
        `pandoc "${inputPath}" -o "${outputPath}"`,
        { stdio: 'ignore', timeout: 120000 }
      );
      return;
    }

    // Document to Document using LibreOffice
    if (['docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls', 'odt', 'rtf', 'txt', 'html', 'md', 'epub'].includes(inFormat) && ['docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls', 'odt', 'rtf', 'txt', 'html', 'md', 'epub'].includes(outFormat)) {
      const loCmd = process.platform === 'win32' && fs.existsSync("C:\\Program Files\\LibreOffice\\program\\soffice.exe")
        ? `"C:\\Program Files\\LibreOffice\\program\\soffice.exe"`
        : 'libreoffice';
      execSync(
        `${loCmd} --headless --convert-to ${outFormat} --outdir "${path.dirname(outputPath)}" "${inputPath}"`,
        { stdio: 'ignore', timeout: 120000 }
      );
      const expectedOutputName = `${path.basename(inputPath, path.extname(inputPath))}.${outFormat}`;
      const generatedPath = path.join(path.dirname(outputPath), expectedOutputName);
      if (fs.existsSync(generatedPath) && generatedPath.toLowerCase() !== outputPath.toLowerCase()) {
        fs.renameSync(generatedPath, outputPath);
      }
      return;
    }

    // Fallback document conversion using Pandoc
    try {
      execSync(
        `pandoc "${inputPath}" -o "${outputPath}"`,
        { stdio: 'ignore', timeout: 120000 }
      );
      return;
    } catch (e) {
      // Ignore and let it throw below
    }
  }

  // 3. Image conversion (using Sharp first, then ImageMagick)
  if (imageFormats.includes(inFormat) && imageFormats.includes(outFormat)) {
    try {
      const sharp = require('sharp');
      await sharp(inputPath).toFile(outputPath);
      return;
    } catch (sharpError) {
      console.warn('Sharp conversion failed, falling back to ImageMagick...', (sharpError as Error).message);
    }
    execSync(
      `magick convert "${inputPath}" "${outputPath}"`,
      { stdio: 'ignore', timeout: 60000 }
    );
    return;
  }

  // 4. Audio/Video conversion using Ffmpeg
  if (mediaFormats.includes(inFormat) || mediaFormats.includes(outFormat)) {
    execSync(
      `ffmpeg -y -i "${inputPath}" "${outputPath}"`,
      { stdio: 'ignore', timeout: 120000 }
    );
    return;
  }

  throw new Error(`No local fallback conversion path from ${inputFormat} to ${outputFormat}`);
}