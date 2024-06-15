import {
  type CreateQuoteBodyDto,
  type CreateQuoteResponseBodyDto,
  createQuoteBodyDtoSchema,
  createQuoteResponseBodyDtoSchema,
  createQuotePathParamsDtoSchema,
  type CreateQuotePathParamsDto,
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
  findQuotesPathParamsDtoSchema,
  type FindQuotesPathParamsDto,
  type FindQuotesQueryParamsDto,
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
import { type CreateQuoteCommandHandler } from '../../../application/commandHandlers/createQuoteCommandHandler/createQuoteCommandHandler.js';
import { type DeleteQuoteCommandHandler } from '../../../application/commandHandlers/deleteQuoteCommandHandler/deleteQuoteCommandHandler.js';
import { type UpdateQuoteCommandHandler } from '../../../application/commandHandlers/updateQuoteCommandHandler/updateQuoteCommandHandler.js';
import { type FindQuotesQueryHandler } from '../../../application/queryHandlers/findQuotesQueryHandler/findQuotesQueryHandler.js';
import { type Quote } from '../../../domain/entities/quote/quote.js';

interface MapQuoteToQuoteDtoPayload {
  readonly quote: Quote;
}

export class QuoteHttpController implements HttpController {
  public readonly basePath = '/user-books/:userBookId/quotes';
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
        method: HttpMethodName.get,
        handler: this.getQuotes.bind(this),
        description: 'Get Quotes',
        schema: {
          request: {
            pathParams: findQuotesPathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              schema: findQuotesResponseBodyDtoSchema,
              description: 'Found Quotes',
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.post,
        handler: this.createQuote.bind(this),
        description: 'Create a Quote',
        schema: {
          request: {
            pathParams: createQuotePathParamsDtoSchema,
            body: createQuoteBodyDtoSchema,
          },
          response: {
            [HttpStatusCode.created]: {
              description: 'Quote created',
              schema: createQuoteResponseBodyDtoSchema,
            },
          },
        },
        securityMode: SecurityMode.bearerToken,
      }),
      new HttpRoute({
        method: HttpMethodName.patch,
        path: ':quoteId',
        handler: this.updateQuote.bind(this),
        description: 'Update Quote',
        schema: {
          request: {
            body: updateQuoteBodyDtoSchema,
            pathParams: updateQuotePathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.ok]: {
              description: 'Quote updated',
              schema: updateQuoteResponseBodyDtoSchema,
            },
          },
        },
      }),
      new HttpRoute({
        method: HttpMethodName.delete,
        path: ':quoteId',
        handler: this.deleteQuote.bind(this),
        description: 'Delete Quote',
        schema: {
          request: {
            pathParams: deleteQuotePathParamsDtoSchema,
          },
          response: {
            [HttpStatusCode.noContent]: {
              description: 'Quote deleted',
              schema: deleteQuoteResponseBodyDtoSchema,
            },
          },
        },
      }),
    ];
  }

  private async getQuotes(
    request: HttpRequest<null, FindQuotesQueryParamsDto, FindQuotesPathParamsDto>,
  ): Promise<HttpOkResponse<FindQuotesResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { userBookId } = request.pathParams;

    const { page = 1, pageSize = 10 } = request.queryParams;

    // TODO: authorization, consider adding userId to book for easy access to book owner

    // if (userId !== tokenUserId) {
    //   throw new ForbiddenAccessError({
    //     reason: 'User can only access their own quotes',
    //   });
    // }

    const { quotes, total } = await this.findQuotesQueryHandler.execute({
      userBookId,
      page,
      pageSize,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: {
        data: quotes.map((quote) => this.mapQuoteToQuoteDto({ quote })),
        metadata: {
          page,
          pageSize,
          total,
        },
      },
    };
  }

  private async createQuote(
    request: HttpRequest<CreateQuoteBodyDto, null, CreateQuotePathParamsDto>,
  ): Promise<HttpCreatedResponse<CreateQuoteResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    const { userBookId } = request.pathParams;

    const { content, createdAt, isFavorite, page } = request.body;

    // TODO: authorization

    // if (userId !== tokenUserId) {
    //   throw new ForbiddenAccessError({
    //     reason: 'User can only create quotes for themselves',
    //   });
    // }

    const { quote } = await this.createQuoteCommandHandler.execute({
      userBookId,
      content,
      createdAt: new Date(createdAt),
      isFavorite,
      page,
    });

    return {
      statusCode: HttpStatusCode.created,
      body: this.mapQuoteToQuoteDto({ quote }),
    };
  }

  private async updateQuote(
    request: HttpRequest<UpdateQuoteBodyDto, null, UpdateQuotePathParamsDto>,
  ): Promise<HttpOkResponse<UpdateQuoteResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    // TODO: authorization

    const { quoteId } = request.pathParams;

    const { content, isFavorite, page } = request.body;

    const { quote } = await this.updateQuoteCommandHandler.execute({
      id: quoteId,
      content,
      isFavorite,
      page,
    });

    return {
      statusCode: HttpStatusCode.ok,
      body: this.mapQuoteToQuoteDto({ quote }),
    };
  }

  private async deleteQuote(
    request: HttpRequest<null, null, DeleteQuotePathParamsDto>,
  ): Promise<HttpNoContentResponse<DeleteQuoteResponseBodyDto>> {
    await this.accessControlService.verifyBearerToken({
      authorizationHeader: request.headers['authorization'],
    });

    // TODO: authorization

    const { quoteId } = request.pathParams;

    await this.deleteQuoteCommandHandler.execute({ id: quoteId });

    return {
      statusCode: HttpStatusCode.noContent,
      body: null,
    };
  }

  private mapQuoteToQuoteDto(payload: MapQuoteToQuoteDtoPayload): QuoteDto {
    const { quote } = payload;

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

    return quoteDto;
  }
}
