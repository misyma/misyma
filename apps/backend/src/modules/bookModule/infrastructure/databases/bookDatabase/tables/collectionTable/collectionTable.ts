import { type CollectionRawEntity } from './collectionRawEntity.js';

export const collectionTable = 'collections';

export const collectionColumns: Record<keyof CollectionRawEntity, string> = {
  id: `${collectionTable}.id`,
  name: `${collectionTable}.name`,
  userId: `${collectionTable}.userId`,
  createdAt: `${collectionTable}.createdAt`,
};
