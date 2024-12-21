import { UserRole } from '@common/contracts';

import {
  type FindUsersQueryParamsDto,
  type FindUsersResponseBodyDto,
  findUsersQueryParamsDtoSchema,
  findUsersResponseBodyDtoSchema,
} from './schemas/findUsersSchema.js';
import { type HttpController } from '../../../../../common/types/http/httpController.js';
import { HttpMethodName } from '../../../../../common/types/http/httpMethodName.js';
import { type HttpRequest } from '../../../../../common/types/http/httpRequest.js';
import { type HttpOkResponse } from '../../../../../common/types/http/httpResponse.js';
import { HttpRoute } from '../../../../../common/types/http/httpRoute.js';
import { HttpStatusCode } from '../../../../../common/types/http/httpStatusCode.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type FindUsersQueryHandler } from '../../../application/queryHandlers/findUsersQueryHandler/findUsersQueryHandler.js';
import { type User } from '../../../domain/entities/user/user.js';
import { type UserDto } from '../common/userDto.js';

export class UserAdminHttpController implements HttpController {
  public readonly basePath = '/admin/users';
  public readonly tags = ['User'];

  public constructor(
    private readonly findUsersQueryHandler: FindUsersQueryHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: HttpMethodName.get,
        handler: this.findUsers.bind(this),
        schema: {
          request: {
            queryParams: findUsersQueryParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findUsersResponseBodyDtoSchema,
              description: 'Users found',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
        description: 'Find users',
      }),
    ];
  }

  private async findUsers(
    request: HttpRequest<undefined, FindUsersQueryParamsDto, undefined>,
  ): Promise<HttpOkResponse<FindUsersResponseBodyDto>> {
    const { page = 1, pageSize = 10 } = request.queryParams;

    await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
      expectedRole: UserRole.admin,
    });

    const { users, total } = await this.findUsersQueryHandler.execute({
      page,
      pageSize,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: {
        data: users.map(this.mapUserToUserDto),
        metadata: {
          page,
          pageSize,
          total,
        },
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
