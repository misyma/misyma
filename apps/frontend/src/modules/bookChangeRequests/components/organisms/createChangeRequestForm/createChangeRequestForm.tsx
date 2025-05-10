import { zodResolver } from '@hookform/resolvers/zod';
import { type FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { bookFormats, CreateBookChangeRequestRequestBody, languages } from '@common/contracts';

import { StepOneForm } from './stepOneForm/stepOneForm';
import { FindBookByIdQueryOptions } from '../../../../book/api/user/queries/findBookById/findBookByIdQueryOptions';
import { FindUserBookByIdQueryOptions } from '../../../../book/api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import LanguageSelect from '../../../../book/components/molecules/languageSelect/languageSelect';
import BookFormatSelect from '../../../../book/components/organisms/bookFormatSelect/bookFormatSelect';
import {
  BookDetailsChangeRequestAction,
  BookDetailsChangeRequestState,
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
import { getDiffBetweenObjects } from '../../../../common/utils/getDiffBetweenObjects';

interface Props {
  bookId: string;
  onSubmit: () => void;
  onCancel: () => void;
}

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
  format: z.nativeEnum(bookFormats).or(z.literal('')).optional(),
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
  const context = useBookDetailsChangeRequestContext();
  const dispatch = useBookDetailsChangeRequestDispatch();

  useEffect(() => {
    return () => {
      dispatch({
        type: BookDetailsChangeRequestAction.resetContext,
      });
    };
  }, [dispatch]);

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

  const currentStep = context?.currentStep || 1;

  if (currentStep === 1) {
    return (
      <StepOneForm
        bookId={bookId}
        onCancel={onCancel}
        onSubmit={(values) => {
          dispatch({
            type: BookDetailsChangeRequestAction.setValues,
            values: {
              ...values,
              currentStep: 2,
            } as unknown as Partial<BookDetailsChangeRequestState>,
          });
        }}
      />
    );
  }
  return (
    <StepTwoForm
      bookId={bookId}
      onCancel={onCancel}
      onSubmit={onSubmit}
      onBack={() => {
        dispatch({
          type: BookDetailsChangeRequestAction.setCurrentStep,
          step: 1,
        });
      }}
    />
  );
};

const StepTwoForm: FC<Props & { onBack: () => void }> = ({ bookId, onSubmit, onBack }) => {
  const { toast } = useToast();
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

  const form = useForm({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      language: context?.language || bookData?.language,
      translator: (context?.translator || bookData?.translator) ?? '',
      format: context?.format || bookData?.format,
      pages: (context?.pages || bookData?.pages) ?? '',
      categoryId: (context?.categoryId || bookData?.categoryId) ?? '',
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  const onSubmitForm = async (values: z.infer<typeof stepTwoSchema>) => {
    const payload = {
      ...context,
      ...(context?.authorIds ? { authorIds: context.authorIds } : {}),
      ...values,
      currentStep: undefined,
      bookId: bookData?.id as string,
    };

    const difference = getDiffBetweenObjects(payload, comparableBookData);

    try {
      await createBookChangeRequest(difference as unknown as CreateBookChangeRequestRequestBody);

      toast({
        title: 'Prośba o zmianę została wysłana.',
        variant: 'success',
      });

      form.reset();
      dispatch({
        type: BookDetailsChangeRequestAction.resetContext,
      });

      onSubmit();
    } catch (error) {
      if (error instanceof BookApiError) {
        toast({
          title: 'Coś poszlo nie tak. Spróbuj ponownie.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Nieznany błąd.',
          variant: 'destructive',
        });
      }
    }
  };

  const formValues = form.getValues();
  const combinedPayload = {
    ...context,
    ...(context?.authorIds ? { authorIds: context.authorIds } : {}),
    ...formValues,
    currentStep: undefined,
  };

  const comparableBookData = {
    ...bookData,
    authorIds: bookData?.authors.map((a) => a.id),
  };

  const difference = getDiffBetweenObjects(combinedPayload, comparableBookData);

  if (comparableBookData.translator === undefined) {
    delete difference['translator'];
  }

  const hasChanges = Object.keys(difference).length > 0;

  return (
    <Form {...form}>
      <form
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSubmit={form.handleSubmit(async (values) => await onSubmitForm(values as unknown as any))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Język</FormLabel>
              <LanguageSelect
                dialog={true}
                onValueChange={field.onChange}
                {...field}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
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
          control={form.control}
          name="format"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Format</FormLabel>
              <BookFormatSelect
                dialog={true}
                onValueChange={field.onChange}
                {...field}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
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
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategoria</FormLabel>
              <CategorySelect
                categories={categories?.data ?? []}
                onValueChange={field.onChange}
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
            onClick={onBack}
            type="button"
          >
            Wróć
          </Button>
          <Button
            size="lg"
            disabled={(!form.formState.isValid && form.formState.isDirty) || !hasChanges || isCreatingBookChangeRequest}
            type="submit"
          >
            {!isCreatingBookChangeRequest ? 'Prześlij prośbę' : <LoadingSpinner size={24} />}
          </Button>
        </div>
      </form>
    </Form>
  );
};
