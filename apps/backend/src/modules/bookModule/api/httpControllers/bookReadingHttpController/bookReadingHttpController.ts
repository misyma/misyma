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
  type FindBookReadingByIdResponseBodyDto,
  type FindBookReadingByIdPathParamsDto,
  findBookReadingByIdResponseBodyDtoSchema,
  findBookReadingByIdPathParamsDtoSchema,
} from './schemas/findBookReadingByIdSchema.js';
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
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { HttpMethodName } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import {
  type HttpNoContentResponse,
  type HttpCreatedResponse,
  type HttpOkResponse,
} from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../../../../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type CreateBookReadingCommandHandler } from '../../../application/commandHandlers/createBookReadingCommandHandler/createBookReadingCommandHandler.js';
import { type DeleteBookReadingCommandHandler } from '../../../application/commandHandlers/deleteBookReadingCommandHandler/deleteBookReadingCommandHandler.js';
import { type UpdateBookReadingCommandHandler } from '../../../application/commandHandlers/updateBookReadingCommandHandler/updateBookReadingCommandHandler.js';
import { type FindBookReadingByIdQueryHandler } from '../../../application/queryHandlers/findBookReadingByIdQueryHandler/findBookReadingByIdQueryHandler.js';
import { type FindBookReadingsByUserBookIdQueryHandler } from '../../../application/queryHandlers/findBookReadingsByUserBookIdQueryHandler/findBookReadingsByUserBookIdQueryHandler.js';
import { type BookReading } from '../../../domain/entities/bookReading/bookReading.js';

interface MapBookReadingToBookReadingDtoPayload {
  bookReading: BookReading;
}

export class BookReadingHttpController implements HttpController {
  public readonly basePath = '/api/users/:userId/books/:userBookId/readings';
  public readonly tags = ['BookReading'];

  public constructor(
    private readonly findBookReadingsByBookIdQueryHandler: FindBookReadingsByUserBookIdQueryHandler,
    private readonly findBookReadingByIdQueryHandler: FindBookReadingByIdQueryHandler,
    private readonly createBookReadingCommandHandler: CreateBookReadingCommandHandler,
    private readonly updateBookReadingCommandHandler: UpdateBookReadingCommandHandler,
    private readonly deleteBookReadingCommandHandler: DeleteBookReadingCommandHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.get,
        handler: this.getBookReadings.bind(this),
        description: 'Get BookReadings',
        schema: {
          request: {
            pathParams: findBookReadingsPathParamsDtoSchema,
            queryParams: findBookReadingsQueryParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findBookReadingsResponseBodyDtoSchema,
              description: 'Found BookReadings',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':id',
        handler: this.getBookReading.bind(this),
        schema: {
          request: {
            pathParams: findBookReadingByIdPathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findBookReadingByIdResponseBodyDtoSchema,
              description: 'Found BookReading',
            },
          },
        },
        description: 'Get a BookReading by id',
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        handler: this.createBookReading.bind(this),
        description: 'Create a BookReading',
        schema: {
          request: {
            pathParams: createBookReadingPathParamsDtoSchema,
            body: createBookReadingBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.created]: {
              description: 'BookReading created',
              schema: createBookReadingResponseBodyDtoSchema,
            },
          },
        },
      }),
      new HttpRoute({
        method: HttpMethodName.patch,
        path: ':id',
        handler: this.updateBookReading.bind(this),
        description: 'Update BookReading',
        schema: {
          request: {
            body: updateBookReadingBodyDtoSchema,
            pathParams: updateBookReadingPathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              description: 'BookReading updated',
              schema: updateBookReadingResponseBodyDtoSchema,
            },
          },
        },
      }),
      new HttpRoute({
        method: HttpMethodName.delete,
        path: ':id',
        handler: this.deleteBookReading.bind(this),
        description: 'Delete BookReading',
        schema: {
          request: {
            pathParams: deleteBookReadingPathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
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
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { userBookId } = request.pathParams;

    const { page = 1, pageSize = 10 } = request.queryParams;

    // TODO: authorization, consider adding userId to book for easy access to book owner

    // if (userId !== tokenUserId) {
    //   throw new ForbiddenAccessError({
    //     reason: 'User can only access their own bookReadings',
    //   });
    // }

    const { bookReadings, total } = await this.findBookReadingsByBookIdQueryHandler.execute({
      userBookId,
      page,
      pageSize,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: {
        data: bookReadings.map((bookReading) => this.mapBookReadingToBookReadingDto({ bookReading })),
        metadata: {
          page,
          pageSize,
          total,
        },
      },
    };
  }

  private async getBookReading(
    request: HttpRequest<null, null, FindBookReadingByIdPathParamsDto>,
  ): Promise<HttpOkResponse<FindBookReadingByIdResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    // TODO: authorization
    const { id } = request.pathParams;

    const { bookReading } = await this.findBookReadingByIdQueryHandler.execute({ id });

    return {
      statusCode: HttpStatusCode.ok,
      body: this.mapBookReadingToBookReadingDto({ bookReading }),
    };
  }

  private async createBookReading(
    request: HttpRequest<CreateBookReadingBodyDto, null, CreateBookReadingPathParamsDto>,
  ): Promise<HttpCreatedResponse<CreateBookReadingResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { userBookId } = request.pathParams;

    const { comment, rating, startedAt, endedAt } = request.body;

    // TODO: authorization

    // if (userId !== tokenUserId) {
    //   throw new ForbiddenAccessError({
    //     reason: 'User can only create bookReadings for themselves',
    //   });
    // }

    const { bookReading } = await this.createBookReadingCommandHandler.execute({
      userBookId,
      comment,
      rating,
      startedAt: new Date(startedAt),
      endedAt: endedAt ? new Date(endedAt) : undefined,
    });

    return {
      statusCode: HttpStatusCode.created,
      body: this.mapBookReadingToBookReadingDto({ bookReading }),
    };
  }

  private async updateBookReading(
    request: HttpRequest<UpdateBookReadingBodyDto, null, UpdateBookReadingPathParamsDto>,
  ): Promise<HttpOkResponse<UpdateBookReadingResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    // TODO: authorization

    const { id } = request.pathParams;

    const { comment, rating, startedAt, endedAt } = request.body;

    const { bookReading } = await this.updateBookReadingCommandHandler.execute({
      id,
      comment,
      rating,
      startedAt: startedAt ? new Date(startedAt) : undefined,
      endedAt: endedAt ? new Date(endedAt) : undefined,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: this.mapBookReadingToBookReadingDto({ bookReading }),
    };
  }

  private async deleteBookReading(
    request: HttpRequest<null, null, DeleteBookReadingPathParamsDto>,
  ): Promise<HttpNoContentResponse<DeleteBookReadingResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    // TODO: authorization

    const { id } = request.pathParams;

    await this.deleteBookReadingCommandHandler.execute({ id });

    return {
      statusCode: HttpStatusCode.noContent,
      body: null,
    };
  }

  private mapBookReadingToBookReadingDto(payload: MapBookReadingToBookReadingDtoPayload): BookReadingDto {
    const { bookReading } = payload;

    const dto: BookReadingDto = {
      id: bookReading.getId(),
      userBookId: bookReading.getUserBookId(),
      comment: bookReading.getComment(),
      rating: bookReading.getRating(),
      startedAt: bookReading.getStartedAt().toISOString(),
    };

    const endedAt = bookReading.getEndedAt();

    if (endedAt) {
      dto.endedAt = endedAt.toISOString();
    }

    return dto;
  }
}
