import { bookFormats } from '@common/contracts';

export const BookFormat = {
  [bookFormats.ebook]: 'ebook',
  [bookFormats.hardcover]: 'okładka twarda',
  [bookFormats.paperback]: 'okładka miękka',
} as const;
