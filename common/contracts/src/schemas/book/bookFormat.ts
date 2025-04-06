export const bookFormats = {
  paperback: 'paperback',
  hardcover: 'hardcover',
  ebook: 'ebook',
} as const;

export type BookFormat = (typeof bookFormats)[keyof typeof bookFormats];
