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
import { securityModes } from '../../../../../common/types/http/securityMode.js';
import { type AccessControlService } from '../../../../authModule/application/services/accessControlService/accessControlService.js';
import { type CreateQuoteCommandHandler } from '../../../application/commandHandlers/createQuoteCommandHandler/createQuoteCommandHandler.js';
import { type DeleteQuoteCommandHandler } from '../../../application/commandHandlers/deleteQuoteCommandHandler/deleteQuoteCommandHandler.js';
import { type UpdateQuoteCommandHandler } from '../../../application/commandHandlers/updateQuoteCommandHandler/updateQuoteCommandHandler.js';
import { type FindQuotesQueryHandler } from '../../../application/queryHandlers/findQuotesQueryHandler/findQuotesQueryHandler.js';
import { type Quote } from '../../../domain/entities/quote/quote.js';

import {
  type CreateQuoteBodyDto,
  type CreateQuoteResponseBodyDto,
  createQuoteBodyDtoSchema,
  createQuoteResponseBodyDtoSchema,
} from './schemas/createQuoteSchema.js';
import {
  type DeleteQuoteResponseBodyDto,
  type DeleteQuotePathParamsDto,
  deleteQuotePathParamsDtoSchema,
  deleteQuoteResponseBodyDtoSchema,
} from './schemas/deleteQuoteSchema.js';
import {
  type FindQuotesResponseBodyDto,
  findQuotesResponseBodyDtoSchema,
  type FindQuotesQueryParamsDto,
  findQuotesQueryParamsDtoSchema,
} from './schemas/findQuotesSchema.js';
import { type QuoteDto } from './schemas/quoteDto.js';
import {
  updateQuoteBodyDtoSchema,
  updateQuotePathParamsDtoSchema,
  type UpdateQuoteBodyDto,
  type UpdateQuotePathParamsDto,
  type UpdateQuoteResponseBodyDto,
  updateQuoteResponseBodyDtoSchema,
} from './schemas/updateQuoteSchema.js';

export class QuoteHttpController implements HttpController {
  public readonly basePath = '/quotes';
  public readonly tags = ['Quote'];

  public constructor(
    private readonly findQuotesQueryHandler: FindQuotesQueryHandler,
    private readonly createQuoteCommandHandler: CreateQuoteCommandHandler,
    private readonly updateQuoteCommandHandler: UpdateQuoteCommandHandler,
    private readonly deleteQuoteCommandHandler: DeleteQuoteCommandHandler,
    private readonly accessControlService: AccessControlService,
  ) {}

  public getHttpRoutes(): HttpRoute[] {
    return [
      new HttpRoute({
        method: httpMethodNames.get,
        handler: this.findQuotes.bind(this),
        description: 'Find Quotes',
        schema: {
          request: {
            queryParams: findQuotesQueryParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              schema: findQuotesResponseBodyDtoSchema,
              description: 'Found Quotes',
            },
          },
        },
        securityMode: securityModes.bearerToken,
      }),
      new HttpRoute({
        method: httpMethodNames.post,
        handler: this.createQuote.bind(this),
        description: 'Create a Quote',
        schema: {
          request: {
            body: createQuoteBodyDtoSchema,
          },
          response: {
            [httpStatusCodes.created]: {
              description: 'Quote created',
              schema: createQuoteResponseBodyDtoSchema,
            },
          },
        },
        securityMode: securityModes.bearerToken,
      }),
      new HttpRoute({
        method: httpMethodNames.patch,
        path: ':quoteId',
        handler: this.updateQuote.bind(this),
        description: 'Update Quote',
        schema: {
          request: {
            body: updateQuoteBodyDtoSchema,
            pathParams: updateQuotePathParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.ok]: {
              description: 'Quote updated',
              schema: updateQuoteResponseBodyDtoSchema,
            },
          },
        },
      }),
      new HttpRoute({
        method: httpMethodNames.delete,
        path: ':quoteId',
        handler: this.deleteQuote.bind(this),
        description: 'Delete Quote',
        schema: {
          request: {
            pathParams: deleteQuotePathParamsDtoSchema,
          },
          response: {
            [httpStatusCodes.noContent]: {
              description: 'Quote deleted',
              schema: deleteQuoteResponseBodyDtoSchema,
            },
          },
        },
      }),
    ];
  }

  private async findQuotes(
    request: HttpRequest<null, FindQuotesQueryParamsDto, null>,
  ): Promise<HttpOkResponse<FindQuotesResponseBodyDto>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { page = 1, pageSize = 10, sortDate, userBookId, authorId, isFavorite, content } = request.queryParams;

    const { quotes, total } = await this.findQuotesQueryHandler.execute({
      userId,
      userBookId,
      authorId,
      isFavorite,
      content,
      page,
      pageSize,
      sortDate,
    });

    return {
      statusCode: httpStatusCodes.ok,
      body: {
        data: quotes.map((quote) => this.mapQuoteToDto(quote)),
        metadata: {
          page,
          pageSize,
          total,
        },
      },
    };
  }

  private async createQuote(
    request: HttpRequest<CreateQuoteBodyDto, null, null>,
  ): Promise<HttpCreatedResponse<CreateQuoteResponseBodyDto>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { userBookId, content, createdAt, isFavorite, page } = request.body;

    const { quote } = await this.createQuoteCommandHandler.execute({
      userId,
      userBookId,
      content,
      createdAt: new Date(createdAt),
      isFavorite,
      page,
    });

    return {
      statusCode: httpStatusCodes.created,
      body: this.mapQuoteToDto(quote),
    };
  }

  private async updateQuote(
    request: HttpRequest<UpdateQuoteBodyDto, null, UpdateQuotePathParamsDto>,
  ): Promise<HttpOkResponse<UpdateQuoteResponseBodyDto>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { quoteId } = request.pathParams;

    const { content, isFavorite, page } = request.body;

    const { quote } = await this.updateQuoteCommandHandler.execute({
      userId,
      quoteId,
      content,
      isFavorite,
      page,
    });

    return {
      statusCode: httpStatusCodes.ok,
      body: this.mapQuoteToDto(quote),
    };
  }

  private async deleteQuote(
    request: HttpRequest<null, null, DeleteQuotePathParamsDto>,
  ): Promise<HttpNoContentResponse<DeleteQuoteResponseBodyDto>> {
    const { userId } = await this.accessControlService.verifyBearerToken({
      requestHeaders: request.headers,
    });

    const { quoteId } = request.pathParams;

    await this.deleteQuoteCommandHandler.execute({
      userId,
      quoteId,
    });

    return {
      statusCode: httpStatusCodes.noContent,
      body: null,
    };
  }

  private mapQuoteToDto(quote: Quote): QuoteDto {
    let quoteDto: QuoteDto = {
      id: quote.getId(),
      userBookId: quote.getUserBookId(),
      content: quote.getContent(),
      createdAt: quote.getCreatedAt().toISOString(),
      isFavorite: quote.getIsFavorite(),
    };

    const page = quote.getPage();

    if (page !== undefined) {
      quoteDto = {
        ...quoteDto,
        page,
      };
    }

    const bookTitle = quote.getBookTitle();

    if (bookTitle !== undefined) {
      quoteDto = {
        ...quoteDto,
        bookTitle,
      };
    }

    const authors = quote.getAuthors();

    if (authors !== undefined) {
      quoteDto = {
        ...quoteDto,
        authors,
      };
    }

    return quoteDto;
  }
}
