import {
  type UseMutateAsyncFunction,
  type UseMutateFunction,
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';

import { useToast } from '../components/toast/use-toast';
import { ApiError } from '../errors/apiError';

interface IErrorHandlingPayload {
  errorHandling?: {
    title?: string;
    description?: string;
  };
}

export type ExtendedTPayload<TPayload> = TPayload & IErrorHandlingPayload;

type Override<T1, T2> = Omit<T1, keyof T2> & T2;

export type UseErrorHandledMutation<TResponseBody, TError, TPayload> = Override<
  UseMutationResult<TResponseBody, TError, ExtendedTPayload<TPayload>>,
  {
    mutate: UseMutateFunction<TResponseBody, TError, ExtendedTPayload<TPayload>, unknown>;
    mutateAsync: UseMutateAsyncFunction<TResponseBody, TError, ExtendedTPayload<TPayload>, unknown>;
  }
>;

export type UseErrorHandledMutationOptions<TResponseBody, TError, TPayload> = UseMutationOptions<
  TResponseBody,
  TError,
  ExtendedTPayload<TPayload>
>;

export function useErrorHandledMutation<TResponseBody, TError, TPayload>(
  options: UseErrorHandledMutationOptions<TResponseBody, TError, ExtendedTPayload<TPayload>>,
): UseErrorHandledMutation<TResponseBody, TError, TPayload> {
  const { toast } = useToast();

  const onError = async (
    error: unknown,
    { errorHandling }: ExtendedTPayload<TPayload>,
  ): Promise<TResponseBody | undefined> => {
    let descriptionValue = '';

    if (errorHandling?.description) {
      descriptionValue = errorHandling.description;
    }

    if (!errorHandling?.description && error instanceof ApiError) {
      descriptionValue = (error as ApiError)?.context?.message;
    }

    if (!errorHandling?.description && !(error instanceof ApiError) && error instanceof Error) {
      descriptionValue = (error as Error)?.message;
    }

    if (error instanceof ApiError) {
      toast({
        title: errorHandling?.title || 'Wystąpił bład.',
        description: descriptionValue,
        variant: 'destructive',
      });

      return;
    }

    if (error instanceof Error) {
      toast({
        title: errorHandling?.title || 'Wystąpił bład.',
        description: descriptionValue,
        variant: 'destructive',
      });

      return;
    }

    toast({
      title: 'Wystąpił błąd. Spróbuj ponownie.',
      description: descriptionValue,
      variant: 'destructive',
    });
  };

  const result = useMutation<TResponseBody, TError, ExtendedTPayload<TPayload>>({
    ...options,
    mutationFn: (vars) => {
      const varsNoErrorHandling = Object.entries(vars).reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (acc: any, [key, val]) => {
          if (key === 'errorHandling') {
            return acc;
          }

          acc[key] = val;

          return acc;
        },
        {} as TPayload,
      );

      if (!options.mutationFn) {
        throw new Error('No mutation function provided.');
      }

      return options.mutationFn(varsNoErrorHandling);
    },
    onError: (error, variables, context) => {
      if (options.onError) {
        options.onError(error, variables, context);
      }

      onError(error, variables);
    },
  });

  return {
    ...result,
  };
}
