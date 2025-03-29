import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { httpMethodNames } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import {
  type HttpNoContentResponse,
  type HttpCreatedResponse,
  type HttpOkResponse,
} from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { httpStatusCodes } from '../../../../../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type CreateBookshelfCommandHandler } from '../../../application/commandHandlers/createBookshelfCommandHandler/createBookshelfCommandHandler.js';
import { type DeleteBookshelfCommandHandler } from '../../../application/commandHandlers/deleteBookshelfCommandHandler/deleteBookshelfCommandHandler.js';
import { type UpdateBookshelfCommandHandler } from '../../../application/commandHandlers/updateBookshelfCommandHandler/updateBookshelfCommandHandler.js';
import { type UploadBookshelfImageCommandHandler } from '../../../application/commandHandlers/uploadBookshelfImageCommandHandler/uploadBookshelfImageCommandHandler.js';
import { type FindBookshelfByIdQueryHandler } from '../../../application/queryHandlers/findBookshelfByIdQueryHandler/findBookshelfByIdQueryHandler.js';
import { type FindBookshelvesQueryHandler } from '../../../application/queryHandlers/findBookshelvesQueryHandler/findBookshelvesQueryHandler.js';
import { type Bookshelf } from '../../../domain/entities/bookshelf/bookshelf.js';

import { type BookshelfDto } from './schemas/bookshelfDto.js';
import {
  type CreateBookshelfBodyDto,
  type CreateBookshelfResponseBodyDto,
  createBookshelfBodyDtoSchema,
  createBookshelfResponseBodyDtoSchema,
} from './schemas/createBookshelfSchema.js';
import {
  type DeleteBookshelfPathParamsDto,
  type DeleteBookshelfResponseBodyDto,
  deleteBookshelfPathParamsDtoSchema,
  deleteBookshelfResponseBodyDtoSchema,
  deleteBookshelfQueryParamsDtoSchema,
  type DeleteBookshelfQueryParamsDto,
} from './schemas/deleteBookshelfSchema.js';
import {
  type FindBookshelfResponseBodyDto,
  type FindBookshelfPathParamsDto,
  findBookshelfResponseBodyDtoSchema,
  findBookshelfPathParamsDtoSchema,
} from './schemas/findBookshelfSchema.js';
import {
  type FindBookshelvesResponseBodyDto,
  findBookshelvesResponseBodyDtoSchema,
  type FindBookshelvesQueryParamsDto,
  findBookshelvesQueryParamsDtoSchema,
} from './schemas/findBookshelvesSchema.js';
import {
  type UpdateBookshelfPathParamsDto,
  type UpdateBookshelfBodyDto,
  type UpdateBookshelfResponseBodyDto,
  updateBookshelfBodyDtoSchema,
  updateBookshelfPathParamsDtoSchema,
  updateBookshelfResponseBodyDtoSchema,
} from './schemas/updateBookshelfSchema.js';
import {
  uploadBookshelfImagePathParamsDtoSchema,
  uploadBookshelfImageResponseBodyDtoSchema,
  type UploadBookshelfImagePathParamsDto,
  type UploadBookshelfImageResponseBodyDtoSchema,
} from './schemas/uploadBookshelfImageSchema.js';

export class BookshelfHttpController implements HttpController {
  public readonly basePath = '/bookshelves';
  public readonly tags = ['Bookshelf'];

