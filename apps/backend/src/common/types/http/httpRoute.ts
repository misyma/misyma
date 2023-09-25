import { type Schema } from 'zod';

import { type HttpMethodName } from './httpMethodName.js';
import { type HttpRouteHandler } from './httpRouteHandler.js';
import { type HttpStatusCode } from './httpStatusCode.js';

export interface HttpRouteSchema {
  readonly request: {
    body?: Schema;
    queryParams?: Schema;
    pathParams?: Schema;
  };
  readonly response: Record<HttpStatusCode, Schema | null>;
}

export interface HttpRoute {
  readonly method: HttpMethodName;
  readonly path: string;
  readonly handler: HttpRouteHandler;
  readonly schema: HttpRouteSchema;
  readonly tags: string[];
  readonly description: string;
}
