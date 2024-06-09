import { type QuoteRawEntity } from './quoteRawEntity.js';

export const quoteTable = 'quotes';

export const quoteColumns: Record<keyof QuoteRawEntity, string> = {
  id: `${quoteTable}.id`,
  userBookId: `${quoteTable}.userBookId`,
  content: `${quoteTable}.content`,
  isFavorite: `${quoteTable}.isFavorite`,
  createdAt: `${quoteTable}.createdAt`,
  page: `${quoteTable}.page`,
};
