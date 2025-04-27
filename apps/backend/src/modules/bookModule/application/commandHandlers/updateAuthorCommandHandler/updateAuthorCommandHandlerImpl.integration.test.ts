import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { symbols } from '../../../symbols.js';
import { type AuthorTestUtils } from '../../../tests/utils/authorTestUtils/authorTestUtils.js';

import { type UpdateAuthorCommandHandler } from './updateAuthorCommandHandler.js';

describe('UpdateAuthorCommandHandler', () => {
  let commandHandler: UpdateAuthorCommandHandler;

  let databaseClient: DatabaseClient;

  let authorTestUtils: AuthorTestUtils;

  beforeEach(async () => {
    const container = await TestContainer.create();

    commandHandler = container.get<UpdateAuthorCommandHandler>(symbols.updateAuthorCommandHandler);

    databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

    authorTestUtils = container.get<AuthorTestUtils>(testSymbols.authorTestUtils);

    await authorTestUtils.truncate();
  });

  afterEach(async () => {
    await authorTestUtils.truncate();

    await databaseClient.destroy();
  });

  it('throws an error - when Author does not exist', async () => {
    const authorId = Generator.uuid();

    try {
      await commandHandler.execute({
        id: authorId,
        name: Generator.words(2),
      });
    } catch (error) {
      expect(error).toBeInstanceOf(OperationNotValidError);

      expect((error as OperationNotValidError).context).toEqual({
        reason: 'Author does not exist.',
        id: authorId,
      });

      return;
    }

    expect.fail();
  });

  it('throws an error - when Author with given name already exists', async () => {
    const preExistingAuthor = await authorTestUtils.createAndPersist();

    const secondAuthor = await authorTestUtils.createAndPersist();

    try {
      await commandHandler.execute({
        id: preExistingAuthor.id,
        name: secondAuthor.name,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ResourceAlreadyExistsError);

      expect((error as ResourceAlreadyExistsError).context).toEqual({
        resource: 'Author',
        id: secondAuthor.id,
        name: secondAuthor.name,
      });

      return;
    }

    expect.fail();
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
