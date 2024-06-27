import {
  createCollectionBodyDtoSchema,
  createCollectionResponseBodyDtoSchema,
  type CreateCollectionBodyDto,
  type CreateCollectionResponseBodyDto,
} from './schemas/createCollectionSchema.js';
import {
  deleteCollectionPathParamsDtoSchema,
  deleteCollectionResponseBodyDtoSchema,
  type DeleteCollectionPathParamsDto,
  type DeleteCollectionResponseBodyDto,
} from './schemas/deleteCollectionSchema.js';
import {
  type FindCollectionsResponseBodyDto,
  findCollectionsResponseBodyDtoSchema,
  type FindCollectionsQueryParamsDto,
  findCollectionsQueryParamsDtoSchema,
} from './schemas/findCollectionsSchema.js';
import {
  updateCollectionPathParamsDtoSchema,
  updateCollectionBodyDtoSchema,
  updateCollectionResponseBodyDtoSchema,
  type UpdateCollectionBodyDto,
  type UpdateCollectionPathParamsDto,
  type UpdateCollectionResponseBodyDto,
} from './schemas/updateCollectionSchema.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { HttpMethodName } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import {
  type HttpCreatedResponse,
  type HttpNoContentResponse,
  type HttpOkResponse,
} from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../../../../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type CreateCollectionCommandHandler } from '../../../application/commandHandlers/createCollectionCommandHandler/createCollectionCommandHandler.js';
import { type DeleteCollectionCommandHandler } from '../../../application/commandHandlers/deleteCollectionCommandHandler/deleteCollectionCommandHandler.js';
import { type UpdateCollectionCommandHandler } from '../../../application/commandHandlers/updateCollectionCommandHandler/updateCollectionCommandHandler.js';
import { type FindCollectionsQueryHandler } from '../../../application/queryHandlers/findCollectionsQueryHandler/findCollectionsQueryHandler.js';
import { type Collection } from '../../../domain/entities/collection/collection.js';
import { type CollectionDto } from '../common/collectionDto.js';

export class CollectionHttpController implements HttpController {
  public basePath = '/collections';
  public tags = ['Collection'];

  public constructor(
    private readonly createCollectionCommandHandler: CreateCollectionCommandHandler,
    private readonly updateCollectionNameCommandHandler: UpdateCollectionCommandHandler,
    private readonly deleteCollectionCommandHandler: DeleteCollectionCommandHandler,
    private readonly findCollectionsQueryHandler: FindCollectionsQueryHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        description: 'Find collections',
        handler: this.findCollections.bind(this),
        method: HttpMethodName.get,
        schema: {
          request: {
            queryParams: findCollectionsQueryParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              description: 'Collections found',
              schema: findCollectionsResponseBodyDtoSchema,
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
      }),
      new HttpRoute({
        description: 'Create collection',
        handler: this.createCollection.bind(this),
        method: HttpMethodName.post,
        schema: {
          request: {
            body: createCollectionBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.created]: {
              description: 'Collection created',
              schema: createCollectionResponseBodyDtoSchema,
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
      }),
      new HttpRoute({
        description: 'Update Collection',
        handler: this.updateCollection.bind(this),
        method: HttpMethodName.patch,
        schema: {
          request: {
            pathParams: updateCollectionPathParamsDtoSchema,
            body: updateCollectionBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              description: 'Collection updated',
              schema: updateCollectionResponseBodyDtoSchema,
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        path: ':collectionId',
      }),
      new HttpRoute({
        description: 'Delete collection',
        handler: this.deleteCollection.bind(this),
        method: HttpMethodName.delete,
        schema: {
          request: {
            pathParams: deleteCollectionPathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              description: 'Collection deleted',
              schema: deleteCollectionResponseBodyDtoSchema,
            },
          },
        },
        path: ':collectionId',
        securityMode: SecurityMode.bearerToken,
      }),
    ];
  }

  private async findCollections(
    request: HttpRequest<undefined, FindCollectionsQueryParamsDto, undefined>,
  ): Promise<HttpOkResponse<FindCollectionsResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { page = 1, pageSize = 10, userId, sortDate } = request.queryParams;

    const { collections, total } = await this.findCollectionsQueryHandler.execute({
      page,
      pageSize,
      userId,
      sortDate,
    });

    return {
      body: {
        data: collections.map(this.mapCollectionToDto),
        metadata: {
          page,
          pageSize,
          total,
        },
      },
      statusCode: HttpStatusCode.ok,
    };
  }

  private async createCollection(
    request: HttpRequest<CreateCollectionBodyDto>,
  ): Promise<HttpCreatedResponse<CreateCollectionResponseBodyDto>> {
    const { name, userId } = request.body;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
      expectedUserId: userId,
    });

    const { collection } = await this.createCollectionCommandHandler.execute({
      name,
      userId,
    });

    return {
      body: this.mapCollectionToDto(collection),
      statusCode: HttpStatusCode.created,
    };
  }

  private async updateCollection(
    request: HttpRequest<UpdateCollectionBodyDto, null, UpdateCollectionPathParamsDto>,
  ): Promise<HttpOkResponse<UpdateCollectionResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { collectionId } = request.pathParams;

    const { name } = request.body;

    const { collection } = await this.updateCollectionNameCommandHandler.execute({
      id: collectionId,
      name,
    });

    return {
      body: this.mapCollectionToDto(collection),
      statusCode: HttpStatusCode.ok,
    };
  }

  private async deleteCollection(
    request: HttpRequest<null, null, DeleteCollectionPathParamsDto>,
  ): Promise<HttpNoContentResponse<DeleteCollectionResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { collectionId } = request.pathParams;

    await this.deleteCollectionCommandHandler.execute({ id: collectionId });

    return {
      statusCode: HttpStatusCode.noContent,
      body: null,
    };
  }

  private mapCollectionToDto(collection: Collection): CollectionDto {
    return {
      id: collection.getId(),
      name: collection.getName(),
      userId: collection.getUserId(),
      createdAt: collection.getCreatedAt().toISOString(),
    };
  }
}
