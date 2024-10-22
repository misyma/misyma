import { BookFormat as ContractBookFormat, Language } from '@common/contracts';
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../common/components/form/form';
import { Input } from '../../../common/components/input/input';
import { Button } from '../../../common/components/button/button';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';
import { StepOneForm } from './stepOneForm/stepOneForm';
import {
  BookDetailsChangeRequestAction,
  useBookDetailsChangeRequestContext,
  useBookDetailsChangeRequestDispatch,
} from '../../../book/context/bookDetailsChangeRequestContext/bookDetailsChangeRequestContext';
import { FindUserBookByIdQueryOptions } from '../../../book/api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { FindBookByIdQueryOptions } from '../../../book/api/user/queries/findBookById/findBookByIdQueryOptions';
import {
  CreateBookChangeRequestPayload,
  useCreateBookChangeRequestMutation,
} from '../../api/user/mutations/createBookChangeRequestMutation/createBookChangeRequestMutation';
import { useToast } from '../../../common/components/toast/use-toast';
import { LoadingSpinner } from '../../../common/components/spinner/loading-spinner';
import { BookApiError } from '../../../book/errors/bookApiError';
import { useCreateAuthorDraftMutation } from '../../../author/api/user/mutations/createAuthorDraftMutation/createAuthorDraftMutation';
import LanguageSelect from '../../../book/components/languageSelect/languageSelect';
import BookFormatSelect from '../../../book/components/bookFormatSelect/bookFormatSelect';

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
    .or(z.literal(''))
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
    .or(z.literal(''))
    .optional(),
});

export const CreateChangeRequestForm: FC<Props> = ({
  onCancel,
  bookId,
  onSubmit,
}) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: userData, isFetched: isUserDataFetched } = useFindUserQuery();

  const { data: userBookData, isFetched: isUserBookDataFetched } = useQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
      userId: userData?.id ?? '',
      accessToken: accessToken as string,
    })
  );

  const { isFetched: isBookDataFetched } = useQuery(
    FindBookByIdQueryOptions({
      accessToken: accessToken as string,
      bookId: userBookData?.bookId as string,
    })
  );

  if (!isUserDataFetched || !isUserBookDataFetched || !isBookDataFetched) {
    return <LoadingSpinner />;
  }

  return (
    <UnderlyingForm bookId={bookId} onCancel={onCancel} onSubmit={onSubmit} />
  );
};

const UnderlyingForm: FC<Props> = ({ onCancel, bookId, onSubmit }) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<number>(1);

  const context = useBookDetailsChangeRequestContext();
  const dispatch = useBookDetailsChangeRequestDispatch();

  const { data: userData } = useFindUserQuery();
  const { data: userBookData } = useQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
      userId: userData?.id ?? '',
      accessToken: accessToken as string,
    })
  );
  const { data: bookData } = useQuery(
    FindBookByIdQueryOptions({
      accessToken: accessToken as string,
      bookId: userBookData?.bookId as string,
    })
  );

  const { mutateAsync: createBookChangeRequest } =
    useCreateBookChangeRequestMutation({});

  const stepTwoForm = useForm({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      language: bookData?.language,
      translator: bookData?.translator,
      format: bookData?.format,
      pages: bookData?.pages,
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

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

  const { mutateAsync: createAuthorDraft, isPending: isCreateAuthorPending } =
    useCreateAuthorDraftMutation({});

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

      if (!bookData) {
        return;
      }

      if (bookData[bookDataKey] === value) {
        delete payload[bookDataKey];
        return;
      }

      if (
        Array.isArray(bookData[bookDataKey]) &&
        bookData[bookDataKey]?.[0] === value
      ) {
        delete payload[bookDataKey];
        return;
      }

      if (
        bookData?.authors &&
        Array.isArray(value) &&
        key === 'authorIds' &&
        bookData.authors[0]?.id === value[0]
      ) {
        delete payload['authorIds'];
        return;
      }

      if (key === 'pages' && value === '' && bookData.pages !== 0) {
        payload[key] = null as unknown as number;
        return;
      }

      if (key === 'translator' && value === '' && bookData.translator !== '') {
        payload[key] = null as unknown as string;
        return;
      }

      if (!value) {
        delete payload[bookDataKey];
      }
    });

    if (Object.entries(payload).length === 2) {
      onSubmit();

      return;
    }

    try {
      await createBookChangeRequest({
        ...payload,
        pages: payload.pages !== undefined ? null : payload.pages,
        authorIds: Array.isArray(payload.authorIds)
          ? payload.authorIds
          : payload.authorIds?.split(','),
      } as CreateBookChangeRequestPayload);

      toast({
        title: 'Prośba o zmianę została wysłana.',
        variant: 'success',
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
                      onChange={(e) => {
                        field.onChange(e);
                      }}
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
                disabled={
                  !stepTwoForm.formState.isValid || isCreateAuthorPending
                }
                type="submit"
              >
                Prześlij prośbę
              </Button>
            </div>
          </form>
        </Form>
      )}
    </>
  );
};
