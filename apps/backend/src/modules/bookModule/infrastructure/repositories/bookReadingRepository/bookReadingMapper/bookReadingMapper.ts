import { type BookReading } from '../../../../domain/entities/bookReading/bookReading.js';
import { type BookReadingRawEntity } from '../../../databases/bookDatabase/tables/bookReadingTable/bookReadingRawEntity.js';

export interface BookReadingMapper {
  mapToDomain(rawEntity: BookReadingRawEntity): BookReading;
}
