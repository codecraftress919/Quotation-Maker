import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Set up PDF.js worker with stable version
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

/**
 * Extract text from a PDF file using pdf.js (text-based) or OCR (scanned)
 * @param {File} file - The PDF file to extract text from
 * @param {Function} onProgress - Callback for progress updates (0-100)
 * @returns {Promise<string>} - Extracted text
 */
export const extractTextFromPDF = async (file, onProgress) => {
  let pdf = null;
  try {
    onProgress?.(5);

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    onProgress?.(10);

    // Load the PDF document with better error handling
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
      cMapPacked: true,
      standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/'
    });
    
    pdf = await loadingTask.promise;
    console.log('PDF loaded successfully, pages:', pdf.numPages);
    
    onProgress?.(15);

    let fullText = '';
    const numPages = pdf.numPages;
    let useOCR = false;

    // First, try direct text extraction
    for (let i = 1; i <= numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Extract text items with better formatting
        const pageText = textContent.items
          .map(item => item.str)
          .filter(str => str.trim().length > 0)
          .join(' ');
        
        fullText += pageText + '\n';
        
        // Update progress
        const progress = 15 + ((i / numPages) * 35);
        onProgress?.(Math.round(progress));
      } catch (pageError) {
        console.warn(`Error extracting text from page ${i}:`, pageError);
        fullText += `[Page ${i} extraction failed]\n`;
      }
    }

    const trimmedText = fullText.trim();
    console.log('Direct extraction text length:', trimmedText.length);
    
    // Check if we got meaningful text - use OCR if less than 100 characters
    if (trimmedText.length < 100) {
      console.warn('Extracted very little text from PDF. Attempting OCR...');
      useOCR = true;
    } else {
      onProgress?.(100);
      return trimmedText;
    }

    // If direct extraction failed, use OCR
    if (useOCR && pdf) {
      console.log('Switching to OCR extraction');
      onProgress?.(55);
      return await extractWithOCR(pdf, numPages, onProgress);
    }
    
    onProgress?.(100);
    return trimmedText;
  } catch (error) {
    console.error('PDF extraction-error:', error);
    
    // If PDF was loaded but extraction failed, try OCR as fallback
    if (pdf) {
      console.log('Attempting OCR as fallback after error');
      try {
        onProgress?.(55);
        return await extractWithOCR(pdf, pdf.numPages, onProgress);
      } catch (ocrError) {
        console.error('OCR fallback also failed:', ocrError);
        throw new Error(`OCR processing failed: ${ocrError.message}. Please try entering data manually.`);
      }
    }
    
    // Provide more specific error messages
    if (error.message.includes('Invalid PDF structure')) {
      throw new Error('The PDF file appears to be corrupted or invalid. Please try a different file.');
    } else if (error.message.includes('password')) {
      throw new Error('The PDF is password-protected. Please provide an unprotected PDF.');
    } else {
      throw new Error(`Could not extract text from PDF: ${error.message}. Please try entering data manually.`);
   }
  }
};

/**
 * Extract text using OCR (for scanned PDFs)
 * @param {Object} pdf - PDF document object
 * @param {number} numPages - Number of pages
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Promise<string>} - Extracted text
 */
const extractWithOCR = async (pdf, numPages, onProgress) => {
  try {
    console.log('Starting OCR extraction for', numPages, 'pages');
    onProgress?.(60);
    
    let fullText = '';
    
    // Process each page with OCR
    for (let i = 1; i <= numPages; i++) {
      try {
        console.log(`Processing page ${i} with OCR`);
        const page = await pdf.getPage(i);
        
        // Render page to canvas
        const scale = 2.0; // Higher scale for better OCR accuracy
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        // Convert canvas to image data for Tesseract
        const imageData = canvas.toDataURL('image/png');
        console.log(`Page ${i} rendered to canvas, starting OCR`);
        
        onProgress?.(60 + ((i / numPages) * 10));
        
        // Perform OCR on the image
        const result = await Tesseract.recognize(
          imageData,
          'eng',
          {
            logger: (m) => {
              console.log('OCR progress:', m.status, m.progress);
              if (m.status === 'recognizing text') {
                const progress = 70 + ((i / numPages) * 30) + (m.progress * 30 / numPages);
                onProgress?.(Math.round(progress));
              }
            }
          }
        );
        
        console.log(`Page ${i} OCR result length:`, result.data.text.length);
        fullText += result.data.text + '\n';
        
        // Clean up canvas
        canvas.remove();
        
      } catch (pageError) {
        console.error(`Error OCR processing page ${i}:`, pageError);
        fullText += `[Page ${i} OCR failed]\n`;
      }
    }
    
    console.log('OCR extraction complete. Total text length:', fullText.length);
    onProgress?.(100);
    return fullText.trim();
  } catch (error) {
    console.error('OCR extraction failed:', error);
    throw new Error(`OCR processing failed: ${error.message}. Please try entering data manually.`);
  }
};

/**
 * Check if PDF is likely scanned (has little extractable text)
 * @param {string} text - Extracted text
 * @returns {boolean}
 */
export const isLikelyScannedPDF = (text) => {
  const trimmedText = text.trim();
  return trimmedText.length < 100;
};
