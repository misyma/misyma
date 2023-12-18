import { HttpHeader } from '../../../src/common/types/http/httpHeader.js';
import { HttpMethodName } from '../../../src/common/types/http/httpMethodName.js';
import { type HttpStatusCode } from '../../../src/common/types/http/httpStatusCode.js';
import { type ConfigProvider } from '../../../src/core/configProvider.js';
import { type HttpService } from '../../../src/libs/httpService/services/httpService/httpService.js';
import {
  type CreateAuthorBodyDTO,
  type CreateAuthorResponseBodyDTO,
} from '../../../src/modules/bookModule/api/httpControllers/authorHttpController/schemas/createAuthorSchema.js';
import { type FindAuthorResponseBodyDTO } from '../../../src/modules/bookModule/api/httpControllers/authorHttpController/schemas/findAuthorSchema.js';

interface CreateAuthorPayload {
  author: CreateAuthorBodyDTO;
  bearerToken: string;
}

interface DeleteAuthorPayload {
  authorId: string;
  bearerToken: string;
}

interface FindAuthorPayload {
  authorId: string;
  bearerToken: string;
}

export class AuthorService {
  private readonly authorsPath = 'api/authors';

  public constructor(
    private readonly httpService: HttpService,
    private readonly configProvider: ConfigProvider,
  ) {}

  public async createAuthor(payload: CreateAuthorPayload): Promise<CreateAuthorResponseBodyDTO> {
    const { author, bearerToken } = payload;

    const response = await this.httpService.sendRequest({
      method: HttpMethodName.post,
      url: `http://localhost:${this.configProvider.getServerPort()}/${this.authorsPath}/create`,
      headers: {
        [HttpHeader.contentType]: 'application/json',
        [HttpHeader.authorization]: `Bearer ${bearerToken}`,
      },
      body: {
        ...author,
      },
    });

    return response.body as CreateAuthorResponseBodyDTO;
  }

  public async deleteAuthor(payload: DeleteAuthorPayload): Promise<HttpStatusCode> {
    const { authorId, bearerToken } = payload;

    const response = await fetch(
      `http://localhost:${this.configProvider.getServerPort()}/${this.authorsPath}/${authorId}`,
      {
        headers: {
          [HttpHeader.authorization]: `Bearer ${bearerToken}`,
        },
        method: HttpMethodName.delete,
      },
    );

    return response.status;
  }

  public async findAuthor(payload: FindAuthorPayload): Promise<FindAuthorResponseBodyDTO> {
    const { authorId, bearerToken } = payload;

    const response = await this.httpService.sendRequest({
      method: HttpMethodName.get,
      url: `http://localhost:${this.configProvider.getServerPort()}/${this.authorsPath}/${authorId}`,
      headers: {
        [HttpHeader.authorization]: `Bearer ${bearerToken}`,
      },
    });

    return response.body as FindAuthorResponseBodyDTO;
  }
}
