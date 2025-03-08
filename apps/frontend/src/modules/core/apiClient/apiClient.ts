import Axios, { type AxiosResponse, type AxiosInstance } from 'axios';

type ExtendedAxiosInstance = AxiosInstance & {
  isErrorResponse: (response: MaybeSuccessResponse) => response is MisymaApiErrorResponse;
};

export type MisymaApiErrorResponse = AxiosResponse<{
  context: {
    originalError: string;
    [key: string]: unknown;
  };
}>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MaybeSuccessResponse<T = any> = AxiosResponse<T> | MisymaApiErrorResponse;

export const api = Axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.misyma.com/api',
}) as ExtendedAxiosInstance;

api.isErrorResponse = (response): response is MisymaApiErrorResponse =>
  !(response.status >= 200 && response.status <= 299);
