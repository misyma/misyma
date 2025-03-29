import { type HttpMethodName } from '../../common/types/http/httpMethodName.js';
import { type HttpStatusCode } from '../../common/types/http/httpStatusCode.js';

export interface SendRequestPayload {
  readonly body?: unknown;
  readonly headers: Record<string, string>;
  readonly method: HttpMethodName;
  readonly queryParams?: Record<string, string>;
  readonly url: string;
}

export interface HttpResponse<ReponseBody = unknown> {
  readonly body: ReponseBody;
  readonly statusCode: HttpStatusCode;
}

export interface HttpService {
  sendRequest<ResponseBody>(options: SendRequestPayload): Promise<HttpResponse<ResponseBody>>;
}
