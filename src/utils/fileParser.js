/**
 * Clean & sanitize extracted text (remove binary null bytes, unprintable characters)
 */
export function sanitizeExtractedText(text) {
  if (!text) return '';
  return text
    // Replace non-printable ASCII control characters except \n, \r, \t
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFFFD]/g, ' ')
    // Normalize excessive spaces and lines
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

/**
 * Parse uploaded file into clean plain text
 * Supports: .docx, .pdf, .txt, .md, .csv, .json
 */
export async function parseUploadedFile(file) {
  if (!file) {
    throw new Error('No file provided');
  }

  const fileName = file.name.toLowerCase();

  // 1. WORD DOCUMENTS (.docx)
  if (fileName.endsWith('.docx')) {
    try {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const cleanText = sanitizeExtractedText(result.value);
      if (!cleanText.trim()) {
        throw new Error('Empty Word document or could not extract readable text.');
      }
      return cleanText;
    } catch (err) {
      throw new Error(`Failed to parse Word document (.docx): ${err.message}`);
    }
  }

  // 2. PDF DOCUMENTS (.pdf)
  if (fileName.endsWith('.pdf')) {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
      }
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageStrings = textContent.items.map(item => item.str);
        fullText += pageStrings.join(' ') + '\n\n';
      }

      const cleanText = sanitizeExtractedText(fullText);
      if (!cleanText.trim()) {
        throw new Error('PDF contains scanned images or no readable text layer.');
      }
      return cleanText;
    } catch (err) {
      throw new Error(`Failed to parse PDF document (.pdf): ${err.message}`);
    }
  }

  // 3. PLAIN TEXT / MARKDOWN / CSV / JSON
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rawContent = e.target.result;
        if (typeof rawContent !== 'string') {
          return reject(new Error('File content is not readable text'));
        }

        // Quick sanity check for accidental binary file uploaded with .txt extension
        if (rawContent.includes('\x00\x00\x00') || (rawContent.match(/[\x00-\x08\x0E-\x1F]/g) || []).length > 20) {
          return reject(new Error('File contains unreadable binary data. Please upload a standard text or .docx file.'));
        }

        const cleanText = sanitizeExtractedText(rawContent);
        resolve(cleanText);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Error reading file from disk'));
    reader.readAsText(file);
  });
}
