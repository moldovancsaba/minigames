/**
 * Generates a URL-friendly slug from a string
 * @param text The text to convert into a slug
 * @returns A URL-friendly slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
    .replace(/^-+|-+$/g, '')     // Remove leading/trailing hyphens
    .replace(/--+/g, '-');       // Replace multiple hyphens with single hyphen
}
