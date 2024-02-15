import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Generator, SpyFactory } from '@common/tests';

import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { RepositoryError } from '../../../../../common/errors/common/repositoryError.js';
import { coreSymbols } from '../../../../../core/symbols.js';
import {
  type LogPayload,
  type LoggerService,
} from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { Genre } from '../../../domain/entities/genre/genre.js';
import { type GenreRepository } from '../../../domain/repositories/genreRepository/genreRepository.js';
import { symbols } from '../../../symbols.js';
import { type GenreTestUtils } from '../../../tests/utils/genreTestUtils/genreTestUtils.js';
import { type GenreRawEntity } from '../../databases/bookDatabase/tables/genreTable/genreRawEntity.js';

describe('GenreRepositoryImpl', () => {
  let genreRepository: GenreRepository;

  let genreTestUtils: GenreTestUtils;

  let loggerService: LoggerService;

  const spyFactory = new SpyFactory(vi);

  let logErrorSpy: MockInstance<[payload: LogPayload], void>;

  beforeEach(() => {
    const container = TestContainer.create();

    genreRepository = container.get<GenreRepository>(symbols.genreRepository);

    genreTestUtils = container.get<GenreTestUtils>(testSymbols.genreTestUtils);

    loggerService = container.get<LoggerService>(coreSymbols.loggerService);

    logErrorSpy = spyFactory.create(loggerService, 'error');
  });

  afterEach(async () => {
    await genreTestUtils.truncate();
  });

  describe('findAll', () => {
    it('returns an empty array - given no Genres exist', async () => {
      const res = await genreRepository.findAll();

      expect(res.length).toBe(0);

      expect(res).toBeInstanceOf(Array);
    });

    it('returns all Genres', async () => {
      const createdGenres: GenreRawEntity[] = [];

      for (let i = 0; i < 50; i++) {
        const createdGenre = await genreTestUtils.createAndPersist();

        createdGenres.push(createdGenre);
      }

      const res = await genreRepository.findAll();

      expect(res.length).toBe(createdGenres.length);

      expect(res).toBeInstanceOf(Array);
    });
  });

  describe('findById', () => {
    it('returns null - when Genre was not found', async () => {
      const res = await genreRepository.findById({ id: 'non-existing-id' });

      expect(res).toBeNull();
    });

    it('returns Genre', async () => {
      const createdGenre = await genreTestUtils.createAndPersist();

      const res = await genreRepository.findById({ id: createdGenre.id });

      expect(res).not.toBeNull();

      expect(res).toBeInstanceOf(Genre);

      expect(res?.getState()).toEqual(createdGenre);
    });
  });

  describe('create', () => {
    it('creates Genre', async () => {
      const name = Generator.word();

      const res = await genreRepository.create(name);

      expect(res).toBeInstanceOf(Genre);

      expect(res.getState().name).toBe(name);

      const createdGenre = await genreTestUtils.findById(res.getState().id);

      expect(createdGenre).not.toBeNull();

      expect(createdGenre).toEqual(res.getState());
    });

    it('throws an error - when Genre with the same name already exists', async () => {
      const name = Generator.word();

      await genreRepository.create(name);

      await expect(async () => await genreRepository.create(name)).toThrowErrorInstance({
        instance: RepositoryError,
        context: {
          entity: 'Genre',
          operation: 'create',
        },
      });

      expect(logErrorSpy).toHaveBeenCalledOnce();

      expect(logErrorSpy).toHaveBeenCalledWith({
        message: expect.any(String),
        context: {
          operation: 'create',
          repository: 'GenreRepositoryImpl',
          stack: expect.anything(),
        },
      });
    });
  });

  describe('update', () => {
    it('updates Genre', async () => {
      const createdGenre = await genreTestUtils.createAndPersist();

      const newName = Generator.words(2);

      const res = await genreRepository.update(
        new Genre({
          id: createdGenre.id,
          name: newName,
        }),
      );

      expect(res).toBeInstanceOf(Genre);

      expect(res.getName()).toBe(newName);

      const persistedGenre = await genreTestUtils.findById(createdGenre.id);

      expect(persistedGenre).not.toBeNull();

      expect(persistedGenre?.name).toBe(newName);
    });

    it('throws an error - when Genre with the same name already exists', async () => {
      const createdGenre1 = await genreTestUtils.createAndPersist();

      const createdGenre2 = await genreTestUtils.createAndPersist();

      await expect(
        async () =>
          await genreRepository.update(
            new Genre({
              id: createdGenre1.id,
              name: createdGenre2.name,
            }),
          ),
      ).toThrowErrorInstance({
        instance: RepositoryError,
        context: {
          entity: 'Genre',
          operation: 'update',
        },
      });

      expect(logErrorSpy).toHaveBeenCalledOnce();

      expect(logErrorSpy).toHaveBeenCalledWith({
        message: expect.any(String),
        context: {
          operation: 'update',
          repository: 'GenreRepositoryImpl',
          stack: expect.anything(),
        },
      });
    });
  });

  describe('delete', () => {
    it('deletes Genre', async () => {
      const createdGenre = await genreTestUtils.createAndPersist();

      await genreRepository.delete(new Genre(createdGenre));

      const deletedGenre = await genreTestUtils.findById(createdGenre.id);

      expect(deletedGenre).toBeNull();
    });
  });
});
