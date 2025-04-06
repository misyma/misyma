export const bookshelfTypes = {
  standard: 'standard',
  archive: 'archive',
  borrowing: 'borrowing',
} as const;

export type BookshelfType = (typeof bookshelfTypes)[keyof typeof bookshelfTypes];
