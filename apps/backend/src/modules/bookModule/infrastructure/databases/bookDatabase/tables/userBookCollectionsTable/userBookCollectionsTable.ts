import { type UserBookCollectionRawEntity } from './userBookCollectionsRawEntity.js';

export const userBookCollectionTable = 'userBookCollections';

export const userBookCollectionColumns: Record<keyof UserBookCollectionRawEntity, string> = {
  userBookId: `${userBookCollectionTable}.userBookId`,
  collectionId: `${userBookCollectionTable}.collectionId`,
};
