import { beforeEach, describe, expect, it } from 'vitest';

import { type FindAuthorsByIdsQueryHandler } from './findAuthorsByIdsQueryHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { Author } from '../../../domain/entities/author/author.js';
import { symbols } from '../../../symbols.js';
import { type AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';

describe('FindAuthorsByIdsQueryHandlerImpl', () => {
  let queryHandler: FindAuthorsByIdsQueryHandler;

  let authorTestUtils: AuthorTestUtils;

  beforeEach(() => {
    const container = TestContainer.create();

    queryHandler = container.get<FindAuthorsByIdsQueryHandler>(symbols.findAuthorsByIdsQueryHandler);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);
  });

  it('throws an error - when an Author was not found', async () => {
    const nonExistentAuthorIds = [Generator.uuid(), Generator.uuid()];

    await expect(
      async () =>
        await queryHandler.execute({
          authorIds: nonExistentAuthorIds,
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        resource: 'Author',
        missingIds: nonExistentAuthorIds,
      },
    });
  });

  it('throws an error - when one of the Authors was not found', async () => {
    const author = await authorTestUtils.createAndPersist();

    const nonExistentAuthorId = Generator.uuid();

    await expect(
      async () =>
        await queryHandler.execute({
          authorIds: [author.id, nonExistentAuthorId],
        }),
    ).toThrowErrorInstance({
      instance: ResourceNotFoundError,
      context: {
        resource: 'Author',
        missingIds: [nonExistentAuthorId],
      },
    });
  });

  it('returns Authors', async () => {
    const author1 = await authorTestUtils.createAndPersist();

    const author2 = await authorTestUtils.createAndPersist();

    const { authors } = await queryHandler.execute({
      authorIds: [author1.id, author2.id],
    });

    expect(authors).toHaveLength(2);

    authors.forEach((author) => {
      expect(author).toBeInstanceOf(Author);

      expect(author.getId()).oneOf([author1.id, author2.id]);

      expect(author.getName()).oneOf([author1.name, author2.name]);
    });
  });
});
