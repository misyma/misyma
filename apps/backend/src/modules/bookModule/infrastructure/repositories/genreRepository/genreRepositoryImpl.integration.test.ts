import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import { type DatabaseClient } from '../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { Genre } from '../../../domain/entities/genre/genre.js';
import { type GenreRepository } from '../../../domain/repositories/genreRepository/genreRepository.js';
import { symbols } from '../../../symbols.js';
import { GenreTestFactory } from '../../../tests/factories/genreTestFactory/genreTestFactory.js';
import { type GenreTestUtils } from '../../../tests/utils/genreTestUtils/genreTestUtils.js';
import { type GenreRawEntity } from '../../databases/bookDatabase/tables/genreTable/genreRawEntity.js';

describe('GenreRepositoryImpl', () => {
  let genreRepository: GenreRepository;

  let databaseClient: DatabaseClient;

  let genreTestUtils: GenreTestUtils;

  const genreTestFactory = new GenreTestFactory();

  beforeEach(async () => {
    const container = TestContainer.create();

    genreRepository = container.get<GenreRepository>(symbols.genreRepository);

    databaseClient = container.get<DatabaseClient>(coreSymbols.databaseClient);

    genreTestUtils = container.get<GenreTestUtils>(testSymbols.genreTestUtils);

    await genreTestUtils.truncate();
  });

  afterEach(async () => {
    await genreTestUtils.truncate();

    await databaseClient.destroy();
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

  describe('findGenres', () => {
    it('returns an empty array - given no Genres found', async () => {
      const nonExistentIds = Array.from({ length: 5 }, () => Generator.uuid());

      const genres = await genreRepository.findGenres({
        ids: nonExistentIds,
        page: 1,
        pageSize: 10,
      });

      expect(genres.length).toBe(0);
    });

    it('returns Genres by ids', async () => {
      const genre1 = await genreTestUtils.createAndPersist();

      const genre2 = await genreTestUtils.createAndPersist();

      const genre3 = await genreTestUtils.createAndPersist();

      const genre4 = await genreTestUtils.createAndPersist();

      const genres = await genreRepository.findGenres({
        ids: [genre1.id, genre2.id, genre3.id, genre4.id],
        page: 1,
        pageSize: 10,
      });

      expect(genres.length).toBe(4);
    });

    it('returns all Genres', async () => {
      const createdGenres: GenreRawEntity[] = [];

      for (let i = 0; i < 8; i++) {
        const createdGenre = await genreTestUtils.createAndPersist();

        createdGenres.push(createdGenre);
      }

      const genres = await genreRepository.findGenres({
        page: 1,
        pageSize: 10,
      });

      expect(genres.length).toBe(createdGenres.length);

      expect(genres).toBeInstanceOf(Array);
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

      try {
        await genreRepository.saveGenre({
          genre: {
            name,
          },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(RepositoryError);

        expect((error as RepositoryError).context).toEqual({
          entity: 'Genre',
          operation: 'create',
          originalError: expect.any(Error),
        });

        return;
      }

      expect.fail();
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

      try {
        await genreRepository.saveGenre({
          genre: new Genre({
            id: createdGenre1.id,
            name: createdGenre2.name,
          }),
        });
      } catch (error) {
        expect(error).toBeInstanceOf(RepositoryError);

        expect((error as RepositoryError).context).toEqual({
          entity: 'Genre',
          operation: 'update',
          originalError: expect.any(Error),
        });

        return;
      }

      expect.fail();
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
