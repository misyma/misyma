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
  registerUserRequestBodyDtoSchema,
  registerUserResponseBodyDtoSchema,
  type RegisterUserResponseBodyDto,
  type RegisterUserRequestBodyDto,
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
  type UpdateUserResponseBodyDto,
  type UpdateUserPathParamsDto,
  type UpdateUserRequestBodyDto,
  updateUserPathParamsDtoSchema,
  updateUserRequestBodyDtoSchema,
  updateUserResponseBodyDtoSchema,
} from './schemas/updateUserSchema.js';
import {
  verifyUserBodyDtoSchema,
  verifyUserResponseBodyDtoSchema,
  type VerifyUserBodyDto,
  type VerifyUserResponseBodyDto,
} from './schemas/verifyUserSchema.js';
import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { httpMethodNames } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import {
  type HttpCreatedResponse,
  type HttpOkResponse,
  type HttpNoContentResponse,
} from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { httpStatusCodes } from '../../../../../common/types/http/httpStatusCode.js';
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
import { type UpdateUserCommandHandler } from '../../../application/commandHandlers/updateUserCommandHandler/updateUserCommandHandler.js';
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
    private readonly updateUserCommandHandler: UpdateUserCommandHandler,
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
        method: httpMethodNames.post,
        path: 'register',
        handler: this.registerUser.bind(this),
        schema: {
          request: {
            body: registerUserRequestBodyDtoSchema,
          },
          response: {
            [httpStatusCodes.created]: {
              schema: registerUserResponseBodyDtoSchema,
              description: 'User registered',
            },
          },
        },
        preValidation: registerUserBodyPreValidationHook,
        description: 'Register user',
      }),
      new HttpRoute({
        method: httpMethodNames.post,
        path: 'login',
        handler: this.loginUser.bind(this),
        schema: {
          request: {
            body: loginUserBodyDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              schema: loginUserResponseBodyDtoSchema,
              description: 'User logged in',
            },
          },
        },
        description: 'Login user',
      }),
      new HttpRoute({
        method: httpMethodNames.post,
        path: 'reset-password',
        handler: this.resetUserPassword.bind(this),
        description: 'Reset user password',
        schema: {
          request: {
            body: resetUserPasswordBodyDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              schema: resetUserPasswordResponseBodyDtoSchema,
              description: 'User password reset',
            },
          },
        },
      }),
      new HttpRoute({
        method: httpMethodNames.post,
        path: 'change-password',
        description: 'Change user password',
        handler: this.changeUserPassword.bind(this),
        schema: {
          request: {
            body: changeUserPasswordBodyDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              schema: changeUserPasswordResponseBodyDtoSchema,
              description: 'User password changed',
            },
          },
        },
      }),
      new HttpRoute({
        method: httpMethodNames.get,
        path: ':userId',
        handler: this.findUser.bind(this),
        schema: {
          request: {
            pathParams: findUserPathParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              schema: findUserResponseBodyDtoSchema,
              description: 'User found',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: 'Find user by id',
      }),
      new HttpRoute({
        method: httpMethodNames.get,
        path: 'me',
        handler: this.findMyUser.bind(this),
        schema: {
          request: {},
          response: {
            [httpStatusCodes.ok]: {
              schema: findMyUserResponseBodyDtoSchema,
              description: 'User found',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: 'Find user by token',
      }),
      new HttpRoute({
        method: httpMethodNames.delete,
        path: ':userId',
        handler: this.deleteUser.bind(this),
        schema: {
          request: {
            pathParams: deleteUserPathParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.noContent]: {
              schema: deleteUserResponseBodyDtoSchema,
              description: 'User deleted',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: 'Delete user',
      }),
      new HttpRoute({
        method: httpMethodNames.post,
        path: 'send-verification-email',
        handler: this.sendVerificationEmail.bind(this),
        schema: {
          request: {
            body: sendVerificationEmailBodyDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              schema: sendVerificationEmailResponseBodyDtoSchema,
              description: 'Verification email sent',
            },
          },
        },
        description: 'Send verification email',
      }),
      new HttpRoute({
        method: httpMethodNames.post,
        path: 'verify-email',
        handler: this.verifyUserEmail.bind(this),
        schema: {
          request: {
            body: verifyUserBodyDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              schema: verifyUserResponseBodyDtoSchema,
              description: "User's email verified",
            },
          },
        },
        description: 'Verify user email',
      }),
      new HttpRoute({
        method: httpMethodNames.post,
        path: ':userId/logout',
        handler: this.logoutUser.bind(this),
        schema: {
          request: {
            pathParams: logoutUserPathParamsDtoSchema,
            body: logoutUserBodyDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              schema: logoutUserResponseBodyDtoSchema,
              description: 'User logged out',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: 'Logout user',
      }),
      new HttpRoute({
        method: httpMethodNames.patch,
        path: ':userId',
        handler: this.updateUser.bind(this),
        schema: {
          request: {
            pathParams: updateUserPathParamsDtoSchema,
            body: updateUserRequestBodyDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              schema: updateUserResponseBodyDtoSchema,
              description: 'User updated',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: 'Update user',
      }),
      new HttpRoute({
        method: httpMethodNames.post,
        path: 'token',
        handler: this.refreshUserTokens.bind(this),
        schema: {
          request: {
            body: refreshUserTokensBodyDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
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
    request: HttpRequest<RegisterUserRequestBodyDto>,
  ): Promise<HttpCreatedResponse<RegisterUserResponseBodyDto>> {
    const { email, password, name } = request.body;

    const { user } = await this.registerUserCommandHandler.execute({
      email,
      password,
      name,
    });

    return {
      statusCode: httpStatusCodes.created,
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
      statusCode: httpStatusCodes.ok,
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
      statusCode: httpStatusCodes.ok,
      body: null,
    };
  }

  private async changeUserPassword(
    request: HttpRequest<ChangeUserPasswordBodyDto, null, null>,
  ): Promise<HttpOkResponse<ChangeUserPasswordResponseBodyDto>> {
    const { password, token } = request.body;

    let userId: string | undefined;

    try {
      const result = await this.accessControlService.verifyBearerToken({
        requestHeaders: request.headers,
      });

      userId = result.userId;
    } catch (error) {
      userId = undefined;
    }

    let identifier: { userId: string } | { resetPasswordToken: string };

    if (userId) {
      identifier = { userId };
    } else {
      if (!token) {
        throw new OperationNotValidError({
          reason: 'Reset password token is required.',
        });
      }

      identifier = { resetPasswordToken: token };
    }

    await this.changeUserPasswordCommandHandler.execute({
      newPassword: password,
      identifier,
    });

    return {
      statusCode: httpStatusCodes.ok,
      body: null,
    };
  }

  private async findUser(
    request: HttpRequest<undefined, undefined, FindUserPathParamsDto>,
  ): Promise<HttpOkResponse<FindUserResponseBodyDto>> {
    const { userId } = request.pathParams;

    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
      expectedUserId: userId,
    });

    const { user } = await this.findUserQueryHandler.execute({ userId });

    return {
      statusCode: httpStatusCodes.ok,
      body: this.mapUserToUserDto(user),
    };
  }

  private async findMyUser(request: HttpRequest): Promise<HttpOkResponse<FindUserResponseBodyDto>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { user } = await this.findUserQueryHandler.execute({ userId });

    return {
      statusCode: httpStatusCodes.ok,
      body: this.mapUserToUserDto(user),
    };
  }

  private async deleteUser(
    request: HttpRequest<undefined, undefined, DeleteUserPathParamsDto>,
  ): Promise<HttpNoContentResponse<DeleteUserResponseBodyDto>> {
    const { userId } = request.pathParams;

    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
      expectedUserId: userId,
    });

    await this.deleteUserCommandHandler.execute({ userId });

    return {
      statusCode: httpStatusCodes.noContent,
      body: null,
    };
  }

  private async updateUser(
    request: HttpRequest<UpdateUserRequestBodyDto, undefined, UpdateUserPathParamsDto>,
  ): Promise<HttpOkResponse<UpdateUserResponseBodyDto>> {
    const { userId } = request.pathParams;

    const { name } = request.body;

    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
      expectedUserId: userId,
    });

    const { user } = await this.updateUserCommandHandler.execute({
      id: userId,
      name,
    });

    return {
      statusCode: httpStatusCodes.ok,
      body: this.mapUserToUserDto(user),
    };
  }

  private async verifyUserEmail(
    request: HttpRequest<VerifyUserBodyDto, undefined, undefined>,
  ): Promise<HttpOkResponse<VerifyUserResponseBodyDto>> {
    const { token } = request.body;

    await this.verifyUserEmailCommandHandler.execute({ emailVerificationToken: token });

    return {
      statusCode: httpStatusCodes.ok,
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
      statusCode: httpStatusCodes.ok,
      body: null,
    };
  }

  private async logoutUser(
    request: HttpRequest<LogoutUserBodyDto, undefined, LogoutUserPathParamsDto>,
  ): Promise<HttpOkResponse<LogoutUserResponseBodyDto>> {
    const { userId } = request.pathParams;

    const { refreshToken, accessToken } = request.body;

    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
      expectedUserId: userId,
    });

    await this.logoutUserCommandHandler.execute({
      userId,
      refreshToken,
      accessToken,
    });

    return {
      statusCode: httpStatusCodes.ok,
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
      statusCode: httpStatusCodes.ok,
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
