import Axios, { type AxiosResponse, type AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: <T = any, R = AxiosResponse<T, any>, D = any>(
    url: string,
    data?: D,
    config?: ExtendedAxiosRequestConfig,
  ) => Promise<R>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get: <T = any, R = AxiosResponse<T, any>>(url: string, config?: ExtendedAxiosRequestConfig) => Promise<R>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patch: <T = any, R = AxiosResponse<T, any>, D = any>(
    url: string,
    data?: D,
    config?: ExtendedAxiosRequestConfig,
  ) => Promise<R>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete: <T = any, R = AxiosResponse<T, any>, D = any>(
    url: string,
    data?: D,
    config?: ExtendedAxiosRequestConfig,
  ) => Promise<R>;
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

const originalPost = api.post;
const originalGet = api.get;
const originalPatch = api.patch;
const originalDelete = api.delete;

type ExtendedAxiosRequestConfig = AxiosRequestConfig & {
  mapper: ErrorCodeMessageMapper;
  errorCtor: new (context: ApiErrorContext) => ApiError;
};

const handleError = (error: unknown, config?: ExtendedAxiosRequestConfig) => {
  if (error instanceof AxiosError && error.response && config) {
    api.validateResponse(error.response, config.errorCtor, config.mapper);
    throw error;
  }

  throw error;
};

const validate = (response: AxiosResponse, config?: ExtendedAxiosRequestConfig) => {
  if (config) {
    api.validateResponse(response, config.errorCtor, config.mapper);
  }
};

api.get = async (url: string, config?: ExtendedAxiosRequestConfig) => {
  try {
    const response = await originalGet(url, config);

    validate(response, config);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Promise.resolve(response) as Promise<any>;
  } catch (error) {
    handleError(error, config);
    throw error;
  }
};

api.post = async (url, data, config?: ExtendedAxiosRequestConfig) => {
  try {
    const response = await originalPost(url, data, config);

    validate(response, config);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Promise.resolve(response) as Promise<any>;
  } catch (error) {
    handleError(error, config);
    throw error;
  }
};

//eslint-disable-next-line @typescript-eslint/no-unused-vars
api.patch = async <T, _, D>(url: string, data: D, config?: ExtendedAxiosRequestConfig): Promise<T> => {
  try {
    const response = await originalPatch(url, data, config);

    validate(response, config);

    return Promise.resolve(response) as Promise<T>;
  } catch (error) {
    handleError(error, config);
    throw error;
  }
};

//eslint-disable-next-line @typescript-eslint/no-unused-vars
api.delete = async <T, _, D>(url: string, data: D, config?: ExtendedAxiosRequestConfig): Promise<T> => {
  try {
    const response = await originalDelete(url, data, config);

    validate(response, config);

    return Promise.resolve(response) as Promise<T>;
  } catch (error) {
    handleError(error, config);
    throw error;
  }
};

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
      message: mapper.map(response.data as unknown as ApiError, response.status),
      apiResponseError: response.data.context,
      statusCode: response.status,
    });
  }
};
