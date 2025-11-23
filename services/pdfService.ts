import * as pdfjsLib from 'pdfjs-dist';

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // Initialize worker strictly when needed, not at module load time
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      const version = pdfjsLib.version || '4.0.379'; // Fallback version if detection fails
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
    throw new Error("Failed to parse PDF. Please ensure it is a valid text-based PDF.");
  }
};