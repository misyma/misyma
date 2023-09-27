import { type HttpStatusCode } from './httpStatusCode.js';

export interface HttpResponse<Body = unknown> {
  readonly statusCode: HttpStatusCode;
  readonly body: Body;
}

export interface HttpOkResponse<Body = unknown> extends HttpResponse<Body> {
  readonly statusCode: typeof HttpStatusCode.ok;
}

export interface HttpCreatedResponse<Body = unknown> extends HttpResponse<Body> {
  readonly statusCode: typeof HttpStatusCode.created;
}

export interface HttpNoContentResponse<Body = unknown> extends HttpResponse<Body> {
  readonly statusCode: typeof HttpStatusCode.noContent;
}

export interface HttpForbiddenResponse<Body = unknown> extends HttpResponse<Body> {
  readonly statusCode: typeof HttpStatusCode.forbidden;
}

export interface HttpNotFoundResponse<Body = unknown> extends HttpResponse<Body> {
  readonly statusCode: typeof HttpStatusCode.notFound;
}

export interface HttpUnprocessableEntityResponse<Body = unknown> extends HttpResponse<Body> {
  readonly statusCode: typeof HttpStatusCode.unprocessableEntity;
}

export interface HttpBadRequestResponse<Body = unknown> extends HttpResponse<Body> {
  readonly statusCode: typeof HttpStatusCode.badRequest;
}
