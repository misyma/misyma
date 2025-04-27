import { type BookReadingRawEntity } from '../../../../../databaseModule/infrastructure/tables/bookReadingTable/bookReadingRawEntity.js';
import { type BookReading } from '../../../../domain/entities/bookReading/bookReading.js';

export interface BookReadingMapper {
  mapToDomain(rawEntity: BookReadingRawEntity): BookReading;
}
