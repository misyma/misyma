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
import { type CreateBorrowingCommandHandler } from '../../../application/commandHandlers/createBorrowingCommandHandler/createBorrowingCommandHandler.js';
import { type DeleteBorrowingCommandHandler } from '../../../application/commandHandlers/deleteBorrowingCommandHandler/deleteBorrowingCommandHandler.js';
import { type UpdateBorrowingCommandHandler } from '../../../application/commandHandlers/updateBorrowingCommandHandler/updateBorrowingCommandHandler.js';
import { type FindBorrowingsQueryHandler } from '../../../application/queryHandlers/findBorrowingsQueryHandler/findBorrowingsQueryHandler.js';
import { type Borrowing } from '../../../domain/entities/borrowing/borrowing.js';

import { type BorrowingDto } from './schemas/borrowingDto.js';
import {
  type CreateBorrowingBodyDto,
  type CreateBorrowingResponseBodyDto,
  createBorrowingBodyDtoSchema,
  createBorrowingResponseBodyDtoSchema,
  createBorrowingPathParamsDtoSchema,
  type CreateBorrowingPathParamsDto,
} from './schemas/createBorrowingSchema.js';
import {
  type DeleteBorrowingResponseBodyDto,
  type DeleteBorrowingPathParamsDto,
  deleteBorrowingPathParamsDtoSchema,
  deleteBorrowingResponseBodyDtoSchema,
} from './schemas/deleteBorrowingSchema.js';
import {
  type FindBorrowingsResponseBodyDto,
  findBorrowingsResponseBodyDtoSchema,
  type FindBorrowingsQueryParamsDto,
  findBorrowingsQueryParamsDtoSchema,
  findBorrowingsPathParamsDtoSchema,
  type FindBorrowingsPathParamsDto,
} from './schemas/findBorrowingsSchema.js';
import {
  updateBorrowingBodyDtoSchema,
  updateBorrowingPathParamsDtoSchema,
  type UpdateBorrowingBodyDto,
  type UpdateBorrowingPathParamsDto,
  type UpdateBorrowingResponseBodyDto,
  updateBorrowingResponseBodyDtoSchema,
} from './schemas/updateBorrowingSchema.js';

export class BorrowingHttpController implements HttpController {
  public readonly basePath = '/user-books/:userBookId/borrowings';
  public readonly tags = ['Borrowing'];

  public constructor(
    private readonly findBorrowingsQueryHandler: FindBorrowingsQueryHandler,
    private readonly createBorrowingCommandHandler: CreateBorrowingCommandHandler,
    private readonly updateBorrowingCommandHandler: UpdateBorrowingCommandHandler,
    private readonly deleteBorrowingCommandHandler: DeleteBorrowingCommandHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: httpMethodNames.get,
        handler: this.findBorrowings.bind(this),
        description: 'Find Borrowings',
        schema: {
          request: {
            pathParams: findBorrowingsPathParamsDtoSchema,
            queryParams: findBorrowingsQueryParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              schema: findBorrowingsResponseBodyDtoSchema,
              description: 'Found Borrowings',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
      }),
      new HttpRoute({
        method: httpMethodNames.post,
        handler: this.createBorrowing.bind(this),
        description: 'Create a Borrowing',
        schema: {
          request: {
            pathParams: createBorrowingPathParamsDtoSchema,
            body: createBorrowingBodyDtoSchema,
          },
          response: {
            [httpStatusCodes.created]: {
              description: 'Borrowing created',
              schema: createBorrowingResponseBodyDtoSchema,
            },
          },
        },
      }),
      new HttpRoute({
        method: httpMethodNames.patch,
        path: ':borrowingId',
        handler: this.updateBorrowing.bind(this),
        description: 'Update Borrowing',
        schema: {
          request: {
            body: updateBorrowingBodyDtoSchema,
            pathParams: updateBorrowingPathParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              description: 'Borrowing updated',
              schema: updateBorrowingResponseBodyDtoSchema,
            },
          },
        },
      }),
      new HttpRoute({
        method: httpMethodNames.delete,
        path: ':borrowingId',
        handler: this.deleteBorrowing.bind(this),
        description: 'Delete Borrowing',
        schema: {
          request: {
            pathParams: deleteBorrowingPathParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.noContent]: {
              description: 'Borrowing deleted',
              schema: deleteBorrowingResponseBodyDtoSchema,
            },
          },
        },
      }),
    ];
  }

  private async findBorrowings(
    request: HttpRequest<null, FindBorrowingsQueryParamsDto, FindBorrowingsPathParamsDto>,
  ): Promise<HttpOkResponse<FindBorrowingsResponseBodyDto>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { page = 1, pageSize = 10, sortDate, isOpen } = request.queryParams;

    const { userBookId } = request.pathParams;

    const { borrowings, total } = await this.findBorrowingsQueryHandler.execute({
      userId,
      userBookId,
      page,
      pageSize,
      sortDate,
      isOpen,
    });

    return {
      statusCode: httpStatusCodes.ok,
      body: {
        data: borrowings.map((borrowing) => this.mapBorrowingToDto(borrowing)),
        metadata: {
          page,
          pageSize,
          total,
        },
      },
    };
  }

  private async createBorrowing(
    request: HttpRequest<CreateBorrowingBodyDto, undefined, CreateBorrowingPathParamsDto>,
  ): Promise<HttpCreatedResponse<CreateBorrowingResponseBodyDto>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { userBookId } = request.pathParams;

    const { borrower, startedAt, endedAt } = request.body;

    const { borrowing } = await this.createBorrowingCommandHandler.execute({
      userBookId,
      borrower,
      startedAt: new Date(startedAt),
      endedAt: endedAt ? new Date(endedAt) : undefined,
      userId,
    });

    return {
      statusCode: httpStatusCodes.created,
      body: this.mapBorrowingToDto(borrowing),
    };
  }

  private async updateBorrowing(
    request: HttpRequest<UpdateBorrowingBodyDto, null, UpdateBorrowingPathParamsDto>,
  ): Promise<HttpOkResponse<UpdateBorrowingResponseBodyDto>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { borrowingId } = request.pathParams;

    const { borrower, startedAt, endedAt } = request.body;

    const { borrowing } = await this.updateBorrowingCommandHandler.execute({
      userId,
      borrowingId,
      borrower,
      startedAt: startedAt ? new Date(startedAt) : undefined,
      endedAt: endedAt ? new Date(endedAt) : undefined,
    });

    return {
      statusCode: httpStatusCodes.ok,
      body: this.mapBorrowingToDto(borrowing),
    };
  }

  private async deleteBorrowing(
    request: HttpRequest<null, null, DeleteBorrowingPathParamsDto>,
  ): Promise<HttpNoContentResponse<DeleteBorrowingResponseBodyDto>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { borrowingId } = request.pathParams;

    await this.deleteBorrowingCommandHandler.execute({
      userId,
      borrowingId,
    });

    return {
      statusCode: httpStatusCodes.noContent,
      body: null,
    };
  }

  private mapBorrowingToDto(borrowing: Borrowing): BorrowingDto {
    const dto: BorrowingDto = {
      id: borrowing.getId(),
      userBookId: borrowing.getUserBookId(),
      borrower: borrowing.getBorrower(),
      startedAt: borrowing.getStartedAt().toISOString(),
    };

    const endedAt = borrowing.getEndedAt();

    if (endedAt) {
      dto.endedAt = endedAt.toISOString();
    }

    return dto;
  }
}
