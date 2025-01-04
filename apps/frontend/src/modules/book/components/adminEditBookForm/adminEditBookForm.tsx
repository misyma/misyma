import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { type FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { z } from 'zod';

import { BookFormat as ContractBookFormat, Language } from '@common/contracts';

import { StepOneForm } from './stepOneForm/stepOneForm';
import { useCreateAuthorDraftMutation } from '../../../author/api/user/mutations/createAuthorDraftMutation/createAuthorDraftMutation';
import { Button } from '../../../common/components/button/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../common/components/form/form';
import { Input } from '../../../common/components/input/input';
import { LoadingSpinner } from '../../../common/components/spinner/loading-spinner';
import { useToast } from '../../../common/components/toast/use-toast';
import { useErrorHandledQuery } from '../../../common/hooks/useErrorHandledQuery';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useUpdateBookMutation } from '../../api/admin/mutations/updateBookMutation/updateBookMutation';
import { BookApiQueryKeys } from '../../api/user/queries/bookApiQueryKeys';
import { FindBookByIdQueryOptions } from '../../api/user/queries/findBookById/findBookByIdQueryOptions';
import {
  AdminEditBookAction,
  useAdminEditBookContext,
  useAdminEditBookDispatch,
} from '../../context/adminEditBookContext/adminEditBookContext';
import { BookApiError } from '../../errors/bookApiError';
import BookFormatSelect from '../bookFormatSelect/bookFormatSelect';
import LanguageSelect from '../languageSelect/languageSelect';

interface Props {
  bookId: string;
  onSubmit: () => void;
  onCancel: () => void;
}

const stepTwoSchema = z.object({
  language: z.nativeEnum(Language).optional(),
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
    .optional(),
  format: z.nativeEnum(ContractBookFormat).optional(),
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
    .optional(),
  imageUrl: z
    .string({
      message: 'Niepoprawna wartość.',
    })
    .url({
      message: 'Podana wartość nie jest prawidłowym linkiem.',
    })
    .or(z.literal('')),
});

export const AdminEditBookForm: FC<Props> = ({ onCancel, bookId, onSubmit }) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { isFetched: isBookDataFetched } = useErrorHandledQuery(
    FindBookByIdQueryOptions({
      accessToken: accessToken as string,
      bookId,
    }),
  );

  if (!isBookDataFetched) {
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

const UnderlyingForm: FC<Props> = ({ onCancel, bookId, onSubmit }) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const queryClient = useQueryClient();

  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<number>(1);

  const context = useAdminEditBookContext();

  const dispatch = useAdminEditBookDispatch();

  const { data: bookData } = useErrorHandledQuery(
    FindBookByIdQueryOptions({
      accessToken: accessToken as string,
      bookId: bookId as string,
    }),
  );

  const { mutateAsync: createBookChangeRequest } = useUpdateBookMutation({});

  const stepTwoForm = useForm({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      language: bookData?.language,
      translator: bookData?.translator,
      format: bookData?.format,
      pages: bookData?.pages,
      imageUrl: bookData?.imageUrl ?? '',
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  // eslint-disable-next-line
  const onProceedToNextStep = (vals: any) => {
    dispatch({
      type: AdminEditBookAction.setValues,
      values: {
        ...vals,
      },
    });

    setCurrentStep(2);
  };

  const { mutateAsync: createAuthorDraft, isPending: isCreateAuthorPending } = useCreateAuthorDraftMutation({});

  const onUpdate = async (values: z.infer<typeof stepTwoSchema>) => {
    const payload = {
      ...context,
      ...(context?.authorIds
        ? {
            authorIds: [context.authorIds],
          }
        : {}),
      ...values,
      accessToken: accessToken as string,
      bookId: bookData?.id as string,
    };

    if (context.authorName) {
      const createdAuthor = await createAuthorDraft({
        name: context.authorName,
      });

      payload.authorIds = [createdAuthor.id];
    }

    Object.entries(payload).forEach(([key, value]) => {
      const bookDataKey = key as keyof typeof bookData;

      if (bookData && bookData[bookDataKey] === value) {
        delete payload[key as keyof typeof payload];
      }

      if (
        bookData &&
        bookData[bookDataKey] &&
        Array.isArray(bookData[bookDataKey]) &&
        bookData[bookDataKey][0] === value
      ) {
        delete payload[key as keyof typeof payload];
      }

      if (
        bookData &&
        bookData['authors'] &&
        Array.isArray(bookData['authors']) &&
        key === 'authorIds' &&
        Array.isArray(value) &&
        bookData['authors'][0]?.id === value[0]
      ) {
        delete payload['authorIds'];
      }

      if (!value) {
        delete payload[key as keyof typeof payload];
      }
    });

    if (Object.entries(payload).length === 2) {
      onSubmit();

      return;
    }

    try {
      await createBookChangeRequest({
        ...payload,
        authorIds: Array.isArray(payload.authorIds) ? payload.authorIds : payload.authorIds?.split(','),
      });

      toast({
        title: 'Edycja książki zakończona sukcesem.',
        variant: 'success',
      });

      await queryClient.invalidateQueries({
        predicate: ({ queryKey }) => queryKey[0] === BookApiQueryKeys.findBooksAdmin,
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
      onSubmit();
    }
  };

  return (
    <>
      {currentStep === 1 ? (
        <StepOneForm
          onCancel={onCancel}
          bookId={bookId}
          onSubmit={onProceedToNextStep}
        />
      ) : (
        <Form {...stepTwoForm}>
          <form
            onSubmit={stepTwoForm.handleSubmit(
              //   eslint-disable-next-line
              async (data) => await onUpdate(data as any)
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={stepTwoForm.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link do obrazka</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Link do obrazka"
                      type="text"
                      includeQuill={false}
                      {...field}
                    />
                  </FormControl>
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
                disabled={!stepTwoForm.formState.isValid || isCreateAuthorPending}
                type="submit"
              >
                Aktualizuj
              </Button>
            </div>
          </form>
        </Form>
      )}
    </>
  );
};