  public constructor(
    private readonly findBookshelvesQueryHandler: FindBookshelvesQueryHandler,
    private readonly findBookshelfByIdQueryHandler: FindBookshelfByIdQueryHandler,
    private readonly createBookshelfCommandHandler: CreateBookshelfCommandHandler,
    private readonly updateBookshelfCommandHandler: UpdateBookshelfCommandHandler,
    private readonly uploadBookshelfImageCommandHandler: UploadBookshelfImageCommandHandler,
    private readonly deleteBookshelfCommandHandler: DeleteBookshelfCommandHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: httpMethodNames.get,
        handler: this.getBookshelves.bind(this),
        description: 'Get user bookshelves',
        schema: {
          request: {
            queryParams: findBookshelvesQueryParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              schema: findBookshelvesResponseBodyDtoSchema,
              description: 'Found user bookshelves',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
      }),
      new HttpRoute({
        method: httpMethodNames.get,
        path: ':bookshelfId',
        handler: this.getBookshelf.bind(this),
        schema: {
          request: {
            pathParams: findBookshelfPathParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              schema: findBookshelfResponseBodyDtoSchema,
              description: 'Found bookshelf',
            },
          },
        },
        description: 'Get a bookshelf by id',
        securityMode: SecurityMode.bearerToken,
      }),
      new HttpRoute({
        method: httpMethodNames.post,
        handler: this.createBookshelf.bind(this),
        description: 'Create a bookshelf',
        schema: {
          request: {
            body: createBookshelfBodyDtoSchema,
          },
          response: {
            [httpStatusCodes.created]: {
              description: 'Bookshelf created',
              schema: createBookshelfResponseBodyDtoSchema,
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
      }),
      new HttpRoute({
        method: httpMethodNames.patch,
        path: '/:bookshelfId',
        handler: this.updateBookshelf.bind(this),
        description: 'Update bookshelf',
        schema: {
          request: {
            body: updateBookshelfBodyDtoSchema,
            pathParams: updateBookshelfPathParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              description: 'Bookshelf updated',
              schema: updateBookshelfResponseBodyDtoSchema,
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
      }),
      new HttpRoute({
        method: httpMethodNames.patch,
        path: ':bookshelfId/images',
        description: "Upload bookshelf's image",
        handler: this.uploadBookshelfImage.bind(this),
        schema: {
          request: {
            pathParams: uploadBookshelfImagePathParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              description: "Bookshelf's image uploaded",
              schema: uploadBookshelfImageResponseBodyDtoSchema,
            },
          },
        },
      }),
      new HttpRoute({
        method: httpMethodNames.delete,
        path: '/:bookshelfId',
        handler: this.deleteBookshelf.bind(this),
        description: 'Delete bookshelf',
        schema: {
          request: {
            pathParams: deleteBookshelfPathParamsDtoSchema,
            queryParams: deleteBookshelfQueryParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.noContent]: {
              description: 'Bookshelf deleted',
              schema: deleteBookshelfResponseBodyDtoSchema,
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
      }),
    ];
  }

  private async getBookshelves(
    request: HttpRequest<undefined, FindBookshelvesQueryParamsDto, undefined>,
  ): Promise<HttpOkResponse<FindBookshelvesResponseBodyDto>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { page = 1, pageSize = 10, sortDate, name } = request.queryParams;

    const { bookshelves, total } = await this.findBookshelvesQueryHandler.execute({
      userId,
      name,
      page,
      pageSize,
      sortDate,
    });

    return {
      statusCode: httpStatusCodes.ok,
      body: {
        data: bookshelves.map((bookshelf) => this.mapBookshelfToDto(bookshelf)),
        metadata: {
          page,
          pageSize,
          total,
        },
      },
    };
  }

  private async getBookshelf(
    request: HttpRequest<undefined, undefined, FindBookshelfPathParamsDto>,
  ): Promise<HttpOkResponse<FindBookshelfResponseBodyDto>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { bookshelfId } = request.pathParams;

    const { bookshelf } = await this.findBookshelfByIdQueryHandler.execute({
      bookshelfId,
      userId,
    });

    return {
      statusCode: httpStatusCodes.ok,
      body: this.mapBookshelfToDto(bookshelf),
    };
  }

  private async createBookshelf(
    request: HttpRequest<CreateBookshelfBodyDto>,
  ): Promise<HttpCreatedResponse<CreateBookshelfResponseBodyDto>> {
    const { name, imageUrl } = request.body;

    const { userId } = await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { bookshelf } = await this.createBookshelfCommandHandler.execute({
      name,
      imageUrl,
      userId,
    });

    return {
      statusCode: httpStatusCodes.created,
      body: this.mapBookshelfToDto(bookshelf),
    };
  }

  private async updateBookshelf(
    request: HttpRequest<UpdateBookshelfBodyDto, undefined, UpdateBookshelfPathParamsDto>,
  ): Promise<HttpOkResponse<UpdateBookshelfResponseBodyDto>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { bookshelfId } = request.pathParams;

    const { name, imageUrl } = request.body;

    const { bookshelf } = await this.updateBookshelfCommandHandler.execute({
      bookshelfId,
      userId,
      name,
      imageUrl,
    });

    return {
      statusCode: httpStatusCodes.ok,
      body: this.mapBookshelfToDto(bookshelf),
    };
  }

  private async uploadBookshelfImage(
    request: HttpRequest<undefined, undefined, UploadBookshelfImagePathParamsDto>,
  ): Promise<HttpOkResponse<UploadBookshelfImageResponseBodyDtoSchema>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { bookshelfId } = request.pathParams;

    if (!request.file) {
      throw new OperationNotValidError({
        reason: 'No file attached',
      });
    }

    const { bookshelf } = await this.uploadBookshelfImageCommandHandler.execute({
      userId,
      bookshelfId,
      data: request.file.data,
      contentType: request.file.type,
    });

    return {
      statusCode: httpStatusCodes.ok,
      body: this.mapBookshelfToDto(bookshelf),
    };
  }

  private async deleteBookshelf(
    request: HttpRequest<undefined, DeleteBookshelfQueryParamsDto, DeleteBookshelfPathParamsDto>,
  ): Promise<HttpNoContentResponse<DeleteBookshelfResponseBodyDto>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { bookshelfId } = request.pathParams;

    const { fallbackBookshelfId } = request.queryParams;

    await this.deleteBookshelfCommandHandler.execute({
      userId,
      bookshelfId,
      fallbackBookshelfId,
    });

    return {
      statusCode: httpStatusCodes.noContent,
      body: null,
    };
  }

  private mapBookshelfToDto(bookshelf: Bookshelf): BookshelfDto {
    const bookshelfDto: BookshelfDto = {
      id: bookshelf.getId(),
      name: bookshelf.getName(),
      userId: bookshelf.getUserId(),
      type: bookshelf.getType(),
      createdAt: bookshelf.getCreatedAt().toISOString(),
      bookCount: bookshelf.getBookCount() || 0,
    };

    const imageUrl = bookshelf.getImageUrl();

    if (imageUrl) {
      bookshelfDto.imageUrl = imageUrl;
    }

    return bookshelfDto;
  }
}
