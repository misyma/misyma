import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { Genre } from '../../../domain/entities/genre/genre.js';
import { type GenreRepository } from '../../../domain/repositories/genreRepository/genreRepository.js';
import { symbols } from '../../../symbols.js';
import { GenreTestFactory } from '../../../tests/factories/genreTestFactory/genreTestFactory.js';
import { type GenreTestUtils } from '../../../tests/utils/genreTestUtils/genreTestUtils.js';
import { type GenreRawEntity } from '../../databases/bookDatabase/tables/genreTable/genreRawEntity.js';

describe('GenreRepositoryImpl', () => {
  let genreRepository: GenreRepository;

  let genreTestUtils: GenreTestUtils;

  const genreTestFactory = new GenreTestFactory();

  beforeEach(() => {
    const container = TestContainer.create();

    genreRepository = container.get<GenreRepository>(symbols.genreRepository);

    genreTestUtils = container.get<GenreTestUtils>(testSymbols.genreTestUtils);
  });

  afterEach(async () => {
    await genreTestUtils.truncate();

    await genreTestUtils.destroyDatabaseConnection();
  });

  describe('findAll', () => {
    it('returns an empty array - given no Genres exist', async () => {
      const res = await genreRepository.findAllGenres();

      expect(res.length).toBe(0);

      expect(res).toBeInstanceOf(Array);
    });

    it('returns all Genres', async () => {
      const createdGenres: GenreRawEntity[] = [];

      for (let i = 0; i < 50; i++) {
        const createdGenre = await genreTestUtils.createAndPersist();

        createdGenres.push(createdGenre);
      }

      const res = await genreRepository.findAllGenres();

      expect(res.length).toBe(createdGenres.length);

      expect(res).toBeInstanceOf(Array);
    });
  });

  describe('findById', () => {
    it('returns null - when Genre was not found', async () => {
      const res = await genreRepository.findGenre({ id: 'non-existing-id' });

      expect(res).toBeNull();
    });

    it('returns Genre', async () => {
      const createdGenre = await genreTestUtils.createAndPersist();

      const genre = await genreRepository.findGenre({ id: createdGenre.id });

      expect(genre).toBeInstanceOf(Genre);

      expect(genre?.getId()).toEqual(createdGenre.id);
    });
  });

  describe('findManyByIds', () => {
    it('returns an empty array - given no Genres found', async () => {
      const nonExistentIds = Array.from({ length: 5 }, () => Generator.uuid());

      const genres = await genreRepository.findGenresByIds({
        ids: nonExistentIds,
      });

      expect(genres.length).toBe(0);
    });

    it('returns Genres', async () => {
      const genre1 = await genreTestUtils.createAndPersist();

      const genre2 = await genreTestUtils.createAndPersist();

      const genre3 = await genreTestUtils.createAndPersist();

      const genre4 = await genreTestUtils.createAndPersist();

      const genres = await genreRepository.findGenresByIds({
        ids: [genre1.id, genre2.id, genre3.id, genre4.id],
      });

      expect(genres.length).toBe(4);
    });
  });

  describe('findByName', () => {
    it('returns null - when Genre was not found', async () => {
      const genre = await genreRepository.findGenre({
        name: 'non-existing-name',
      });

      expect(genre).toBeNull();
    });

    it('returns Genre', async () => {
      const genre = await genreTestUtils.createAndPersist();

      const result = await genreRepository.findGenre({
        name: genre.name,
      });

      expect(result).toBeInstanceOf(Genre);

      expect(result?.getName()).toEqual(genre.name);
    });
  });

  describe('Save', () => {
    it('creates Genre', async () => {
      const name = Generator.word();

      const genre = await genreRepository.saveGenre({
        genre: {
          name,
        },
      });

      expect(genre).toBeInstanceOf(Genre);

      expect(genre.getName()).toBe(name);

      const createdGenre = await genreTestUtils.findById(genre.getId());

      expect(createdGenre?.name).toBe(name);
    });

    it('throws an error while creating - when Genre with the same name already exists', async () => {
      const name = Generator.word();

      await genreRepository.saveGenre({
        genre: {
          name,
        },
      });

      await expect(
        async () =>
          await genreRepository.saveGenre({
            genre: {
              name,
            },
          }),
      ).toThrowErrorInstance({
        instance: RepositoryError,
        context: {
          entity: 'Genre',
          operation: 'create',
        },
      });
    });

    it('updates Genre', async () => {
      const genreRawEntity = await genreTestUtils.createAndPersist();

      const newName = Generator.words(2);

      const genre = genreTestFactory.create(genreRawEntity);

      genre.setName({ name: newName });

      const upatedGenre = await genreRepository.saveGenre({
        genre,
      });

      expect(upatedGenre).toBeInstanceOf(Genre);

      expect(upatedGenre.getName()).toBe(newName);

      const persistedGenre = await genreTestUtils.findById(genreRawEntity.id);

      expect(persistedGenre).not.toBeNull();

      expect(persistedGenre?.name).toBe(newName);
    });

    it('throws an error while updating - when Genre with the same name already exists', async () => {
      const createdGenre1 = await genreTestUtils.createAndPersist();

      const createdGenre2 = await genreTestUtils.createAndPersist();

      await expect(
        async () =>
          await genreRepository.saveGenre({
            genre: new Genre({
              id: createdGenre1.id,
              name: createdGenre2.name,
            }),
          }),
      ).toThrowErrorInstance({
        instance: RepositoryError,
        context: {
          entity: 'Genre',
          operation: 'update',
        },
      });
    });
  });

  describe('delete', () => {
    it('deletes Genre', async () => {
      const createdGenre = await genreTestUtils.createAndPersist();

      await genreRepository.deleteGenre({ id: createdGenre.id });

      const deletedGenre = await genreTestUtils.findById(createdGenre.id);

      expect(deletedGenre).toBeNull();
    });
  });
});
