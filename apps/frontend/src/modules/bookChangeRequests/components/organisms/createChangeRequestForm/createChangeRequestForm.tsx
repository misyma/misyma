import { zodResolver } from '@hookform/resolvers/zod';
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { BookFormat, bookFormats, CreateBookChangeRequestRequestBody, languages } from '@common/contracts';

import { StepOneForm } from './stepOneForm/stepOneForm';
import { FindBookByIdQueryOptions } from '../../../../book/api/user/queries/findBookById/findBookByIdQueryOptions';
import { FindUserBookByIdQueryOptions } from '../../../../book/api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import LanguageSelect from '../../../../book/components/molecules/languageSelect/languageSelect';
import BookFormatSelect from '../../../../book/components/organisms/bookFormatSelect/bookFormatSelect';
import {
  BookDetailsChangeRequestAction,
  useBookDetailsChangeRequestContext,
  useBookDetailsChangeRequestDispatch,
} from '../../../../book/context/bookDetailsChangeRequestContext/bookDetailsChangeRequestContext';
import { BookApiError } from '../../../../book/errors/bookApiError';
import { Button } from '../../../../common/components/button/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../common/components/form/form';
import { Input } from '../../../../common/components/input/input';
import { LoadingSpinner } from '../../../../common/components/spinner/loading-spinner';
import { useToast } from '../../../../common/components/toast/use-toast';
import { useErrorHandledQuery } from '../../../../common/hooks/useErrorHandledQuery';
import { useCreateBookChangeRequestMutation } from '../../../api/user/mutations/createBookChangeRequestMutation/createBookChangeRequestMutation';
import CategorySelect from '../../../../book/components/molecules/categorySelect/categorySelect';
import { getCategoriesQueryOptions } from '../../../../categories/api/queries/getCategoriesQuery/getCategoriesQueryOptions';

interface Props {
  bookId: string;
  onSubmit: () => void;
  onCancel: () => void;
}

type Writeable<T> = {
  -readonly [P in keyof T]: T[P];
};

const stepTwoSchema = z.object({
  language: z.nativeEnum(languages).optional(),
  translator: z
    .string({
      required_error: 'Przekład jest wymagany.',
    })
    .min(1, {
      message: 'Przekład jest zbyt krótki.',
    })
    .max(64, {
      message: 'Przekład może mieć maksymalnie 64 znaki.',
    })
    .or(z.literal(''))
    .optional(),
  format: z.nativeEnum(bookFormats).optional(),
  pages: z
    .number({
      required_error: 'Ilość stron jest wymagana.',
      coerce: true,
    })
    .int({
      message: 'Ilość stron musi być wartością całkowitą.',
    })
    .min(1, {
      message: 'Książka nie może mieć mniej niż jedną stronę.',
    })
    .max(5000, {
      message: 'Za dużo stron. Maksymalnie 5000 stron jest dozwolonych.',
    })
    .or(z.literal(''))
    .optional(),
  categoryId: z.string().optional(),
});

export const CreateChangeRequestForm: FC<Props> = ({ onCancel, bookId, onSubmit }) => {
  const { data: userBookData, isFetched: isUserBookDataFetched } = useErrorHandledQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
    }),
  );

  const { isFetched: isBookDataFetched } = useErrorHandledQuery(
    FindBookByIdQueryOptions({
      bookId: userBookData?.bookId as string,
    }),
  );

  if (!isUserBookDataFetched || !isBookDataFetched) {
    return <LoadingSpinner />;
  }

  return (
    <UnderlyingForm
      bookId={bookId}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  );
};

