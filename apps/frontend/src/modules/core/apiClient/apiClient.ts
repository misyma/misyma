import Axios, { type AxiosResponse, type AxiosInstance } from 'axios';

import { type Metadata } from '@common/contracts';

import { type ErrorCodeMessageMapper } from '../../common/errorCodeMessageMapper/errorCodeMessageMapper';
import { type ApiErrorContext, type ApiError } from '../../common/errors/apiError';

type ExtendedAxiosInstance = AxiosInstance & {
  isErrorResponse: (response: MaybeSuccessResponse) => response is MisymaApiErrorResponse;
  getNextPageParam: (response: PaginatedApiResponse) => number | undefined;
  getPreviousPageParam: (response: PaginatedApiResponse) => number | undefined;
  validateResponse: (
    response: MaybeSuccessResponse,
    errorCtor: new (context: ApiErrorContext) => ApiError,
    mapper: ErrorCodeMessageMapper,
  ) => void;
};

export type MisymaApiErrorResponse = AxiosResponse<{
  message: string;
  context: {
    originalError: string;
    [key: string]: unknown;
  };
}>;

export type PaginatedApiResponse = {
  data: unknown[];
  metadata: Metadata;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MaybeSuccessResponse<T = any> = AxiosResponse<T> | MisymaApiErrorResponse;

export const api = Axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.misyma.com/api',
}) as ExtendedAxiosInstance;

api.isErrorResponse = (response): response is MisymaApiErrorResponse =>
  !(response.status >= 200 && response.status <= 299);

api.getNextPageParam = (response) => {
  if (!response) {
    return undefined;
  }

  if (response.metadata.total === 0) {
    return undefined;
  }

  const totalPages = Math.ceil(response.metadata.total / response.metadata.pageSize);

  if (response.metadata.page === totalPages) {
    return undefined;
  }

  return response.metadata.page + 1;
};

api.getPreviousPageParam = (response) => {
  if (response.metadata.page > 1) {
    return response.metadata.page - 1;
  }

  return undefined;
};

api.validateResponse = (response, ctor, mapper) => {
  if (api.isErrorResponse(response)) {
    throw new ctor({
      message: mapper.map(response.status),
      apiResponseError: response.data.context,
      statusCode: response.status,
    });
  }
};
