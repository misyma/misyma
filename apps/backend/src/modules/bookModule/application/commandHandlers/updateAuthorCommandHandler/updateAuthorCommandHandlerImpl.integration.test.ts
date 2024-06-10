import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type UpdateAuthorCommandHandler } from './updateAuthorCommandHandler.js';
import { testSymbols } from '../../../../../../tests/container/symbols.js';
import { TestContainer } from '../../../../../../tests/container/testContainer.js';
import { Generator } from '../../../../../../tests/generator.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { symbols } from '../../../symbols.js';
import { type AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';

describe('UpdateAuthorCommandHandler', () => {
  let commandHandler: UpdateAuthorCommandHandler;

  let authorTestUtils: AuthorTestUtils;

  beforeEach(async () => {
    const container = TestContainer.create();

    commandHandler = container.get<UpdateAuthorCommandHandler>(symbols.updateAuthorCommandHandler);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    await authorTestUtils.truncate();
  });

  afterEach(async () => {
    await authorTestUtils.truncate();
  });

  it('throws an error - when Author does not exist', async () => {
    const authorId = Generator.uuid();

    await expect(
      async () =>
        await commandHandler.execute({
          id: authorId,
          name: Generator.words(2),
        }),
    ).toThrowErrorInstance({
      instance: OperationNotValidError,
      context: {
        reason: 'Author does not exist.',
        id: authorId,
      },
    });
  });

  it('throws an error - when Author with given name already exists', async () => {
    const preExistingAuthor = await authorTestUtils.createAndPersist();

    const secondAuthor = await authorTestUtils.createAndPersist();

    await expect(
      async () =>
        await commandHandler.execute({
          id: preExistingAuthor.id,
          name: secondAuthor.name,
        }),
    ).toThrowErrorInstance({
      instance: ResourceAlreadyExistsError,
      context: {
        resource: 'Author',
        id: secondAuthor.id,
        name: secondAuthor.name,
      },
    });
  });

  it('updates author name', async () => {
    const author = await authorTestUtils.createAndPersist();

    const newName = Generator.words(2);

    const updatedAuthor = await commandHandler.execute({
      id: author.id,
      name: newName,
    });

    expect(updatedAuthor.author.getName()).toEqual(newName);
  });

  it(`updates author's isApproved`, async () => {
    const author = await authorTestUtils.createAndPersist();

    const isApproved = Generator.boolean();

    const updatedAuthor = await commandHandler.execute({
      id: author.id,
      isApproved,
    });

    expect(updatedAuthor.author.getIsApproved()).toEqual(isApproved);
  });
});
