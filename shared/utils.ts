// Utility functions for the application

/**
 * Generate a URL-friendly slug from a string
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Check if a file type is allowed for upload
 * @param mimeType - The MIME type to check
 * @returns Whether the file type is allowed
 */
export function isAllowedFileType(mimeType: string): boolean {
  const allowedTypes = [
    'application/pdf',
    'text/markdown',
    'text/x-markdown',
    'text/plain' // Sometimes MD files are detected as plain text
  ];
  return allowedTypes.includes(mimeType);
}

/**
 * Get file type from MIME type
 * @param mimeType - The MIME type
 * @returns 'pdf' or 'md'
 */
export function getFileType(mimeType: string): 'pdf' | 'md' {
  if (mimeType === 'application/pdf') {
    return 'pdf';
  }
  return 'md';
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}