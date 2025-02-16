import { type Author } from '../../../../domain/entities/author/author.js';
import { type AuthorDto } from '../authorDto.js';

export function mapAuthorToDto(author: Author): AuthorDto {
  return {
    id: author.getId(),
    name: author.getName(),
    isApproved: author.getIsApproved(),
    createdAt: author.getCreatedAt().toISOString(),
  };
}
