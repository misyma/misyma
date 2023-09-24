import { type Schema } from 'zod';

import { type HttpMethodName } from './httpMethodName.js';
import { type HttpRouteHandler } from './httpRouteHandler.js';

export interface HttpRoute {
  readonly method: HttpMethodName;
  readonly path: string;
  readonly handler: HttpRouteHandler;
  readonly schema: {
    readonly request: {
      body?: Schema;
      queryParams?: Schema;
      pathParams?: Schema;
    };
  };
}
