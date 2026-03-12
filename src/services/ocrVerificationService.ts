// OCR Verification Service using Tesseract.js and pdfjs-dist
import Tesseract from 'tesseract.js';
import type { VerificationData, VerificationResult, FieldVerification, OCRProgress } from '@/types/ocr';

// Dynamic import for pdfjs-dist to avoid SSR issues
let pdfjsLib: typeof import('pdfjs-dist') | null = null;

async function getPdfJs() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs`;
  }
  return pdfjsLib;
}

// Levenshtein distance algorithm for fuzzy matching
export function levenshteinDistance(a: string, b: string): number {
  if (!a || !b) return (a || b).length;
  
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

// Calculate similarity ratio (0-1)
export function calculateSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
  const maxLength = Math.max(a.length, b.length);
  return 1 - distance / maxLength;
}

// Fuzzy search for a keyword in text with threshold
export function fuzzyContains(
  text: string,
  keyword: string,
  threshold: number = 0.7
): { found: boolean; similarity: number; matchedWord?: string } {
  if (!keyword) return { found: true, similarity: 1 };
  
  const words = text.split(/\s+/);
  let bestMatch = { found: false, similarity: 0, matchedWord: undefined as string | undefined };
  
  for (const word of words) {
    const similarity = calculateSimilarity(word, keyword);
    if (similarity > bestMatch.similarity) {
      bestMatch = {
        found: similarity >= threshold,
        similarity,
        matchedWord: similarity >= threshold ? word : undefined,
      };
    }
  }
  
  // Also check for substring matches (for registration numbers)
  if (!bestMatch.found && text.includes(keyword.toLowerCase())) {
    return { found: true, similarity: 1, matchedWord: keyword };
  }
  
  return bestMatch;
}

// Convert PDF to image using pdfjs-dist
export async function convertPdfToImage(
  file: File,
  scale: number = 2.0,
  pageNumber: number = 1
): Promise<string> {
  const pdfjs = await getPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) {
    throw new Error('Could not get canvas context');
  }
  
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise;
  
  return canvas.toDataURL('image/png');
}

// Get total pages in PDF
export async function getPdfPageCount(file: File): Promise<number> {
  const pdfjs = await getPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  return pdf.numPages;
}

// Convert all PDF pages to images
export async function convertPdfToImages(
  file: File,
  scale: number = 2.0,
  maxPages: number = 5,
  onProgress?: (page: number, total: number) => void
): Promise<string[]> {
  const pdfjs = await getPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const totalPages = Math.min(pdf.numPages, maxPages);
  const images: string[] = [];
  
  for (let i = 1; i <= totalPages; i++) {
    onProgress?.(i, totalPages);
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) continue;
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;
    
    images.push(canvas.toDataURL('image/png'));
  }
  
  return images;
}

// Clean and normalize text for comparison
export function cleanText(text: string): string {
  return text
    .toLowerCase()
    // Keep letters (including Arabic unicode range), numbers, and spaces
    .replace(/[^a-z0-9\u0600-\u06FF\s]/g, ' ')
    // Normalize multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract digits only (for date/number comparison)
export function extractDigits(text: string): string {
  return text.replace(/\D/g, '');
}

// Perform OCR on an image source
export async function extractTextFromImage(
  imageSource: string | File,
  languages: string = 'eng+fra+ara',
  onProgress?: (progress: OCRProgress) => void
): Promise<string> {
  const result = await Tesseract.recognize(imageSource, languages, {
    logger: (m) => {
      if (onProgress) {
        const progress: OCRProgress = {
          status: m.status,
          progress: m.status === 'recognizing text' ? Math.round(m.progress * 100) : 0,
          statusText: getStatusText(m.status, m.progress),
        };
        onProgress(progress);
      }
    },
  });
  
  return result.data.text;
}

// Get human-readable status text
function getStatusText(status: string, progress?: number): string {
  switch (status) {
    case 'loading tesseract core':
      return 'Chargement du moteur OCR...';
    case 'initializing tesseract':
      return 'Initialisation...';
    case 'loading language traineddata':
      return 'Chargement des langues (FR/EN/AR)...';
    case 'initializing api':
      return 'Préparation de l\'analyse...';
    case 'recognizing text':
      return `Analyse IA : ${Math.round((progress || 0) * 100)}%`;
    default:
      return status;
  }
}

// Verify a field against extracted text
function verifyField(
  cleanedText: string,
  digitsText: string,
  expectedValue: string | undefined,
  isDigitsOnly: boolean = false
): FieldVerification | undefined {
  if (!expectedValue) return undefined;
  
  const normalizedExpected = expectedValue.toLowerCase().trim();
  
  if (isDigitsOnly) {
    const expectedDigits = extractDigits(expectedValue);
    const found = digitsText.includes(expectedDigits);
    return {
      found,
      similarity: found ? 1 : 0,
      expectedValue: expectedValue,
      matchedWord: found ? expectedDigits : undefined,
    };
  }
  
  const result = fuzzyContains(cleanedText, normalizedExpected);
  return {
    found: result.found,
    similarity: result.similarity,
    expectedValue: expectedValue,
    matchedWord: result.matchedWord,
  };
}

// Main verification function
export async function verifyDocumentContent(
  file: File,
  expectedData: VerificationData,
  onProgress?: (progress: OCRProgress) => void,
  options?: {
    maxPdfPages?: number;
    similarityThreshold?: number;
    scale?: number;
  }
): Promise<VerificationResult> {
  const startTime = Date.now();
  const { maxPdfPages = 3, scale = 2.0 } = options || {};
  
  let imageSource: string | File;
  
  // Convert PDF to image if needed
  if (file.type === 'application/pdf') {
    onProgress?.({
      status: 'converting',
      progress: 0,
      statusText: 'Conversion du PDF en image...',
    });
    
    // For multi-page PDFs, extract all pages and combine text
    const pageCount = await getPdfPageCount(file);
    if (pageCount > 1) {
      const images = await convertPdfToImages(file, scale, maxPdfPages, (page, total) => {
        onProgress?.({
          status: 'converting',
          progress: Math.round((page / total) * 50),
          statusText: `Conversion page ${page}/${total}...`,
        });
      });
      
      // OCR all pages and combine text
      let combinedText = '';
      for (let i = 0; i < images.length; i++) {
        const pageText = await extractTextFromImage(images[i], 'eng+fra+ara', (p) => {
          const baseProgress = 50 + ((i / images.length) * 50);
          const pageProgress = (p.progress / 100) * (50 / images.length);
          onProgress?.({
            ...p,
            progress: Math.round(baseProgress + pageProgress),
            statusText: `Page ${i + 1}/${images.length}: ${p.statusText}`,
          });
        });
        combinedText += ' ' + pageText;
      }
      
      const cleanedText = cleanText(combinedText);
      const digitsText = extractDigits(combinedText);
      
      return buildVerificationResult(
        expectedData,
        combinedText,
        cleanedText,
        digitsText,
        startTime
      );
    }
    
    imageSource = await convertPdfToImage(file, scale);
  } else {
    imageSource = file;
  }
  
  // Perform OCR
  const rawText = await extractTextFromImage(imageSource, 'eng+fra+ara', onProgress);
  const cleanedText = cleanText(rawText);
  const digitsText = extractDigits(rawText);
  
  return buildVerificationResult(
    expectedData,
    rawText,
    cleanedText,
    digitsText,
    startTime
  );
}

// Build the verification result object
function buildVerificationResult(
  expectedData: VerificationData,
  rawText: string,
  cleanedText: string,
  digitsText: string,
  startTime: number
): VerificationResult {
  const fields: VerificationResult['fields'] = {};
  
  // Verify each field
  if (expectedData.firstName) {
    fields.firstName = verifyField(cleanedText, digitsText, expectedData.firstName);
  }
  
  if (expectedData.lastName) {
    fields.lastName = verifyField(cleanedText, digitsText, expectedData.lastName);
  }
  
  if (expectedData.fullName) {
    fields.fullName = verifyField(cleanedText, digitsText, expectedData.fullName);
  }
  
  if (expectedData.registrationNumber) {
    fields.registrationNumber = verifyField(cleanedText, digitsText, expectedData.registrationNumber, true);
  }
  
  if (expectedData.date) {
    fields.date = verifyField(cleanedText, digitsText, expectedData.date, true);
  }
  
  if (expectedData.facilityName) {
    fields.facilityName = verifyField(cleanedText, digitsText, expectedData.facilityName);
  }
  
  // Calculate overall success and score
  const fieldValues = Object.values(fields).filter(Boolean) as FieldVerification[];
  const foundCount = fieldValues.filter(f => f.found).length;
  const totalFields = fieldValues.length;
  const overallScore = totalFields > 0 ? (foundCount / totalFields) * 100 : 0;
  const success = totalFields > 0 && foundCount === totalFields;
  
  return {
    success,
    overallScore,
    fields,
    rawText,
    cleanedText,
    processedAt: new Date(),
    processingTimeMs: Date.now() - startTime,
  };
}
