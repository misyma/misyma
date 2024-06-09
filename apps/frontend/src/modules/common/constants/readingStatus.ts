import { ReadingStatus as ContractReadingStatus } from '@common/contracts';

export const ReadingStatus = {
  [ContractReadingStatus.finished]: 'przeczytana',
  [ContractReadingStatus.inProgress]: 'czytana',
  [ContractReadingStatus.toRead]: 'do przeczytania',
} as const;
