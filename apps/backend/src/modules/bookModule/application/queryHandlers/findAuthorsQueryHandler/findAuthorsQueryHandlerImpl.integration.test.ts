import { beforeEach, afterEach, describe, expect, it } from 'vitest';

import { type FindAuthorsQueryHandler } from './findAuthorsQueryHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { symbols } from '../../../symbols.js';
import { type AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';

describe('FindAuthorsQueryHandlerImpl', () => {
  let queryHandler: FindAuthorsQueryHandler;

  let authorTestUtils: AuthorTestUtils;

  beforeEach(async () => {
    const container = TestContainer.create();

    queryHandler = container.get<FindAuthorsQueryHandler>(symbols.findAuthorsQueryHandler);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    await authorTestUtils.truncate();
  });

  afterEach(async () => {
    await authorTestUtils.truncate();
  });

  it('returns Authors', async () => {
    const author1 = await authorTestUtils.createAndPersist();

    const { authors, total } = await queryHandler.execute({
      name: author1.name.substring(0, 3),
      page: 1,
      pageSize: 10,
    });

    expect(authors).toHaveLength(1);

    expect(authors[0]?.getId()).toEqual(author1.id);

    expect(total).toEqual(1);
  });
});
