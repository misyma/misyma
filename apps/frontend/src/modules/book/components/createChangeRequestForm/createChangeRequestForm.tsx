import { BookFormat as ContractBookFormat, Language } from '@common/contracts';
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../common/components/form/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../common/components/select/select';
import { Languages } from '../../../common/constants/languages';
import { Input } from '../../../common/components/input/input';
import { Button } from '../../../common/components/button/button';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';
import { StepOneForm } from './stepOneForm/stepOneForm';
import { BookFormat } from '../../../common/constants/bookFormat';
import {
  BookDetailsChangeRequestAction,
  useBookDetailsChangeRequestContext,
  useBookDetailsChangeRequestDispatch,
} from '../../context/bookDetailsChangeRequestContext/bookDetailsChangeRequestContext';
import { FindUserBookByIdQueryOptions } from '../../api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { FindBookByIdQueryOptions } from '../../api/user/queries/findBookById/findBookByIdQueryOptions';
import { useCreateBookChangeRequestMutation } from '../../../bookChangeRequests/api/user/mutations/createBookChangeRequestMutation/createBookChangeRequestMutation';
import { useToast } from '../../../common/components/toast/use-toast';
import { LoadingSpinner } from '../../../common/components/spinner/loading-spinner';
import { BookApiError } from '../../errors/bookApiError';

interface Props {
  bookId: string;
  onSubmit: () => void;
  onCancel: () => void;
}

const stepTwoSchema = z.object({
  language: z.nativeEnum(Language).optional(),
  translator: z
    .string({
      required_error: 'Tłumacz jest wymagany.',
    })
    .min(1, {
      message: 'Tłumacz jest zbyt krótki.',
    })
    .max(64, {
      message: 'Tłumacz może mieć maksymalnie 64 znaki.',
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
});

export const CreateChangeRequestForm: FC<Props> = ({ onCancel, bookId, onSubmit }) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: userData, isFetched: isUserDataFetched } = useFindUserQuery();

  const { data: userBookData, isFetched: isUserBookDataFetched } = useQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
      userId: userData?.id ?? '',
      accessToken: accessToken as string,
    }),
  );

  const { isFetched: isBookDataFetched } = useQuery(
    FindBookByIdQueryOptions({
      accessToken: accessToken as string,
      bookId: userBookData?.bookId as string,
    }),
  );

  if (!isUserDataFetched) {
    return <LoadingSpinner />;
  }

  if (!isUserBookDataFetched) {
    return <LoadingSpinner />;
  }

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

  const context = useBookDetailsChangeRequestContext();

  const dispatch = useBookDetailsChangeRequestDispatch();

  const { toast } = useToast();

  const { data: userData } = useFindUserQuery();

  const { data: userBookData } = useQuery(
    FindUserBookByIdQueryOptions({
      userBookId: bookId,
      userId: userData?.id ?? '',
      accessToken: accessToken as string,
    }),
  );

  const { data: bookData } = useQuery(
    FindBookByIdQueryOptions({
      accessToken: accessToken as string,
      bookId: userBookData?.bookId as string,
    }),
  );

  const { mutateAsync: createBookChangeRequest } = useCreateBookChangeRequestMutation({});

  const [currentStep, setCurrentStep] = useState<number>(1);

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
        authorIds: Array.isArray(payload.authorIds)? payload.authorIds : payload.authorIds?.split(','),
      });

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
            //   eslint-disable-next-line
            onSubmit={stepTwoForm.handleSubmit(async (data) => await onUpdate(data as any))}
            className="space-y-4"
          >
            <FormField
              control={stepTwoForm.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Język</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={<span className="text-muted-foreground">Język</span>} />
                        <SelectContent>
                          {Object.entries(Languages).map(([key, language]) => (
                            // todo: potentially fix :)
                            // eslint-disable-next-line
                            // @ts-ignore
                            <SelectItem value={Language[key]}>{language}</SelectItem>
                          ))}
                        </SelectContent>
                      </SelectTrigger>
                    </FormControl>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={stepTwoForm.control}
              name="translator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tłumacz</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Tłumacz"
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
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={<span className="text-muted-foreground">Format</span>} />
                        <SelectContent defaultValue={field.value}>
                          {Object.entries(BookFormat).map(([key, language]) => (
                            <SelectItem value={key}>{language}</SelectItem>
                          ))}
                        </SelectContent>
                      </SelectTrigger>
                    </FormControl>
                  </Select>
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
                disabled={!stepTwoForm.formState.isValid}
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
