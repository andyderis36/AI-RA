import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resolves raw browser MIME type to internal simplified fileType.
 */
export function resolveFileType(mime: string): 'pdf' | 'docx' | 'image' {
  if (mime === 'application/pdf') return 'pdf';
  if (
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mime.includes('wordprocessingml')
  )
    return 'docx';
  return 'image';
}

/**
 * Maps internal simplified fileType back to full MIME type for Gemini.
 * Includes fix for DOCX and specific image formats.
 */
export function toMimeType(
  fileType: 'pdf' | 'docx' | 'image',
  originalMime?: string,
): string {
  switch (fileType) {
    case 'pdf':
      return 'application/pdf';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'image':
      // Return original if available, else fallback to standard image/png
      return originalMime?.startsWith('image/') ? originalMime : 'image/png';
    default:
      return 'application/pdf';
  }
}

