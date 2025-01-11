import { type Genre } from '../../../../domain/entities/genre/genre.js';
import { type GenreDto } from '../genreDto.js';

export function mapGenreToDto(genre: Genre): GenreDto {
  return {
    id: genre.getId(),
    name: genre.getName(),
  };
}
