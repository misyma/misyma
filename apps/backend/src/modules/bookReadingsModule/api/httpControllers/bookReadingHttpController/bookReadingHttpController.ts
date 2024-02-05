import { type FindBookReadingsByUserIdParams } from '@common/contracts';

import {
  type CreateBookReadingBodyDTO,
  type CreateBookReadingResponseBodyDTO,
  createBookReadingBodyDTOSchema,
  createBookReadingResponseBodyDTOSchema,
} from './schemas/createBookReadingSchema.js';
import { type BookReadingDTO } from './schemas/dtos/bookReadingDto.js';
import {
  type FindBookReadingByIdOkResponseBodyDTO,
  type FindBookReadingByIdPathParamsDTO,
  findBookReadingByIdOkResponseBodyDTOSchema,
  findBookReadingByIdPathParamsDTOSchema,
} from './schemas/findBookReadingByIdSchema.js';
import {
  type FindBookReadingsByUserIdOkResponseBodyDTO,
  findBookReadingsByUserIdOkResponseBodyDTOSchema,
  findBookReadingsByUserIdPathParamsDTOSchema,
} from './schemas/findBookReadingsByUserIdSchema.js';
import {
  type UpdateBookReadingNamePathParamsDTO,
  type UpdateBookReadingNameBodyDTO,
  type UpdateBookReadingNameOkResponseBodyDTO,
  updateBookReadingNameBodyDTOSchema,
  updateBookReadingNamePathParamsDTOSchema,
  updateBookReadingNameOkResponseBodyDTOSchema,
} from './schemas/updateBookReadingNameSchema.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { HttpMethodName } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import { type HttpCreatedResponse, type HttpOkResponse } from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../../../../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { ForbiddenAccessError } from '../../../../authModule/application/errors/forbiddenAccessError.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type CreateBookReadingCommandHandler } from '../../../application/commandHandlers/createBookReadingCommandHandler/createBookReadingCommandHandler.js';
import { type UpdateBookReadingCommandHandler } from '../../../application/commandHandlers/updateBookReadingCommandHandler/updateBookReadingCommandHandler.js';
import { type FindBookReadingByIdQueryHandler } from '../../../application/queryHandlers/findBookReadingByIdQueryHandler/findBookReadingByIdQueryHandler.js';
import { type FindBookReadingsByBookIdQueryHandler } from '../../../application/queryHandlers/findBookReadingsByBookIdQueryHandler/findBookReadingsByBookIdQueryHandler.js';
import { type BookReading } from '../../../domain/entities/bookReading/bookReading.js';

interface MapBookReadingToBookReadingDTOPayload {
  bookReading: BookReading;
}

export class BookReadingHttpController implements HttpController {
  public readonly basePath = '/api/bookReadings';

  public constructor(
    private readonly findBookReadingsByUserIdQueryHandler: FindBookReadingsByBookIdQueryHandler,
    private readonly findBookReadingByIdQueryHandler: FindBookReadingByIdQueryHandler,
    private readonly createBookReadingCommandHandler: CreateBookReadingCommandHandler,
    private readonly updateBookReadingNameCommandHandler: UpdateBookReadingCommandHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.get,
        path: '/user/:userId',
        handler: this.getUserBookReadings.bind(this),
        description: 'Get user bookReadings.',
        schema: {
          request: {
            pathParams: findBookReadingsByUserIdPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findBookReadingsByUserIdOkResponseBodyDTOSchema,
              description: 'Found user bookReadings.',
            },
          },
        },
        tags: ['BookReading'],
        securityMode: SecurityMode.bearer,
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':id',
        handler: this.getBookReading.bind(this),
        schema: {
          request: {
            pathParams: findBookReadingByIdPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findBookReadingByIdOkResponseBodyDTOSchema,
              description: 'Found bookReading.',
            },
          },
        },
        description: 'Get a bookReading by id.',
        tags: ['BookReading'],
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'create',
        handler: this.createBookReading.bind(this),
        description: 'Create a bookReading.',
        schema: {
          request: {
            body: createBookReadingBodyDTOSchema,
          },
          response: {
            [HttpStatusCode.created]: {
              description: 'BookReading created.',
              schema: createBookReadingResponseBodyDTOSchema,
            },
          },
        },
        tags: ['BookReading'],
      }),
      new HttpRoute({
        method: HttpMethodName.patch,
        path: '/update-name/:bookReadingId',
        handler: this.updateBookReadingName.bind(this),
        description: 'Update bookReading name.',
        schema: {
          request: {
            body: updateBookReadingNameBodyDTOSchema,
            pathParams: updateBookReadingNamePathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              description: 'BookReading name updated.',
              schema: updateBookReadingNameOkResponseBodyDTOSchema,
            },
          },
        },
        tags: ['BookReading'],
      }),
    ];
  }

  private async getUserBookReadings(
    request: HttpRequest<null, null, FindBookReadingsByUserIdParams>,
  ): Promise<HttpOkResponse<FindBookReadingsByUserIdOkResponseBodyDTO>> {
    const { userId: tokenUserId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { userId } = request.pathParams;

    if (userId !== tokenUserId) {
      throw new ForbiddenAccessError({
        reason: 'User can only access their own bookReadings.',
      });
    }

    const { bookReadings } = await this.findBookReadingsByUserIdQueryHandler.execute({
      userId,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: {
        bookReadings: bookReadings.map((bookReading) => this.mapBookReadingToBookReadingDTO({ bookReading })),
      },
    };
  }

  private async getBookReading(
    request: HttpRequest<null, null, FindBookReadingByIdPathParamsDTO>,
  ): Promise<HttpOkResponse<FindBookReadingByIdOkResponseBodyDTO>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { id } = request.pathParams;

    const { bookReading } = await this.findBookReadingByIdQueryHandler.execute({
      id,
      userId,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: {
        bookReading: this.mapBookReadingToBookReadingDTO({ bookReading }),
      },
    };
  }

  private async createBookReading(
    request: HttpRequest<CreateBookReadingBodyDTO>,
  ): Promise<HttpCreatedResponse<CreateBookReadingResponseBodyDTO>> {
    const { userId: tokenUserId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { name, userId, addressId } = request.body;

    if (userId !== tokenUserId) {
      throw new ForbiddenAccessError({
        reason: 'User can only create bookReadings for themselves.',
      });
    }

    const { bookReading } = await this.createBookReadingCommandHandler.execute({
      name,
      userId,
      addressId,
    });

    return {
      statusCode: HttpStatusCode.created,
      body: {
        bookReading: this.mapBookReadingToBookReadingDTO({ bookReading }),
      },
    };
  }

  private async updateBookReadingName(
    request: HttpRequest<UpdateBookReadingNameBodyDTO, null, UpdateBookReadingNamePathParamsDTO>,
  ): Promise<HttpOkResponse<UpdateBookReadingNameOkResponseBodyDTO>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { bookReadingId } = request.pathParams;

    const { name } = request.body;

    const { bookReading } = await this.updateBookReadingNameCommandHandler.execute({
      id: bookReadingId,
      name,
      userId,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: {
        bookReading: this.mapBookReadingToBookReadingDTO({ bookReading }),
      },
    };
  }

  private mapBookReadingToBookReadingDTO(payload: MapBookReadingToBookReadingDTOPayload): BookReadingDTO {
    const { bookReading } = payload;

    return {
      id: bookReading.getId(),
      name: bookReading.getName(),
      userId: bookReading.getUserId(),
      addressId: bookReading.getAddressId() as string,
    };
  }
}
