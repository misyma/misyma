import { zodResolver } from '@hookform/resolvers/zod';
import { type FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthorFieldTooltip } from '../../../../../author/components/organisms/authorFieldTooltip';
import { AuthorMultiCombobox } from '../../../../../author/components/organisms/authorMultiCombobox/authorMultiCombobox';
import { FindBookByIdQueryOptions } from '../../../../../book/api/user/queries/findBookById/findBookByIdQueryOptions';
import { FindUserBookByIdQueryOptions } from '../../../../../book/api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { useBookDetailsChangeRequestContext } from '../../../../../book/context/bookDetailsChangeRequestContext/bookDetailsChangeRequestContext';
import { Button } from '../../../../../common/components/button/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../../common/components/form/form';
import { Input } from '../../../../../common/components/input/input';
import { Popover, PopoverTrigger } from '../../../../../common/components/popover/popover';
import { LoadingSpinner } from '../../../../../common/components/spinner/loading-spinner';
import { useErrorHandledQuery } from '../../../../../common/hooks/useErrorHandledQuery';
import { isbnSchema } from '../../../../../common/schemas/isbnSchema';
import { bookTitleSchema, publisherSchema, releaseYearSchema } from '../../../../../book/schemas/bookSchemas';

const stepOneSchema = z.object({
  isbn: isbnSchema.optional().or(z.literal('')),
  title: bookTitleSchema.or(z.literal('')),
  authorIds: z
    .array(
      z
        .string({
          required_error: 'Wymagany',
        })
        .uuid({
          message: 'Brak wybranego autora.',
        }),
    )
    .min(1, {
      message: 'Wymagany jest co najmniej jeden autor.',
    }),
  releaseYear: releaseYearSchema.or(z.literal('')),
  publisher: publisherSchema.or(z.literal('')),
});

interface Props {
  onCancel: () => void;
  onSubmit: (values: z.infer<typeof stepOneSchema>) => void;
  bookId: string;
}

export const StepOneFormDataTestIds = {
  isbn: {
    label: 'change-request-isbn-label',
    input: 'change-request-isbn-input',
  },
  title: {
    label: 'change-request-title-label',
    input: 'change-request-title-input',
  },
  authors: {
    label: 'change-request-author-label',
  },
  releaseYear: {
    label: 'change-request-release-year-label',
    input: 'change-request-release-year-input',
  },
  publisher: {
    label: 'change-request-publisher-label',
    input: 'change-request-publisher-input',
  },
  backButton: 'create-change-request-back-button',
  continueButton: 'create-change-request-continue-button',
} as const;

export const StepOneForm: FC<Props> = ({ bookId, onCancel, onSubmit }) => {
  const { data: userBookData, isFetched: isUserBookDataFetched } = useErrorHandledQuery({
    ...FindUserBookByIdQueryOptions({
      userBookId: bookId,
    }),
  });

  const { isFetched: isBookDataFetched } = useErrorHandledQuery(
    FindBookByIdQueryOptions({
      bookId: userBookData?.bookId as string,
    }),
  );

  if (!isBookDataFetched || !isUserBookDataFetched) {
    return <LoadingSpinner />;
  }

  return (
    <ModalForm
      bookId={bookId}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  );
};

const ModalForm: FC<Props> = ({ bookId, onSubmit, onCancel }) => {
  const context = useBookDetailsChangeRequestContext();

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

  const [createAuthorDialogVisible, setCreateAuthorDialogVisible] = useState(false);

  const stepOneForm = useForm({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      isbn: (context.isbn || bookData?.isbn) ?? '',
      title: (context.title || bookData?.title) ?? '',
      authorIds: context.authorIds.length === 0 ? (bookData?.authors.map((a) => a.id) ?? []) : context.authorIds,
      publisher: (context.publisher || bookData?.publisher) ?? '',
      releaseYear: (context.releaseYear || bookData?.releaseYear) ?? ('' as const),
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  return (
    <Form {...stepOneForm}>
      <form
        onSubmit={stepOneForm.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          name="isbn"
          control={stepOneForm.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel data-testid={StepOneFormDataTestIds.isbn.label}>ISBN</FormLabel>
              <FormControl>
                <Input
                  data-testid={StepOneFormDataTestIds.isbn.input}
                  placeholder="111-11-1111-111-1"
                  type="text"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="title"
          control={stepOneForm.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel data-testid={StepOneFormDataTestIds.title.label}>Tytuł</FormLabel>
              <FormControl>
                <Input
                  data-testid={StepOneFormDataTestIds.title.input}
                  placeholder="Tytuł"
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
          name="authorIds"
          control={stepOneForm.control}
          render={() => (
            <FormItem className="flex flex-col">
              <div className="flex gap-2 items-center">
                <FormLabel data-testid={StepOneFormDataTestIds.authors.label}>Autorzy</FormLabel>
                <AuthorFieldTooltip />
              </div>
              <FormControl>
                <Popover modal={false}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <AuthorMultiCombobox
                        createAuthorDialogVisible={createAuthorDialogVisible}
                        onValueChange={(v) => {
                          stepOneForm.setValue(
                            'authorIds',
                            v.map((v) => v.value),
                          );

                          stepOneForm.trigger('authorIds');

                          setCreateAuthorDialogVisible(false);
                        }}
                        defaultValue={bookData?.authors.map((a) => a.id)}
                        setAuthorSelectOpen={setCreateAuthorDialogVisible}
                      />
                    </FormControl>
                  </PopoverTrigger>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="releaseYear"
          control={stepOneForm.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel data-testid={StepOneFormDataTestIds.releaseYear.label}>Rok wydania</FormLabel>
              <FormControl>
                <Input
                  data-testid={StepOneFormDataTestIds.releaseYear.input}
                  placeholder="1939"
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
          name="publisher"
          control={stepOneForm.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel data-testid={StepOneFormDataTestIds.publisher.label}>Wydawnictwo</FormLabel>
              <FormControl>
                <Input
                  data-testid={StepOneFormDataTestIds.publisher.input}
                  placeholder="Wydawnictwo"
                  type="text"
                  maxLength={128}
                  includeQuill={false}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-row w-full justify-between gap-4">
          <Button
            data-testid={StepOneFormDataTestIds.backButton}
            size="lg"
            variant="outline"
            onClick={() => {
              stepOneForm.reset();
              onCancel();
            }}
            className="border border-primary w-full bg-transparent text-primary"
          >
            Wróć
          </Button>
          <Button
            data-testid={StepOneFormDataTestIds.continueButton}
            type="submit"
            size="lg"
            className="border border-primary w-full"
            disabled={!stepOneForm.formState.isValid}
            onClick={() => {
              onSubmit(stepOneForm.getValues());
            }}
          >
            Kontynuuj
          </Button>
        </div>
      </form>
    </Form>
  );
};
