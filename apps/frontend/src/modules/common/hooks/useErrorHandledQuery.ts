import { type UseQueryResult, type UseQueryOptions, useQuery, useQueryClient } from '@tanstack/react-query';

import { useToast } from '../components/toast/use-toast';
import { ApiError } from '../errors/apiError';

interface IErrorHandlingOptions {
  errorHandling?: {
    title?: string;
    description?: string;
  };
}

export type ExtendedQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = unknown[],
> = UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & IErrorHandlingOptions;

export type UseErrorHandledQueryResult<TData = unknown, TError = unknown> = UseQueryResult<TData, TError>;

export function useErrorHandledQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = unknown[],
>(options: ExtendedQueryOptions<TQueryFnData, TError, TData, TQueryKey>): UseErrorHandledQueryResult<TData, TError> {
  const { toast } = useToast();

  // todo: improve later
   
  const defaultRetry = useQueryClient().getDefaultOptions().queries?.retry as any;

  const result = useQuery({
    ...options,
    retry: (fc, err) => {
      const res = defaultRetry ? defaultRetry(fc, err) : false;

      if (res === false) {
        handleError(err);
      }

      return res;
    },
  });

  const handleError = (error: unknown) => {
    let descriptionValue = '';

    if (options.errorHandling?.description) {
      descriptionValue = options.errorHandling.description;
    } else if (error instanceof ApiError) {
      descriptionValue = error.context?.message;
    } else if (error instanceof Error) {
      descriptionValue = error.message;
    }

    if (error instanceof ApiError || error instanceof Error) {
      toast({
        title: options.errorHandling?.title || 'Wystąpił błąd.',
        description: descriptionValue,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Wystąpił błąd. Spróbuj ponownie.',
        description: descriptionValue,
        variant: 'destructive',
      });
    }
  };

  return result;
}
