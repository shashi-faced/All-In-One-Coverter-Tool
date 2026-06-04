import sys
import os

def pdf_to_txt(pdf_path, txt_path):
    from pypdf import PdfReader
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += (page.extract_text() or "") + "\n"
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(text)

def pdf_to_html(pdf_path, html_path):
    from pypdf import PdfReader
    reader = PdfReader(pdf_path)
    html = """<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Converted Document</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            max-width: 800px;
            margin: 40px auto;
            padding: 0 20px;
            background-color: #f8fafc;
        }
        .page {
            background: white;
            padding: 40px;
            margin-bottom: 24px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            border: 1px solid #e2e8f0;
            white-space: pre-wrap;
            word-break: break-word;
        }
        .page-header {
            font-size: 11px;
            color: #94a3b8;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 8px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
        }
    </style>
</head>
<body>
"""
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        text_escaped = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        html += f"""    <div class="page">
        <div class="page-header">
            <span>CONVERTED DOCUMENT</span>
            <span>PAGE {i+1} OF {len(reader.pages)}</span>
        </div>
        {text_escaped}
    </div>\n"""
    html += "</body>\n</html>"
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)

def pdf_to_docx(pdf_path, docx_path):
    from pypdf import PdfReader
    from docx import Document
    reader = PdfReader(pdf_path)
    doc = Document()
    
    # Simple styling setup
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Arial'
    
    for page in reader.pages:
        text = page.extract_text() or ""
        doc.add_paragraph(text)
        
    doc.save(docx_path)

def pdf_to_md(pdf_path, md_path):
    from pypdf import PdfReader
    reader = PdfReader(pdf_path)
    md = ""
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        md += f"## Page {i+1}\n\n{text}\n\n---\n\n"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md)

def main():
    if len(sys.argv) < 4:
        print("Usage: python pdf_converter.py <pdf_path> <output_path> <format>")
        sys.exit(1)
        
    pdf_path = sys.argv[1]
    output_path = sys.argv[2]
    out_format = sys.argv[3].lower()
    
    if out_format == 'txt':
        pdf_to_txt(pdf_path, output_path)
    elif out_format == 'html':
        pdf_to_html(pdf_path, output_path)
    elif out_format in ['docx', 'doc', 'odt', 'rtf']:
        pdf_to_docx(pdf_path, output_path)
    elif out_format == 'md':
        pdf_to_md(pdf_path, output_path)
    else:
        print(f"Unsupported format: {out_format}")
        sys.exit(1)
        
    print("Conversion complete")

if __name__ == "__main__":
    main()
