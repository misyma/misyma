import {
  type ChangeUserPasswordBodyDto,
  type ChangeUserPasswordResponseBodyDto,
  changeUserPasswordBodyDtoSchema,
  changeUserPasswordResponseBodyDtoSchema,
} from './schemas/changeUserPasswordSchema.js';
import {
  deleteUserResponseBodyDtoSchema,
  type DeleteUserResponseBodyDto,
  type DeleteUserPathParamsDto,
  deleteUserPathParamsDtoSchema,
} from './schemas/deleteUserSchema.js';
import { findMyUserResponseBodyDtoSchema } from './schemas/findMyUserSchema.js';
import {
  findUserPathParamsDtoSchema,
  findUserResponseBodyDtoSchema,
  type FindUserPathParamsDto,
  type FindUserResponseBodyDto,
} from './schemas/findUserSchema.js';
import {
  type LoginUserBodyDto,
  type LoginUserResponseBodyDto,
  loginUserBodyDtoSchema,
  loginUserResponseBodyDtoSchema,
} from './schemas/loginUserSchema.js';
import {
  logoutUserPathParamsDtoSchema,
  type LogoutUserBodyDto,
  type LogoutUserPathParamsDto,
  type LogoutUserResponseBodyDto,
  logoutUserBodyDtoSchema,
  logoutUserResponseBodyDtoSchema,
} from './schemas/logoutUserSchema.js';
import {
  refreshUserTokensBodyDtoSchema,
  refreshUserTokensResponseBodyDtoSchema,
  type RefreshUserTokensBodyDto,
  type RefreshUserTokensResponseBodyDto,
} from './schemas/refreshUserTokensSchema.js';
import {
  registerUserBodyDtoSchema,
  registerUserResponseBodyDtoSchema,
  type RegisterUserResponseBodyDto,
  type RegisterUserBodyDto,
  registerUserBodyPreValidationHook,
} from './schemas/registerUserSchema.js';
import {
  type ResetUserPasswordBodyDto,
  type ResetUserPasswordResponseBodyDto,
  resetUserPasswordBodyDtoSchema,
  resetUserPasswordResponseBodyDtoSchema,
} from './schemas/resetUserPasswordSchema.js';
import {
  type SendVerificationEmailBodyDto,
  type SendVerificationEmailResponseBodyDto,
  sendVerificationEmailBodyDtoSchema,
  sendVerificationEmailResponseBodyDtoSchema,
} from './schemas/sendVerificationEmailSchema.js';
import {
  verifyUserBodyDtoSchema,
  verifyUserResponseBodyDtoSchema,
  type VerifyUserBodyDto,
  type VerifyUserResponseBodyDto,
} from './schemas/verifyUserSchema.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { HttpMethodName } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import {
  type HttpCreatedResponse,
  type HttpOkResponse,
  type HttpNoContentResponse,
} from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../../../../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type ChangeUserPasswordCommandHandler } from '../../../application/commandHandlers/changeUserPasswordCommandHandler/changeUserPasswordCommandHandler.js';
import { type DeleteUserCommandHandler } from '../../../application/commandHandlers/deleteUserCommandHandler/deleteUserCommandHandler.js';
import { type LoginUserCommandHandler } from '../../../application/commandHandlers/loginUserCommandHandler/loginUserCommandHandler.js';
import { type LogoutUserCommandHandler } from '../../../application/commandHandlers/logoutUserCommandHandler/logoutUserCommandHandler.js';
import { type RefreshUserTokensCommandHandler } from '../../../application/commandHandlers/refreshUserTokensCommandHandler/refreshUserTokensCommandHandler.js';
import { type RegisterUserCommandHandler } from '../../../application/commandHandlers/registerUserCommandHandler/registerUserCommandHandler.js';
import { type SendResetPasswordEmailCommandHandler } from '../../../application/commandHandlers/sendResetPasswordEmailCommandHandler/sendResetPasswordEmailCommandHandler.js';
import { type SendVerificationEmailCommandHandler } from '../../../application/commandHandlers/sendVerificationEmailCommandHandler/sendVerificationEmailCommandHandler.js';
import { type VerifyUserEmailCommandHandler } from '../../../application/commandHandlers/verifyUserEmailCommandHandler/verifyUserEmailCommandHandler.js';
import { type FindUserQueryHandler } from '../../../application/queryHandlers/findUserQueryHandler/findUserQueryHandler.js';
import { type User } from '../../../domain/entities/user/user.js';
import { type UserDto } from '../common/userDto.js';

