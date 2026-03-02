/**
 * Slug generation and validation utilities.
 * Slugs are lowercase, hyphen-separated, URL-safe identifiers unique at the DB level.
 *
 * @module @buzzy/shared/utils/slug
 */

/**
 * Generates a URL-safe slug from a display name.
 *
 * @param input - The display name or term to slugify
 * @returns A lowercase, hyphen-separated, URL-safe slug
 * @throws {Error} If input is empty after processing
 *
 * @example
 * ```ts
 * generateSlug('Artificial Intelligence') // 'artificial-intelligence'
 * generateSlug('Taylor Swift') // 'taylor-swift'
 * generateSlug('S&P 500') // 'sp-500'
 * ```
 */
export function generateSlug(input: string): string {
  const slug = input
    .toLowerCase()
    .trim()
    .replace(/[&]/g, 'and')
    .replace(/[$]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (slug.length === 0) {
    throw new Error(`Cannot generate slug from input: "${input}"`);
  }

  return slug;
}

/**
 * Validates whether a string is a valid slug format.
 *
 * @param slug - The slug to validate
 * @returns True if the slug matches the expected format
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
