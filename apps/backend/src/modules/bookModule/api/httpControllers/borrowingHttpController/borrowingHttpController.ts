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
import { type CreateBorrowingCommandHandler } from '../../../application/commandHandlers/createBorrowingCommandHandler/createBorrowingCommandHandler.js';
import { type DeleteBorrowingCommandHandler } from '../../../application/commandHandlers/deleteBorrowingCommandHandler/deleteBorrowingCommandHandler.js';
import { type UpdateBorrowingCommandHandler } from '../../../application/commandHandlers/updateBorrowingCommandHandler/updateBorrowingCommandHandler.js';
import { type FindBorrowingsQueryHandler } from '../../../application/queryHandlers/findBorrowingsQueryHandler/findBorrowingsQueryHandler.js';
import { type Borrowing } from '../../../domain/entities/borrowing/borrowing.js';

interface MapBorrowingToBorrowingDtoPayload {
  readonly borrowing: Borrowing;
}

export class BorrowingHttpController implements HttpController {
  public readonly basePath = '/api/users/:userId/books/:userBookId/borrowings';
  public readonly tags = ['Borrowing'];

  public constructor(
    private readonly findBorrowingsByBookIdQueryHandler: FindBorrowingsQueryHandler,
    private readonly createBorrowingCommandHandler: CreateBorrowingCommandHandler,
    private readonly updateBorrowingCommandHandler: UpdateBorrowingCommandHandler,
    private readonly deleteBorrowingCommandHandler: DeleteBorrowingCommandHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.get,
        handler: this.getBorrowings.bind(this),
        description: 'Get Borrowings',
        schema: {
          request: {
            pathParams: findBorrowingsPathParamsDtoSchema,
            queryParams: findBorrowingsQueryParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findBorrowingsResponseBodyDtoSchema,
              description: 'Found Borrowings',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        handler: this.createBorrowing.bind(this),
        description: 'Create a Borrowing',
        schema: {
          request: {
            pathParams: createBorrowingPathParamsDtoSchema,
            body: createBorrowingBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.created]: {
              description: 'Borrowing created',
              schema: createBorrowingResponseBodyDtoSchema,
            },
          },
        },
      }),
      new HttpRoute({
        method: HttpMethodName.patch,
        path: ':id',
        handler: this.updateBorrowing.bind(this),
        description: 'Update Borrowing',
        schema: {
          request: {
            body: updateBorrowingBodyDtoSchema,
            pathParams: updateBorrowingPathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              description: 'Borrowing updated',
              schema: updateBorrowingResponseBodyDtoSchema,
            },
          },
        },
      }),
      new HttpRoute({
        method: HttpMethodName.delete,
        path: ':id',
        handler: this.deleteBorrowing.bind(this),
        description: 'Delete Borrowing',
        schema: {
          request: {
            pathParams: deleteBorrowingPathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              description: 'Borrowing deleted',
              schema: deleteBorrowingResponseBodyDtoSchema,
            },
          },
        },
      }),
    ];
  }

  private async getBorrowings(
    request: HttpRequest<null, FindBorrowingsQueryParamsDto, FindBorrowingsPathParamsDto>,
  ): Promise<HttpOkResponse<FindBorrowingsResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { page = 1, pageSize = 10 } = request.queryParams;

    const { userBookId } = request.pathParams;

    // TODO: authorization, consider adding userId to book for easy access to book owner

    // if (userId !== tokenUserId) {
    //   throw new ForbiddenAccessError({
    //     reason: 'User can only access their own borrowings',
    //   });
    // }

    const { borrowings, total } = await this.findBorrowingsByBookIdQueryHandler.execute({
      userBookId,
      page,
      pageSize,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: {
        data: borrowings.map((borrowing) => this.mapBorrowingToBorrowingDto({ borrowing })),
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
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { userBookId } = request.pathParams;

    const { borrower, startedAt, endedAt } = request.body;

    // TODO: authorization

    // if (userId !== tokenUserId) {
    //   throw new ForbiddenAccessError({
    //     reason: 'User can only create borrowings for themselves',
    //   });
    // }

    const { borrowing } = await this.createBorrowingCommandHandler.execute({
      userBookId,
      borrower,
      startedAt: new Date(startedAt),
      endedAt: endedAt ? new Date(endedAt) : undefined,
    });

    return {
      statusCode: HttpStatusCode.created,
      body: this.mapBorrowingToBorrowingDto({ borrowing }),
    };
  }

  private async updateBorrowing(
    request: HttpRequest<UpdateBorrowingBodyDto, null, UpdateBorrowingPathParamsDto>,
  ): Promise<HttpOkResponse<UpdateBorrowingResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    // TODO: authorization

    const { id } = request.pathParams;

    const { borrower, startedAt, endedAt } = request.body;

    const { borrowing } = await this.updateBorrowingCommandHandler.execute({
      id,
      borrower,
      startedAt: startedAt ? new Date(startedAt) : undefined,
      endedAt: endedAt ? new Date(endedAt) : undefined,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: this.mapBorrowingToBorrowingDto({ borrowing }),
    };
  }

  private async deleteBorrowing(
    request: HttpRequest<null, null, DeleteBorrowingPathParamsDto>,
  ): Promise<HttpNoContentResponse<DeleteBorrowingResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    // TODO: authorization

    const { id } = request.pathParams;

    await this.deleteBorrowingCommandHandler.execute({ id });

    return {
      statusCode: HttpStatusCode.noContent,
      body: null,
    };
  }

  private mapBorrowingToBorrowingDto(payload: MapBorrowingToBorrowingDtoPayload): BorrowingDto {
    const { borrowing } = payload;

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
