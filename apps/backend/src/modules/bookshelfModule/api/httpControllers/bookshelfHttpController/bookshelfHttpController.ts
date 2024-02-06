import { type FindBookshelvesByUserIdParams } from '@common/contracts';

import {
  type CreateBookshelfBodyDTO,
  type CreateBookshelfResponseBodyDTO,
  createBookshelfBodyDTOSchema,
  createBookshelfResponseBodyDTOSchema,
} from './schemas/createBookshelfSchema.js';
import { type BookshelfDTO } from './schemas/dtos/bookshelfDto.js';
import {
  type FindBookshelfByIdResponseBodyDTO,
  type FindBookshelfByIdPathParamsDTO,
  findBookshelfByIdResponseBodyDTOSchema,
  findBookshelfByIdPathParamsDTOSchema,
} from './schemas/findBookshelfByIdSchema.js';
import {
  type FindBookshelvesByUserIdResponseBodyDTO,
  findBookshelvesByUserIdResponseBodyDTOSchema,
  findBookshelvesByUserIdPathParamsDTOSchema,
} from './schemas/findBookshelvesByUserIdSchema.js';
import {
  type UpdateBookshelfNamePathParamsDTO,
  type UpdateBookshelfNameBodyDTO,
  type UpdateBookshelfNameResponseBodyDTO,
  updateBookshelfNameBodyDTOSchema,
  updateBookshelfNamePathParamsDTOSchema,
  updateBookshelfNameResponseBodyDTOSchema,
} from './schemas/updateBookshelfNameSchema.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { HttpMethodName } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import { type HttpCreatedResponse, type HttpOkResponse } from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../../../../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { ForbiddenAccessError } from '../../../../authModule/application/errors/forbiddenAccessError.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type CreateBookshelfCommandHandler } from '../../../application/commandHandlers/createBookshelfCommandHandler/createBookshelfCommandHandler.js';
import { type UpdateBookshelfNameCommandHandler } from '../../../application/commandHandlers/updateBookshelfNameCommandHandler/updateBookshelfNameCommandHandler.js';
import { type FindBookshelfByIdQueryHandler } from '../../../application/queryHandlers/findBookshelfByIdQueryHandler/findBookshelfByIdQueryHandler.js';
import { type FindBookshelvesByUserIdQueryHandler } from '../../../application/queryHandlers/findBookshelvesByUserIdQueryHandler/findBookshelvesByUserIdQueryHandler.js';
import { type Bookshelf } from '../../../domain/entities/bookshelf/bookshelf.js';

interface MapBookshelfToBookshelfDTOPayload {
  bookshelf: Bookshelf;
}

export class BookshelfHttpController implements HttpController {
  public readonly basePath = '/api/bookshelves';

  public constructor(
    private readonly findBookshelvesByUserIdQueryHandler: FindBookshelvesByUserIdQueryHandler,
    private readonly findBookshelfByIdQueryHandler: FindBookshelfByIdQueryHandler,
    private readonly createBookshelfCommandHandler: CreateBookshelfCommandHandler,
    private readonly updateBookshelfNameCommandHandler: UpdateBookshelfNameCommandHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.get,
        path: '/user/:userId',
        handler: this.getUserBookshelves.bind(this),
        description: 'Get user bookshelves.',
        schema: {
          request: {
            pathParams: findBookshelvesByUserIdPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findBookshelvesByUserIdResponseBodyDTOSchema,
              description: 'Found user bookshelves.',
            },
          },
        },
        tags: ['Bookshelf'],
        securityMode: SecurityMode.bearer,
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':id',
        handler: this.getBookshelf.bind(this),
        schema: {
          request: {
            pathParams: findBookshelfByIdPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findBookshelfByIdResponseBodyDTOSchema,
              description: 'Found bookshelf.',
            },
          },
        },
        description: 'Get a bookshelf by id.',
        tags: ['Bookshelf'],
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'create',
        handler: this.createBookshelf.bind(this),
        description: 'Create a bookshelf.',
        schema: {
          request: {
            body: createBookshelfBodyDTOSchema,
          },
          response: {
            [HttpStatusCode.created]: {
              description: 'Bookshelf created.',
              schema: createBookshelfResponseBodyDTOSchema,
            },
          },
        },
        tags: ['Bookshelf'],
      }),
      new HttpRoute({
        method: HttpMethodName.patch,
        path: '/update-name/:bookshelfId',
        handler: this.updateBookshelfName.bind(this),
        description: 'Update bookshelf name.',
        schema: {
          request: {
            body: updateBookshelfNameBodyDTOSchema,
            pathParams: updateBookshelfNamePathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              description: 'Bookshelf name updated.',
              schema: updateBookshelfNameResponseBodyDTOSchema,
            },
          },
        },
        tags: ['Bookshelf'],
      }),
    ];
  }

  private async getUserBookshelves(
    request: HttpRequest<null, null, FindBookshelvesByUserIdParams>,
  ): Promise<HttpOkResponse<FindBookshelvesByUserIdResponseBodyDTO>> {
    const { userId: tokenUserId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { userId } = request.pathParams;

    if (userId !== tokenUserId) {
      throw new ForbiddenAccessError({
        reason: 'User can only access their own bookshelves.',
      });
    }

    const { bookshelves } = await this.findBookshelvesByUserIdQueryHandler.execute({
      userId,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: {
        bookshelves: bookshelves.map((bookshelf) => this.mapBookshelfToBookshelfDTO({ bookshelf })),
      },
    };
  }

  private async getBookshelf(
    request: HttpRequest<null, null, FindBookshelfByIdPathParamsDTO>,
  ): Promise<HttpOkResponse<FindBookshelfByIdResponseBodyDTO>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { id } = request.pathParams;

    const { bookshelf } = await this.findBookshelfByIdQueryHandler.execute({
      id,
      userId,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: {
        bookshelf: this.mapBookshelfToBookshelfDTO({ bookshelf }),
      },
    };
  }

  private async createBookshelf(
    request: HttpRequest<CreateBookshelfBodyDTO>,
  ): Promise<HttpCreatedResponse<CreateBookshelfResponseBodyDTO>> {
    const { userId: tokenUserId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { name, userId, addressId } = request.body;

    if (userId !== tokenUserId) {
      throw new ForbiddenAccessError({
        reason: 'User can only create bookshelves for themselves.',
      });
    }

    const { bookshelf } = await this.createBookshelfCommandHandler.execute({
      name,
      userId,
      addressId,
    });

    return {
      statusCode: HttpStatusCode.created,
      body: {
        bookshelf: this.mapBookshelfToBookshelfDTO({ bookshelf }),
      },
    };
  }

  private async updateBookshelfName(
    request: HttpRequest<UpdateBookshelfNameBodyDTO, null, UpdateBookshelfNamePathParamsDTO>,
  ): Promise<HttpOkResponse<UpdateBookshelfNameResponseBodyDTO>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { bookshelfId } = request.pathParams;

    const { name } = request.body;

    const { bookshelf } = await this.updateBookshelfNameCommandHandler.execute({
      id: bookshelfId,
      name,
      userId,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: {
        bookshelf: this.mapBookshelfToBookshelfDTO({ bookshelf }),
      },
    };
  }

  private mapBookshelfToBookshelfDTO(payload: MapBookshelfToBookshelfDTOPayload): BookshelfDTO {
    const { bookshelf } = payload;

    return {
      id: bookshelf.getId(),
      name: bookshelf.getName(),
      userId: bookshelf.getUserId(),
      addressId: bookshelf.getAddressId() as string,
    };
  }
}
