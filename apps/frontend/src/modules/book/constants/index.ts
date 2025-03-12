export const BookNavigationFromEnum = {
  shelves: 'shelves',
  books: 'books',
} as const;

export type BookNavigationFrom = keyof typeof BookNavigationFromEnum;