export class UserHttpController implements HttpController {
  public readonly basePath = '/users';
  public readonly tags = ['User'];

  public constructor(
    private readonly registerUserCommandHandler: RegisterUserCommandHandler,
    private readonly loginUserCommandHandler: LoginUserCommandHandler,
    private readonly deleteUserCommandHandler: DeleteUserCommandHandler,
    private readonly findUserQueryHandler: FindUserQueryHandler,
    private readonly accessControlService: AccessControlService,
    private readonly verifyUserEmailCommandHandler: VerifyUserEmailCommandHandler,
    private readonly resetUserPasswordCommandHandler: SendResetPasswordEmailCommandHandler,
    private readonly changeUserPasswordCommandHandler: ChangeUserPasswordCommandHandler,
    private readonly logoutUserCommandHandler: LogoutUserCommandHandler,
    private readonly refreshUserTokensCommandHandler: RefreshUserTokensCommandHandler,
    private readonly sendVerificationEmailCommandHandler: SendVerificationEmailCommandHandler,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'register',
        handler: this.registerUser.bind(this),
        schema: {
          request: {
            body: registerUserBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.created]: {
              schema: registerUserResponseBodyDtoSchema,
              description: 'User registered',
            },
          },
        },
        preValidation: registerUserBodyPreValidationHook,
        description: 'Register user',
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'login',
        handler: this.loginUser.bind(this),
        schema: {
          request: {
            body: loginUserBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: loginUserResponseBodyDtoSchema,
              description: 'User logged in',
            },
          },
        },
        description: 'Login user',
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'reset-password',
        handler: this.resetUserPassword.bind(this),
        description: 'Reset user password',
        schema: {
          request: {
            body: resetUserPasswordBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: resetUserPasswordResponseBodyDtoSchema,
              description: 'User password reset',
            },
          },
        },
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'change-password',
        description: 'Change user password',
        handler: this.changeUserPassword.bind(this),
        schema: {
          request: {
            body: changeUserPasswordBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: changeUserPasswordResponseBodyDtoSchema,
              description: 'User password changed',
            },
          },
        },
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: ':userId',
        handler: this.findUser.bind(this),
        schema: {
          request: {
            pathParams: findUserPathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findUserResponseBodyDtoSchema,
              description: 'User found',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: 'Find user by id',
      }),
      new HttpRoute({
        method: HttpMethodName.get,
        path: 'me',
        handler: this.findMyUser.bind(this),
        schema: {
          request: {},
          response: {
            [HttpStatusCode.ok]: {
              schema: findMyUserResponseBodyDtoSchema,
              description: 'User found',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: 'Find user by token',
      }),
      new HttpRoute({
        method: HttpMethodName.delete,
        path: ':userId',
        handler: this.deleteUser.bind(this),
        schema: {
          request: {
            pathParams: deleteUserPathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              schema: deleteUserResponseBodyDtoSchema,
              description: 'User deleted',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: 'Delete user',
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'send-verification-email',
        handler: this.sendVerificationEmail.bind(this),
        schema: {
          request: {
            body: sendVerificationEmailBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: sendVerificationEmailResponseBodyDtoSchema,
              description: 'Verification email sent',
            },
          },
        },
        description: 'Send verification email',
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'verify-email',
        handler: this.verifyUserEmail.bind(this),
        schema: {
          request: {
            body: verifyUserBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: verifyUserResponseBodyDtoSchema,
              description: `User's email verified.`,
            },
          },
        },
        description: 'Verify user email',
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: ':userId/logout',
        handler: this.logoutUser.bind(this),
        schema: {
          request: {
            pathParams: logoutUserPathParamsDtoSchema,
            body: logoutUserBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: logoutUserResponseBodyDtoSchema,
              description: `User logged out.`,
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: 'Logout user',
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        path: 'token',
        handler: this.refreshUserTokens.bind(this),
        schema: {
          request: {
            body: refreshUserTokensBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: refreshUserTokensResponseBodyDtoSchema,
              description: 'User tokens refreshed',
            },
          },
        },
        description: 'Refresh user tokens',
      }),
    ];
  }

  private async registerUser(
    request: HttpRequest<RegisterUserBodyDto>,
  ): Promise<HttpCreatedResponse<RegisterUserResponseBodyDto>> {
    const { email, password, name } = request.body;

    const { user } = await this.registerUserCommandHandler.execute({
      email,
      password,
      name,
    });

    return {
      statusCode: HttpStatusCode.created,
      body: this.mapUserToUserDto(user),
    };
  }

  private async loginUser(request: HttpRequest<LoginUserBodyDto>): Promise<HttpOkResponse<LoginUserResponseBodyDto>> {
    const { email, password } = request.body;

    const { accessToken, refreshToken, accessTokenExpiresIn } = await this.loginUserCommandHandler.execute({
      email,
      password,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: {
        accessToken,
        refreshToken,
        expiresIn: accessTokenExpiresIn,
      },
    };
  }

  private async resetUserPassword(
    request: HttpRequest<ResetUserPasswordBodyDto, null, null>,
  ): Promise<HttpOkResponse<ResetUserPasswordResponseBodyDto>> {
    const { email } = request.body;

    await this.resetUserPasswordCommandHandler.execute({
      email,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: null,
    };
  }

  private async changeUserPassword(
    request: HttpRequest<ChangeUserPasswordBodyDto, null, null>,
  ): Promise<HttpOkResponse<ChangeUserPasswordResponseBodyDto>> {
    const { password, token } = request.body;

    await this.changeUserPasswordCommandHandler.execute({
      newPassword: password,
      resetPasswordToken: token,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: null,
    };
  }

  private async findUser(
    request: HttpRequest<undefined, undefined, FindUserPathParamsDto>,
  ): Promise<HttpOkResponse<FindUserResponseBodyDto>> {
    const { userId } = request.pathParams;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
      expectedUserId: userId,
    });

    const { user } = await this.findUserQueryHandler.execute({ userId });

    return {
      statusCode: HttpStatusCode.ok,
      body: this.mapUserToUserDto(user),
    };
  }

  private async findMyUser(request: HttpRequest): Promise<HttpOkResponse<FindUserResponseBodyDto>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { user } = await this.findUserQueryHandler.execute({ userId });

    return {
      statusCode: HttpStatusCode.ok,
      body: this.mapUserToUserDto(user),
    };
  }

  private async deleteUser(
    request: HttpRequest<undefined, undefined, DeleteUserPathParamsDto>,
  ): Promise<HttpNoContentResponse<DeleteUserResponseBodyDto>> {
    const { userId } = request.pathParams;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
      expectedUserId: userId,
    });

    await this.deleteUserCommandHandler.execute({ userId });

    return {
      statusCode: HttpStatusCode.noContent,
      body: null,
    };
  }

  private async verifyUserEmail(
    request: HttpRequest<VerifyUserBodyDto, undefined, undefined>,
  ): Promise<HttpOkResponse<VerifyUserResponseBodyDto>> {
    const { token } = request.body;

    await this.verifyUserEmailCommandHandler.execute({ emailVerificationToken: token });

    return {
      statusCode: HttpStatusCode.ok,
      body: null,
    };
  }

  private async sendVerificationEmail(
    request: HttpRequest<SendVerificationEmailBodyDto, undefined, undefined>,
  ): Promise<HttpOkResponse<SendVerificationEmailResponseBodyDto>> {
    const { email } = request.body;

    await this.sendVerificationEmailCommandHandler.execute({
      email: email.toLowerCase(),
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: null,
    };
  }

  private async logoutUser(
    request: HttpRequest<LogoutUserBodyDto, undefined, LogoutUserPathParamsDto>,
  ): Promise<HttpOkResponse<LogoutUserResponseBodyDto>> {
    const { userId } = request.pathParams;

    const { refreshToken, accessToken } = request.body;

    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
      expectedUserId: userId,
    });

    await this.logoutUserCommandHandler.execute({
      userId,
      refreshToken,
      accessToken,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: null,
    };
  }

  private async refreshUserTokens(
    request: HttpRequest<RefreshUserTokensBodyDto>,
  ): Promise<HttpOkResponse<RefreshUserTokensResponseBodyDto>> {
    const { refreshToken: inputRefreshToken } = request.body;

    const { accessToken, refreshToken, accessTokenExpiresIn } = await this.refreshUserTokensCommandHandler.execute({
      refreshToken: inputRefreshToken,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: {
        accessToken,
        refreshToken,
        expiresIn: accessTokenExpiresIn,
      },
    };
  }

  private mapUserToUserDto(user: User): UserDto {
    return {
      id: user.getId(),
      email: user.getEmail(),
      name: user.getName(),
      isEmailVerified: user.getIsEmailVerified(),
      role: user.getRole(),
    };
  }
}
