import {
  deleteUserResponseBodyDTOSchema,
  type DeleteUserResponseBodyDTO,
  type DeleteUserPathParamsDTO,
  deleteUserPathParamsDTOSchema,
} from './schemas/deleteUserSchema.js';
import {
  findUserPathParamsDTOSchema,
  findUserResponseBodyDTOSchema,
  type FindUserPathParamsDTO,
  type FindUserResponseBodyDTO,
} from './schemas/findUserSchema.js';
import {
  type LoginUserBodyDTO,
  type LoginUserResponseBodyDTO,
  loginUserBodyDTOSchema,
  loginUserResponseBodyDTOSchema,
} from './schemas/loginUserSchema.js';
import {
  registerUserBodyDTOSchema,
  registerUserResponseBodyDTOSchema,
  type RegisterUserResponseBodyDTO,
  type RegisterUserBodyDTO,
} from './schemas/registerUserSchema.js';
import {
  verifyUserPathParamsDTOSchema,
  verifyUserBodyDTOSchema,
  verifyUserResponseBodyDTOSchema,
  type VerifyUserBodyDTO,
  type VerifyUserPathParamsDTO,
  type VerifyUserResponseBodyDTO,
} from './schemas/verifyUserSchema.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/common/resourceAlreadyExistsError.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { HttpMethodName } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import {
  type HttpCreatedResponse,
  type HttpUnprocessableEntityResponse,
  type HttpOkResponse,
  type HttpNotFoundResponse,
  type HttpForbiddenResponse,
  type HttpNoContentResponse,
} from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../../../../common/types/http/httpStatusCode.js';
import { responseErrorBodySchema, type ResponseErrorBody } from '../../../../../common/types/http/responseErrorBody.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type DeleteUserCommandHandler } from '../../../application/commandHandlers/deleteUserCommandHandler/deleteUserCommandHandler.js';
import { type LoginUserCommandHandler } from '../../../application/commandHandlers/loginUserCommandHandler/loginUserCommandHandler.js';
import { type RegisterUserCommandHandler } from '../../../application/commandHandlers/registerUserCommandHandler/registerUserCommandHandler.js';
import { type VerifyUserEmailCommandHandler } from '../../../application/commandHandlers/verifyUserEmailCommandHandler/verifyUserEmailCommandHandler.js';
import { type FindUserQueryHandler } from '../../../application/queryHandlers/findUserQueryHandler/findUserQueryHandler.js';
import { type User } from '../../../domain/entities/user/user.js';

export type UserDTO = {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly isEmailVerified: boolean;
};

export class UserHttpController implements HttpController {
  public readonly basePath = '/api/users';

  public constructor(
    private readonly registerUserCommandHandler: RegisterUserCommandHandler,
    private readonly loginUserCommandHandler: LoginUserCommandHandler,
    private readonly deleteUserCommandHandler: DeleteUserCommandHandler,
    private readonly findUserQueryHandler: FindUserQueryHandler,
    private readonly accessControlService: AccessControlService,
    private readonly verifyUserEmailCommandHandler: VerifyUserEmailCommandHandler,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'register',
        handler: this.registerUser.bind(this),
        schema: {
          request: {
            body: registerUserBodyDTOSchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: registerUserResponseBodyDTOSchema,
              description: 'User registered.',
            },
            [HttpStatusCode.unprocessableEntity]: {
              schema: responseErrorBodySchema,
              description: 'Error exception.',
            },
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
            body: loginUserBodyDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: loginUserResponseBodyDTOSchema,
              description: 'User logged in.',
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
              description: 'Error exception.',
            },
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
            pathParams: findUserPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findUserResponseBodyDTOSchema,
              description: 'User found.',
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
              description: 'Error exception.',
            },
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
            pathParams: deleteUserPathParamsDTOSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: deleteUserResponseBodyDTOSchema,
              description: 'User deleted.',
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
              description: 'Error exception.',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['User'],
        description: 'Delete user.',
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: ':id/verify-email',
        handler: this.verifyUserEmail.bind(this),
        schema: {
          request: {
            pathParams: verifyUserPathParamsDTOSchema,
            body: verifyUserBodyDTOSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: verifyUserResponseBodyDTOSchema,
              description: `User's email verified.`,
            },
            [HttpStatusCode.notFound]: {
              schema: responseErrorBodySchema,
              description: 'Error exception.',
            },
          },
        },
        securityMode: SecurityMode.bearer,
        tags: ['User'],
        description: 'Verify user email.',
      }),
    ];
  }

  private async registerUser(
    request: HttpRequest<RegisterUserBodyDTO>,
  ): Promise<HttpCreatedResponse<RegisterUserResponseBodyDTO> | HttpUnprocessableEntityResponse<ResponseErrorBody>> {
    try {
      const { email, password, firstName, lastName } = request.body;

      const { user } = await this.registerUserCommandHandler.execute({
        email,
        password,
        firstName,
        lastName,
      });

      return {
        statusCode: HttpStatusCode.created,
        body: this.mapUserToUserDTO(user),
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
    request: HttpRequest<LoginUserBodyDTO>,
  ): Promise<HttpOkResponse<LoginUserResponseBodyDTO> | HttpNotFoundResponse<ResponseErrorBody>> {
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
    request: HttpRequest<undefined, undefined, FindUserPathParamsDTO>,
  ): Promise<
    | HttpOkResponse<FindUserResponseBodyDTO>
    | HttpNotFoundResponse<ResponseErrorBody>
    | HttpForbiddenResponse<ResponseErrorBody>
  > {
    const { id } = request.pathParams;

    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    if (userId !== id) {
      return {
        // TODO: add forbidden message
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
        body: this.mapUserToUserDTO(user),
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
    request: HttpRequest<undefined, undefined, DeleteUserPathParamsDTO>,
  ): Promise<
    | HttpNoContentResponse<DeleteUserResponseBodyDTO>
    | HttpNotFoundResponse<ResponseErrorBody>
    | HttpForbiddenResponse<ResponseErrorBody>
  > {
    const { id } = request.pathParams;

    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    if (userId !== id) {
      return {
        // TODO: add forbidden message
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

  private async verifyUserEmail(
    request: HttpRequest<VerifyUserBodyDTO, undefined, VerifyUserPathParamsDTO>,
  ): Promise<
    | HttpOkResponse<VerifyUserResponseBodyDTO>
    | HttpNotFoundResponse<ResponseErrorBody>
    | HttpForbiddenResponse<ResponseErrorBody>
  > {
    const { id } = request.pathParams;

    const { token } = request.body;

    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    if (userId !== id) {
      return {
        // TODO: add forbidden message
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
      await this.verifyUserEmailCommandHandler.execute({
        userId: id,
        token,
      });

      return {
        statusCode: HttpStatusCode.ok,
        body: null,
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

  private mapUserToUserDTO(user: User): UserDTO {
    return {
      id: user.getId(),
      email: user.getEmail(),
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
      isEmailVerified: user.getIsEmailVerified(),
    };
  }
}
