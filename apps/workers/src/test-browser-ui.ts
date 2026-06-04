import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function run() {
  console.log('Starting Playwright UI verification test...');
  
  // 1. Create a dummy test file
  const testFilePath = path.join(__dirname, 'test-file.txt');
  fs.writeFileSync(testFilePath, 'Hello World! This is a test file for ConvertForge.');
  console.log(`Created dummy test file at: ${testFilePath}`);
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { timeout: 90000 });
    
    // Check main title
    const title = await page.locator('h1').textContent();
    console.log(`Page title: "${title?.trim()}"`);
    
    // 2. Upload the dummy file to the dropzone input
    console.log('Uploading dummy file...');
    const inputElement = page.locator('input[type="file"]');
    await inputElement.setInputFiles(testFilePath);
    
    console.log('Waiting for file preview...');
    await page.waitForSelector('text=1 file(s) selected');
    
    // 3. Select output format
    console.log('Selecting Output Format to PDF...');
    
    // Click the output format trigger
    const outputTrigger = page.locator('button:has-text("Select output format")');
    await outputTrigger.click();
    
    // Select the option "PDF"
    const pdfOption = page.locator('[role="option"]:has-text("PDF"), span:has-text("PDF")').first();
    await pdfOption.click();
    
    // 4. Click Start Conversion button
    console.log('Clicking Start Conversion...');
    const convertButton = page.locator('button:has-text("Start Conversion")');
    await convertButton.click();
    
    // 5. Monitor conversion job status
    console.log('Monitoring job status card...');
    // Wait for the status to show COMPLETED
    await page.waitForSelector('text=COMPLETED', { timeout: 60000 });
    console.log('Job completed successfully!');
    
  } catch (error: any) {
    console.error('Test failed with error:', error.message);
    // Take a screenshot on failure to help debug
    await page.screenshot({ path: path.join(__dirname, 'failure-screenshot.png') });
    console.log('Saved failure screenshot.');
  } finally {
    await browser.close();
    // Clean up dummy file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  }
}

run();
