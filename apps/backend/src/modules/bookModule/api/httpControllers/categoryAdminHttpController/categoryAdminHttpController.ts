import { userRoles } from '@common/contracts';

import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { httpMethodNames } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import {
  type HttpOkResponse,
  type HttpCreatedResponse,
  type HttpNoContentResponse,
} from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { httpStatusCodes } from '../../../../../common/types/http/httpStatusCode.js';
import { securityModes } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type CreateCategoryCommandHandler } from '../../../application/commandHandlers/createCategoryCommandHandler/createCategoryCommandHandler.js';
import { type DeleteCategoryCommandHandler } from '../../../application/commandHandlers/deleteCategoryCommandHandler/deleteCategoryCommandHandler.js';
import { type UpdateCategoryCommandHandler } from '../../../application/commandHandlers/updateCategoryCommandHandler/updateCategoryCommandHandler.js';
import { mapCategoryToDto } from '../common/mappers/categoryDtoMapper.js';

import {
  type CreateCategoryBodyDto,
  type CreateCategoryResponseBodyDto,
  createCategoryBodyDtoSchema,
  createCategoryResponseBodyDtoSchema,
} from './schema/createCategorySchema.js';
import {
  type DeleteCategoryPathParamsDto,
  deleteCategoryResponseBodyDtoSchema,
  deleteCategoryPathParamsDtoSchema,
  type DeleteCategoryResponseBodyDto,
} from './schema/deleteCategorySchema.js';
import {
  type UpdateCategoryBodyDto,
  type UpdateCategoryResponseBodyDto,
  type UpdateCategoryPathParamsDto,
  updateCategoryBodyDtoSchema,
  updateCategoryResponseBodyDtoSchema,
  updateCategoryPathParamsDtoSchema,
} from './schema/updateCategorySchema.js';

export class CategoryAdminHttpController implements HttpController {
  public readonly basePath = '/admin/categories';
  public readonly tags = ['Category'];

  public constructor(
    private readonly createCategoryCommandHandler: CreateCategoryCommandHandler,
    private readonly updateCategoryCommandHandler: UpdateCategoryCommandHandler,
    private readonly deleteCategoryCommandHandler: DeleteCategoryCommandHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        description: 'Create category',
        handler: this.createCategory.bind(this),
        method: httpMethodNames.post,
        schema: {
          request: {
            body: createCategoryBodyDtoSchema,
          },
          response: {
            [httpStatusCodes.created]: {
              description: 'Category created',
              schema: createCategoryResponseBodyDtoSchema,
            },
          },
        },
        securityMode: securityModes.bearerToken,
      }),
      new HttpRoute({
        description: 'Update Category',
        handler: this.updateCategory.bind(this),
        method: httpMethodNames.patch,
        schema: {
          request: {
            pathParams: updateCategoryPathParamsDtoSchema,
            body: updateCategoryBodyDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              description: 'Category updated',
              schema: updateCategoryResponseBodyDtoSchema,
            },
          },
        },
        securityMode: securityModes.bearerToken,
        path: ':categoryId',
      }),
      new HttpRoute({
        description: 'Delete category',
        handler: this.deleteCategory.bind(this),
        method: httpMethodNames.delete,
        schema: {
          request: {
            pathParams: deleteCategoryPathParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.noContent]: {
              description: 'Category deleted',
              schema: deleteCategoryResponseBodyDtoSchema,
            },
          },
        },
        path: ':categoryId',
        securityMode: securityModes.bearerToken,
      }),
    ];
  }

  private async createCategory(
    request: HttpRequest<CreateCategoryBodyDto>,
  ): Promise<HttpCreatedResponse<CreateCategoryResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
      expectedRole: userRoles.admin,
    });

    const { name } = request.body;

    const { category } = await this.createCategoryCommandHandler.execute({ name });

    return {
      body: mapCategoryToDto(category),
      statusCode: httpStatusCodes.created,
    };
  }

  private async updateCategory(
    request: HttpRequest<UpdateCategoryBodyDto, null, UpdateCategoryPathParamsDto>,
  ): Promise<HttpOkResponse<UpdateCategoryResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
      expectedRole: userRoles.admin,
    });

    const { categoryId } = request.pathParams;

    const { name } = request.body;

    const { category } = await this.updateCategoryCommandHandler.execute({
      id: categoryId,
      name,
    });

    return {
      body: mapCategoryToDto(category),
      statusCode: httpStatusCodes.ok,
    };
  }

  private async deleteCategory(
    request: HttpRequest<null, null, DeleteCategoryPathParamsDto>,
  ): Promise<HttpNoContentResponse<DeleteCategoryResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
      expectedRole: userRoles.admin,
    });

    const { categoryId } = request.pathParams;

    await this.deleteCategoryCommandHandler.execute({ id: categoryId });

    return {
      statusCode: httpStatusCodes.noContent,
      body: null,
    };
  }
}
