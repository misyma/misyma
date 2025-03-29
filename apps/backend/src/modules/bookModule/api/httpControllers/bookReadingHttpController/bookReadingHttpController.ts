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
import { type CreateBookReadingCommandHandler } from '../../../application/commandHandlers/createBookReadingCommandHandler/createBookReadingCommandHandler.js';
import { type DeleteBookReadingCommandHandler } from '../../../application/commandHandlers/deleteBookReadingCommandHandler/deleteBookReadingCommandHandler.js';
import { type UpdateBookReadingCommandHandler } from '../../../application/commandHandlers/updateBookReadingCommandHandler/updateBookReadingCommandHandler.js';
import { type FindBookReadingsQueryHandler } from '../../../application/queryHandlers/findBookReadingsQueryHandler/findBookReadingsQueryHandler.js';
import { type BookReading } from '../../../domain/entities/bookReading/bookReading.js';

import { type BookReadingDto } from './schemas/bookReadingDto.js';
import {
  type CreateBookReadingBodyDto,
  type CreateBookReadingResponseBodyDto,
  createBookReadingBodyDtoSchema,
  createBookReadingResponseBodyDtoSchema,
  createBookReadingPathParamsDtoSchema,
  type CreateBookReadingPathParamsDto,
} from './schemas/createBookReadingSchema.js';
import {
  type DeleteBookReadingResponseBodyDto,
  type DeleteBookReadingPathParamsDto,
  deleteBookReadingPathParamsDtoSchema,
  deleteBookReadingResponseBodyDtoSchema,
} from './schemas/deleteBookReadingSchema.js';
import {
  type FindBookReadingsResponseBodyDto,
  findBookReadingsResponseBodyDtoSchema,
  findBookReadingsPathParamsDtoSchema,
  type FindBookReadingsPathParamsDto,
  type FindBookReadingsQueryParamsDto,
  findBookReadingsQueryParamsDtoSchema,
} from './schemas/findBookReadingsSchema.js';
import {
  updateBookReadingBodyDtoSchema,
  updateBookReadingPathParamsDtoSchema,
  type UpdateBookReadingBodyDto,
  type UpdateBookReadingPathParamsDto,
  type UpdateBookReadingResponseBodyDto,
  updateBookReadingResponseBodyDtoSchema,
} from './schemas/updateBookReadingSchema.js';

export class BookReadingHttpController implements HttpController {
  public readonly basePath = '/user-books/:userBookId/readings';
  public readonly tags = ['BookReading'];

  public constructor(
    private readonly findBookReadingsQueryHandler: FindBookReadingsQueryHandler,
    private readonly createBookReadingCommandHandler: CreateBookReadingCommandHandler,
    private readonly updateBookReadingCommandHandler: UpdateBookReadingCommandHandler,
    private readonly deleteBookReadingCommandHandler: DeleteBookReadingCommandHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: httpMethodNames.get,
        handler: this.getBookReadings.bind(this),
        description: 'Get BookReadings',
        schema: {
          request: {
            pathParams: findBookReadingsPathParamsDtoSchema,
            queryParams: findBookReadingsQueryParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              schema: findBookReadingsResponseBodyDtoSchema,
              description: 'Found BookReadings',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
      }),
      new HttpRoute({
        method: httpMethodNames.post,
        handler: this.createBookReading.bind(this),
        description: 'Create a BookReading',
        schema: {
          request: {
            pathParams: createBookReadingPathParamsDtoSchema,
            body: createBookReadingBodyDtoSchema,
          },
          response: {
            [httpStatusCodes.created]: {
              description: 'BookReading created',
              schema: createBookReadingResponseBodyDtoSchema,
            },
          },
        },
      }),
      new HttpRoute({
        method: httpMethodNames.patch,
        path: ':readingId',
        handler: this.updateBookReading.bind(this),
        description: 'Update BookReading',
        schema: {
          request: {
            body: updateBookReadingBodyDtoSchema,
            pathParams: updateBookReadingPathParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              description: 'BookReading updated',
              schema: updateBookReadingResponseBodyDtoSchema,
            },
          },
        },
      }),
      new HttpRoute({
        method: httpMethodNames.delete,
        path: ':readingId',
        handler: this.deleteBookReading.bind(this),
        description: 'Delete BookReading',
        schema: {
          request: {
            pathParams: deleteBookReadingPathParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.noContent]: {
              description: 'BookReading deleted',
              schema: deleteBookReadingResponseBodyDtoSchema,
            },
          },
        },
      }),
    ];
  }

  private async getBookReadings(
    request: HttpRequest<null, FindBookReadingsQueryParamsDto, FindBookReadingsPathParamsDto>,
  ): Promise<HttpOkResponse<FindBookReadingsResponseBodyDto>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { userBookId } = request.pathParams;

    const { page = 1, pageSize = 10, sortDate } = request.queryParams;

    const { bookReadings, total } = await this.findBookReadingsQueryHandler.execute({
      userId,
      userBookId,
      page,
      pageSize,
      sortDate,
    });

    return {
      statusCode: httpStatusCodes.ok,
      body: {
        data: bookReadings.map((bookReading) => this.mapBookReadingToDto(bookReading)),
        metadata: {
          page,
          pageSize,
          total,
        },
      },
    };
  }

  private async createBookReading(
    request: HttpRequest<CreateBookReadingBodyDto, null, CreateBookReadingPathParamsDto>,
  ): Promise<HttpCreatedResponse<CreateBookReadingResponseBodyDto>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { userBookId } = request.pathParams;

    const { comment, rating, startedAt, endedAt } = request.body;

    const { bookReading } = await this.createBookReadingCommandHandler.execute({
      userId,
      userBookId,
      comment,
      rating,
      startedAt: new Date(startedAt),
      endedAt: new Date(endedAt),
    });

    return {
      statusCode: httpStatusCodes.created,
      body: this.mapBookReadingToDto(bookReading),
    };
  }

  private async updateBookReading(
    request: HttpRequest<UpdateBookReadingBodyDto, null, UpdateBookReadingPathParamsDto>,
  ): Promise<HttpOkResponse<UpdateBookReadingResponseBodyDto>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { readingId } = request.pathParams;

    const { comment, rating, startedAt, endedAt } = request.body;

    const { bookReading } = await this.updateBookReadingCommandHandler.execute({
      userId,
      bookReadingId: readingId,
      comment,
      rating,
      startedAt: startedAt ? new Date(startedAt) : undefined,
      endedAt: endedAt ? new Date(endedAt) : undefined,
    });

    return {
      statusCode: httpStatusCodes.ok,
      body: this.mapBookReadingToDto(bookReading),
    };
  }

  private async deleteBookReading(
    request: HttpRequest<null, null, DeleteBookReadingPathParamsDto>,
  ): Promise<HttpNoContentResponse<DeleteBookReadingResponseBodyDto>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { readingId } = request.pathParams;

    await this.deleteBookReadingCommandHandler.execute({
      userId,
      bookReadingId: readingId,
    });

    return {
      statusCode: httpStatusCodes.noContent,
      body: null,
    };
  }

  private mapBookReadingToDto(bookReading: BookReading): BookReadingDto {
    const dto: BookReadingDto = {
      id: bookReading.getId(),
      userBookId: bookReading.getUserBookId(),
      rating: bookReading.getRating(),
      startedAt: bookReading.getStartedAt().toISOString(),
      endedAt: bookReading.getEndedAt().toISOString(),
    };

    const comment = bookReading.getComment();

    if (comment) {
      dto.comment = comment;
    }

    return dto;
  }
}