//todo: refactor
const UnderlyingForm: FC<Props> = ({ onCancel, bookId, onSubmit }) => {
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<number>(1);

  const context = useBookDetailsChangeRequestContext();
  const dispatch = useBookDetailsChangeRequestDispatch();

  const { data: userBookData } = useErrorHandledQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
    }),
  );
  const { data: bookData } = useErrorHandledQuery(
    FindBookByIdQueryOptions({
      bookId: userBookData?.bookId as string,
    }),
  );

  const { data: categories } = useErrorHandledQuery(getCategoriesQueryOptions({}));

  const { mutateAsync: createBookChangeRequest, isPending: isCreatingBookChangeRequest } =
    useCreateBookChangeRequestMutation({});

  const stepTwoForm = useForm({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      language: context?.language || bookData?.language,
      translator: (context?.translator || bookData?.translator) ?? '',
      format: (context?.format || bookData?.format) ?? '',
      pages: (context?.pages || bookData?.pages) ?? '',
      categoryId: (context?.categoryId || bookData?.categoryId) ?? '',
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  useEffect(() => {
    if (stepTwoForm.formState.isDirty) {
      return;
    }
    if (!bookData) {
      return;
    }
    stepTwoForm.setValue('format', bookData?.format as BookFormat);
    stepTwoForm.setValue('language', bookData.language);
    stepTwoForm.setValue('pages', bookData.pages ?? '');
    stepTwoForm.setValue('translator', bookData.translator ?? '');
    stepTwoForm.setValue('categoryId', bookData.categoryId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookData]);

  // eslint-disable-next-line
  const onProceedToNextStep = (vals: any) => {
    dispatch({
      type: BookDetailsChangeRequestAction.setValues,
      values: {
        ...vals,
      },
    });

    setCurrentStep(2);
  };

  const preparePayload = useCallback(
    (
      object: Writeable<CreateBookChangeRequestRequestBody>,
      objectToUpdate: Writeable<CreateBookChangeRequestRequestBody>,
    ) => {
      Object.entries(object).forEach(([key, value]) => {
        const bookDataKey = key as keyof typeof bookData;

        if (!bookData) {
          return;
        }

        if (bookData[bookDataKey] === value) {
          delete objectToUpdate[bookDataKey];
          return;
        }

        if (Array.isArray(bookData[bookDataKey]) && bookData[bookDataKey]?.[0] === value) {
          delete objectToUpdate[bookDataKey];
          return;
        }

        if (bookData?.authors && Array.isArray(value) && key === 'authorIds' && value.length === 0) {
          delete objectToUpdate['authorIds'];
          return;
        }

        if (
          bookData?.authors &&
          Array.isArray(value) &&
          key === 'authorIds' &&
          bookData.authors.every((x) => value.includes(x.id))
        ) {
          delete objectToUpdate['authorIds'];
          return;
        }

        if (key === 'pages' && value === '' && bookData.pages !== undefined) {
          objectToUpdate[key] = null as unknown as number;
          return;
        }

        if (key === 'translator' && value === '' && bookData.translator !== undefined) {
          objectToUpdate[key] = null as unknown as string;
          return;
        }

        if (!value) {
          delete objectToUpdate[bookDataKey];
        }
      });
    },
    [bookData],
  );

  const payload = useMemo(
    () => ({
      ...context,
      ...(context?.authorIds
        ? {
            authorIds: context.authorIds,
          }
        : {}),
      ...stepTwoForm.getValues(),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [context, stepTwoForm, stepTwoForm.getValues()],
  );

  const updatePayload = useMemo(() => {
    const innerPayload = { ...payload };

    preparePayload(
      payload as unknown as CreateBookChangeRequestRequestBody,
      innerPayload as unknown as CreateBookChangeRequestRequestBody,
    );

    return innerPayload;
  }, [payload, preparePayload]);

  const onUpdate = async (values: z.infer<typeof stepTwoSchema>) => {
    const payload = {
      ...context,
      ...(context?.authorIds
        ? {
            authorIds: context.authorIds,
          }
        : {}),
      ...values,
      bookId: bookData?.id as string,
    };

    preparePayload(payload as CreateBookChangeRequestRequestBody, payload as CreateBookChangeRequestRequestBody);

    try {
      await createBookChangeRequest({
        ...payload,
      } as CreateBookChangeRequestRequestBody);

      toast({
        title: 'Prośba o zmianę została wysłana.',
        variant: 'success',
      });

      dispatch({
        type: BookDetailsChangeRequestAction.resetContext,
      });
    } catch (error) {
      if (error instanceof BookApiError) {
        return toast({
          title: 'Coś poszlo nie tak. Spróbuj ponownie.',
          variant: 'destructive',
        });
      }

      toast({
        title: 'Nieznany błąd.',
        variant: 'destructive',
      });
    } finally {
      stepTwoForm.reset();
      onSubmit();
    }
  };

  const onCancelInternal = () => {
    dispatch({
      type: BookDetailsChangeRequestAction.resetContext,
    });
    onCancel();
  };

  return (
    <>
      {currentStep === 1 ? (
        <StepOneForm
          onCancel={onCancelInternal}
          bookId={bookId}
          onSubmit={onProceedToNextStep}
        />
      ) : (
        <Form {...stepTwoForm}>
          <form
            onSubmit={stepTwoForm.handleSubmit(
              //   eslint-disable-next-line
              async (data) => await onUpdate(data as any),
            )}
            className="space-y-4"
          >
            <FormField
              control={stepTwoForm.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Język</FormLabel>
                  <LanguageSelect
                    dialog={true}
                    onValueChange={(val) => {
                      field.onChange(val);
                    }}
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={stepTwoForm.control}
              name="translator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Przekład</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Przekład"
                      type="text"
                      includeQuill={false}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={stepTwoForm.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Format</FormLabel>
                  <BookFormatSelect
                    dialog={true}
                    onValueChange={(val) => {
                      field.onChange(val);
                    }}
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={stepTwoForm.control}
              name="pages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ilość stron</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ilość stron"
                      type="number"
                      includeQuill={false}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={stepTwoForm.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategoria</FormLabel>
                  <CategorySelect
                    categories={categories?.data ?? []}
                    onValueChange={(val) => {
                      field.onChange(val);
                    }}
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between w-full gap-4">
              <Button
                size="lg"
                variant="outline"
                onClick={() => setCurrentStep(1)}
              >
                Wróć
              </Button>
              <Button
                size="lg"
                disabled={
                  !stepTwoForm.formState.isValid ||
                  Object.entries(updatePayload).length === 0 ||
                  isCreatingBookChangeRequest
                }
                type="submit"
              >
                {!isCreatingBookChangeRequest && 'Prześlij prośbę'}
                {isCreatingBookChangeRequest && <LoadingSpinner size={24} />}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </>
  );
};
