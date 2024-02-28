import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { type CreateAuthorRequestBody } from '@common/contracts';
import { Generator } from '@common/tests';

import { type AuthorService } from './author/authorService.js';
import { TestApplication } from './testApplication/testApplication.js';
import { HttpStatusCode } from '../../src/common/types/http/httpStatusCode.js';
import { type TokenService } from '../../src/modules/authModule/application/services/tokenService/tokenService.js';
import { authSymbols } from '../../src/modules/authModule/symbols.js';
import { type UserTestUtils } from '../../src/modules/userModule/tests/utils/userTestUtils/userTestUtils.js';
import { testSymbols } from '../container/symbols.js';

describe('Author', () => {
  let application: TestApplication;

  let authorService: AuthorService;

  let userTestUtils: UserTestUtils;

  let tokenService: TokenService;

  const expiresIn = 86400;

  beforeAll(async () => {
    application = new TestApplication();

    const container = application.createContainer();

    authorService = container.get<AuthorService>(testSymbols.authorService);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    tokenService = container.get<TokenService>(authSymbols.tokenService);

    await application.start();
  });

  afterAll(async () => {
    await application.stop();
  });

  describe('GET /api/authors/:id', async () => {
    it('returns an Author', async () => {
      const user = await userTestUtils.createAndPersist();

      const token = tokenService.createToken({
        data: {
          userId: user.id,
        },
        expiresIn,
      });

      const author = await authorService.createAuthor({
        author: {
          firstName: Generator.firstName(),
          lastName: Generator.lastName(),
        },
        bearerToken: token,
      });

      const response = await authorService.findAuthor({
        authorId: author.id,
        bearerToken: token,
      });

      expect(response).toMatchObject({
        id: expect.any(String),
        firstName: author.firstName,
        lastName: author.lastName,
      });
    });
  });

  describe('POST /api/authors/create', () => {
    it('creates an Author', async () => {
      const author: CreateAuthorRequestBody = {
        firstName: Generator.firstName(),
        lastName: Generator.lastName(),
      };

      const user = await userTestUtils.createAndPersist();

      const token = tokenService.createToken({
        data: {
          userId: user.id,
        },
        expiresIn,
      });

      const response = await authorService.createAuthor({
        author,
        bearerToken: token,
      });

      expect(response).toMatchObject({
        id: expect.any(String),
        firstName: author.firstName,
        lastName: author.lastName,
      });
    });
  });

  describe('DELETE /api/authors/:id', () => {
    it('deletes an Author', async () => {
      const author: CreateAuthorRequestBody = {
        firstName: Generator.firstName(),
        lastName: Generator.lastName(),
      };

      const user = await userTestUtils.createAndPersist();

      const token = tokenService.createToken({
        data: {
          userId: user.id,
        },
        expiresIn,
      });

      const createdAuthor = await authorService.createAuthor({
        author,
        bearerToken: token,
      });

      const response = await authorService.deleteAuthor({
        authorId: createdAuthor.id,
        bearerToken: token,
      });

      expect(response).toBe(HttpStatusCode.noContent);
    });
  });
});
