import { type FindBookshelvesByUserIdParams } from '@common/contracts';

import { type BookshelfDTO } from './schemas/bookshelfDto.js';
import {
  type CreateBookshelfBodyDTO,
  type CreateBookshelfResponseBodyDTO,
  createBookshelfBodyDTOSchema,
  createBookshelfResponseBodyDTOSchema,
} from './schemas/createBookshelfSchema.js';
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
  type UpdateBookshelfPathParamsDTO,
  type UpdateBookshelfBodyDTO,
  type UpdateBookshelfResponseBodyDTO,
  updateBookshelfBodyDTOSchema,
  updateBookshelfPathParamsDTOSchema,
  updateBookshelfResponseBodyDTOSchema,
} from './schemas/updateBookshelfSchema.js';
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
import { type UpdateBookshelfCommandHandler } from '../../../application/commandHandlers/updateBookshelfCommandHandler/updateBookshelfCommandHandler.js';
import { type FindBookshelfByIdQueryHandler } from '../../../application/queryHandlers/findBookshelfByIdQueryHandler/findBookshelfByIdQueryHandler.js';
import { type FindBookshelvesByUserIdQueryHandler } from '../../../application/queryHandlers/findBookshelvesByUserIdQueryHandler/findBookshelvesByUserIdQueryHandler.js';
import { type Bookshelf } from '../../../domain/entities/bookshelf/bookshelf.js';

interface MapBookshelfToBookshelfDTOPayload {
  readonly bookshelf: Bookshelf;
}

export class BookshelfHttpController implements HttpController {
  public readonly basePath = '/api/bookshelves';
  public readonly tags = ['Bookshelf'];

  public constructor(
    private readonly findBookshelvesByUserIdQueryHandler: FindBookshelvesByUserIdQueryHandler,
    private readonly findBookshelfByIdQueryHandler: FindBookshelfByIdQueryHandler,
    private readonly createBookshelfCommandHandler: CreateBookshelfCommandHandler,
    private readonly updateBookshelfCommandHandler: UpdateBookshelfCommandHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.get,
        path: '/user/:userId',
        handler: this.getUserBookshelves.bind(this),
        description: 'Get user bookshelves',
        schema: {
          request: {
            pathParams: findBookshelvesByUserIdPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findBookshelvesByUserIdResponseBodyDTOSchema,
              description: 'Found user bookshelves',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
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
              description: 'Found bookshelf',
            },
          },
        },
        description: 'Get a bookshelf by id',
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        handler: this.createBookshelf.bind(this),
        description: 'Create a bookshelf',
        schema: {
          request: {
            body: createBookshelfBodyDTOSchema,
          },
          response: {
            [HttpStatusCode.created]: {
              description: 'Bookshelf created',
              schema: createBookshelfResponseBodyDTOSchema,
            },
          },
        },
      }),
      new HttpRoute({
        method: HttpMethodName.patch,
        path: '/:bookshelfId',
        handler: this.updateBookshelf.bind(this),
        description: 'Update bookshelf',
        schema: {
          request: {
            body: updateBookshelfBodyDTOSchema,
            pathParams: updateBookshelfPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              description: 'Bookshelf updated',
              schema: updateBookshelfResponseBodyDTOSchema,
            },
          },
        },
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
        reason: 'User can only access their own bookshelves',
      });
    }

    const { bookshelves } = await this.findBookshelvesByUserIdQueryHandler.execute({
      userId,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: {
        data: bookshelves.map((bookshelf) => this.mapBookshelfToBookshelfDTO({ bookshelf })),
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
      body: this.mapBookshelfToBookshelfDTO({ bookshelf }),
    };
  }

  private async createBookshelf(
    request: HttpRequest<CreateBookshelfBodyDTO>,
  ): Promise<HttpCreatedResponse<CreateBookshelfResponseBodyDTO>> {
    const { userId: tokenUserId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { name, userId, address, imageUrl } = request.body;

    if (userId !== tokenUserId) {
      throw new ForbiddenAccessError({
        reason: 'User can only create bookshelves for themselves',
      });
    }

    const { bookshelf } = await this.createBookshelfCommandHandler.execute({
      name,
      userId,
      address,
      imageUrl,
    });

    return {
      statusCode: HttpStatusCode.created,
      body: this.mapBookshelfToBookshelfDTO({ bookshelf }),
    };
  }

  private async updateBookshelf(
    request: HttpRequest<UpdateBookshelfBodyDTO, null, UpdateBookshelfPathParamsDTO>,
  ): Promise<HttpOkResponse<UpdateBookshelfResponseBodyDTO>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { bookshelfId } = request.pathParams;

    const { name, address, imageUrl } = request.body;

    const { bookshelf } = await this.updateBookshelfCommandHandler.execute({
      id: bookshelfId,
      name,
      address,
      imageUrl,
      userId,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: this.mapBookshelfToBookshelfDTO({ bookshelf }),
    };
  }

  private mapBookshelfToBookshelfDTO(payload: MapBookshelfToBookshelfDTOPayload): BookshelfDTO {
    const { bookshelf } = payload;

    const bookshelfDTO: BookshelfDTO = {
      id: bookshelf.getId(),
      name: bookshelf.getName(),
      userId: bookshelf.getUserId(),
    };

    const address = bookshelf.getAddress();

    if (address) {
      bookshelfDTO.address = address;
    }

    const imageUrl = bookshelf.getImageUrl();

    if (imageUrl) {
      bookshelfDTO.imageUrl = imageUrl;
    }

    return bookshelfDTO;
  }
}
