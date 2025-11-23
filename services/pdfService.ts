import * as pdfjsLib from 'pdfjs-dist';

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // Initialize worker strictly when needed.
    // We use a specific version matching package.json (4.0.379) to avoid conflicts.
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      const version = '4.0.379'; 
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  } catch (error) {
    console.error("PDF extraction failed:", error);
    throw new Error("Failed to parse PDF. Please ensure it is a valid text-based PDF file.");
  }
};