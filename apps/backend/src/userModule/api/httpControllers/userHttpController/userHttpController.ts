import {
  deleteUserPathParametersSchema,
  deleteUserResponseNoContentBodySchema,
  type DeleteUserPathParameters,
  type DeleteUserResponseNoContentBody,
} from './schemas/deleteUserSchema.js';
import {
  findUserPathParametersSchema,
  findUserResponseOkBodySchema,
  type FindUserPathParameters,
  type FindUserResponseOkBody,
} from './schemas/findUserSchema.js';
import {
  loginUserBodySchema,
  loginUserResponseOkBodySchema,
  type LoginUserBody,
  type LoginUserResponseOkBody,
} from './schemas/loginUserSchema.js';
import {
  registerUserBodySchema,
  registerUserResponseCreatedBodySchema,
  type RegisterUserBody,
  type RegisterUserResponseCreatedBody,
} from './schemas/registerUserSchema.js';
import { type HttpController } from '../../../../common/types/http/httpController.js';
import { HttpMethodName } from '../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../common/types/http/httpRequest.js';
import {
  type HttpCreatedResponse,
  type HttpOkResponse,
  type HttpNotFoundResponse,
  type HttpNoContentResponse,
  type HttpUnprocessableEntityResponse,
  type HttpForbiddenResponse,
} from '../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../../../common/types/http/httpStatusCode.js';
import { responseErrorBodySchema, type ResponseErrorBody } from '../../../../common/types/http/responseErrorBody.js';
import { SecurityMode } from '../../../../common/types/http/securityMode.js';
import { ResourceAlreadyExistsError } from '../../../../common/validation/errors/common/resourceAlreadyExistsError.js';
import { ResourceNotFoundError } from '../../../../common/validation/errors/common/resourceNotFoundError.js';
import { type DeleteUserCommandHandler } from '../../../application/commandHandlers/deleteUserCommandHandler/deleteUserCommandHandler.js';
import { type LoginUserCommandHandler } from '../../../application/commandHandlers/loginUserCommandHandler/loginUserCommandHandler.js';
import { type RegisterUserCommandHandler } from '../../../application/commandHandlers/registerUserCommandHandler/registerUserCommandHandler.js';
import { type FindUserQueryHandler } from '../../../application/queryHandlers/findUserQueryHandler/findUserQueryHandler.js';
import { type User } from '../../../domain/entities/user/user.js';

export class UserHttpController implements HttpController {
  public readonly basePath = 'users';

  public constructor(
    private readonly registerUserCommandHandler: RegisterUserCommandHandler,
    private readonly loginUserCommandHandler: LoginUserCommandHandler,
    private readonly deleteUserCommandHandler: DeleteUserCommandHandler,
    private readonly findUserQueryHandler: FindUserQueryHandler,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'register',
        handler: this.registerUser.bind(this),
        schema: {
          request: {
            body: registerUserBodySchema,
          },
          response: {
            [HttpStatusCode.created]: registerUserResponseCreatedBodySchema,
            [HttpStatusCode.unprocessableEntity]: responseErrorBodySchema,
          },
        },
        tags: ['User'],
        description: 'Register user.',
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'login',
        handler: this.loginUser.bind(this),
        schema: {
          request: {
            body: loginUserBodySchema,
          },
          response: {
            [HttpStatusCode.ok]: loginUserResponseOkBodySchema,
            [HttpStatusCode.notFound]: responseErrorBodySchema,
          },
        },
        tags: ['User'],
        description: 'Login user.',
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':id',
        handler: this.findUser.bind(this),
        schema: {
          request: {
            pathParams: findUserPathParametersSchema,
          },
          response: {
            [HttpStatusCode.ok]: findUserResponseOkBodySchema,
            [HttpStatusCode.notFound]: responseErrorBodySchema,
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['User'],
        description: 'Find user by id.',
      }),
      new HttpRoute({
        method: HttpMethodName.delete,
        path: ':id',
        handler: this.deleteUser.bind(this),
        schema: {
          request: {
            pathParams: deleteUserPathParametersSchema,
          },
          response: {
            [HttpStatusCode.noContent]: deleteUserResponseNoContentBodySchema,
            [HttpStatusCode.notFound]: responseErrorBodySchema,
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['User'],
        description: 'Delete user.',
      }),
    ];
  }

  private async registerUser(
    request: HttpRequest<RegisterUserBody>,
  ): Promise<
    HttpCreatedResponse<RegisterUserResponseCreatedBody> | HttpUnprocessableEntityResponse<ResponseErrorBody>
  > {
    try {
      const { email, password } = request.body;

      const { user } = await this.registerUserCommandHandler.execute({
        email,
        password,
      });

      return {
        statusCode: HttpStatusCode.created,
        body: { user },
      };
    } catch (error) {
      if (error instanceof ResourceAlreadyExistsError) {
        return {
          statusCode: HttpStatusCode.unprocessableEntity,
          body: { error },
        };
      }

      throw error;
    }
  }

  private async loginUser(
    request: HttpRequest<LoginUserBody>,
  ): Promise<HttpOkResponse<LoginUserResponseOkBody> | HttpNotFoundResponse<ResponseErrorBody>> {
    try {
      const { email, password } = request.body;

      const { accessToken } = await this.loginUserCommandHandler.execute({
        email,
        password,
      });

      return {
        statusCode: HttpStatusCode.ok,
        body: { token: accessToken },
      };
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        return {
          statusCode: HttpStatusCode.notFound,
          body: { error },
        };
      }

      throw error;
    }
  }

  private async findUser(
    request: HttpRequest<undefined, undefined, FindUserPathParameters>,
  ): Promise<
    | HttpOkResponse<FindUserResponseOkBody>
    | HttpNotFoundResponse<ResponseErrorBody>
    | HttpForbiddenResponse<ResponseErrorBody>
  > {
    const { id } = request.pathParams;

    // TODO: auth
    const userId = '123';

    if (userId !== id) {
      return {
        statusCode: HttpStatusCode.forbidden,
        body: {
          error: {
            name: '',
            message: '',
          },
        },
      };
    }

    try {
      const { user } = await this.findUserQueryHandler.execute({ userId: id });

      return {
        statusCode: HttpStatusCode.ok,
        body: { user: user as User },
      };
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        return {
          statusCode: HttpStatusCode.notFound,
          body: { error },
        };
      }

      throw error;
    }
  }

  private async deleteUser(
    request: HttpRequest<undefined, undefined, DeleteUserPathParameters>,
  ): Promise<
    | HttpNoContentResponse<DeleteUserResponseNoContentBody>
    | HttpNotFoundResponse<ResponseErrorBody>
    | HttpForbiddenResponse<ResponseErrorBody>
  > {
    const { id } = request.pathParams;

    // TODO: auth
    const userId = '123';

    if (userId !== id) {
      return {
        statusCode: HttpStatusCode.forbidden,
        body: {
          error: {
            name: '',
            message: '',
          },
        },
      };
    }

    try {
      await this.deleteUserCommandHandler.execute({ userId: id });
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        return {
          statusCode: HttpStatusCode.notFound,
          body: { error },
        };
      }

      throw error;
    }

    return {
      statusCode: HttpStatusCode.noContent,
      body: null,
    };
  }
}
