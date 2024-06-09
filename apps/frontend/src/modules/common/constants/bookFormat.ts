import { BookFormat as ContractBookFormat } from '@common/contracts';

export const BookFormat = {
  [ContractBookFormat.ebook]: 'ebook',
  [ContractBookFormat.hardcover]: 'twarda oprawa',
  [ContractBookFormat.paperback]: 'oprawa miękka',
} as const;
