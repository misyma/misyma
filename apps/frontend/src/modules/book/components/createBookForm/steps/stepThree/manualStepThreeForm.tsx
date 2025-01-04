import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { z } from 'zod';

import { ReadingStatus as ContractReadingStatus } from '@common/contracts';

import { useFindAuthorsQuery } from '../../../../../author/api/user/queries/findAuthorsQuery/findAuthorsQuery';
import { BookshelfSelector } from '../../../../../bookshelf/components/bookshelfSelector/bookshelfSelector';
import { StatusSelector } from '../../../../../bookshelf/components/statusSelector/statusSelector';
import {
  BookCreationActionType,
  type BookCreationNonIsbnState,
  NonIsbnCreationPathStep,
  useBookCreation,
  useBookCreationDispatch,
} from '../../../../../bookshelf/context/bookCreationContext/bookCreationContext';
import { Button } from '../../../../../common/components/button/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../../common/components/form/form';
import { FileInput } from '../../../../../common/components/input/input';
import { Select } from '../../../../../common/components/select/select';
import { LoadingSpinner } from '../../../../../common/components/spinner/loading-spinner';
import { useErrorHandledQuery } from '../../../../../common/hooks/useErrorHandledQuery';
import { useFileUpload } from '../../../../../common/hooks/useFileUpload';
import { userStateSelectors } from '../../../../../core/store/states/userState/userStateSlice';
import { getGenresQueryOptions } from '../../../../../genres/api/queries/getGenresQuery/getGenresQueryOptions';
import { useCreateBookWithUserBook } from '../../../../hooks/createBookWithUserBook/createBookWithUserBook';
import GenreSelect from '../../../genreSelect/genreSelect';

const stepThreeFormSchema = z.object({
  status: z.nativeEnum(ContractReadingStatus, {
    invalid_type_error: 'Niepoprawny typ',
    required_error: 'Wartość jest wymagana.',
  }),
  // todo: validation
  image: z
    .object(
      {},
      {
        required_error: 'Wymagany.',
      },
    )
    .or(z.undefined()),
  bookshelfId: z.string().uuid({
    message: 'Niewłaściwy format',
  }),
  genre: z.string().min(1, {
    message: 'Niewłaściwa wartość',
  }),
});

interface Props {
  bookshelfId: string;
}

export const ManualStepThreeForm = ({ bookshelfId }: Props): JSX.Element => {
  const bookCreation = useBookCreation<false>() as BookCreationNonIsbnState;

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const [bookshelfSelectOpen, setBookshelfSelectOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { file, setFile } = useFileUpload({
    fileInputRef,
  });

  const dispatch = useBookCreationDispatch();

  const { data: genres } = useErrorHandledQuery(
    getGenresQueryOptions({
      accessToken: accessToken as string,
    }),
  );

  const { refetch } = useFindAuthorsQuery({
    name: bookCreation.stepOneDetails?.authorName,
    enabled: false,
  });

  const form = useForm({
    resolver: zodResolver(stepThreeFormSchema),
    defaultValues: {
      status: bookCreation.stepThreeDetails?.status,
      image: file,
      bookshelfId: bookCreation.stepThreeDetails?.bookshelfId ?? '',
      genre: bookCreation.stepThreeDetails?.genre,
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  const { create, isProcessing } = useCreateBookWithUserBook({
    onAuthorCreationError: async () => {
      const result = await refetch();

      return result.data;
    },
    onOperationError: setSubmissionError,
  });

  const onSubmit = async (values: Partial<z.infer<typeof stepThreeFormSchema>>) => {
    await create({
      authorPayload: {
        authorId: bookCreation.stepOneDetails?.author,
        name: bookCreation.stepOneDetails?.authorName,
      },
      bookPayload: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        format: bookCreation.stepTwoDetails?.format as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        language: bookCreation.stepTwoDetails?.language as any,
        title: bookCreation.stepOneDetails?.title as string,
        translator: bookCreation.stepTwoDetails?.translator,
        pages: bookCreation.stepTwoDetails?.pagesCount,
        ...(bookCreation.stepTwoDetails as Required<BookCreationNonIsbnState['stepTwoDetails']>),
        ...(bookCreation.stepThreeDetails as Required<BookCreationNonIsbnState['stepThreeDetails']>),
        ...(bookCreation.stepOneDetails as Required<BookCreationNonIsbnState['stepOneDetails']>),
        isbn: bookCreation.stepOneDetails?.isbn === '' ? undefined : bookCreation.stepOneDetails?.isbn,
        releaseYear: bookCreation.stepOneDetails?.releaseYear as number,
        accessToken: accessToken as string,
        publisher: bookCreation.stepOneDetails?.publisher === '' ? undefined : bookCreation.stepOneDetails?.publisher,
      },
      userBookPayload: {
        bookshelfId: bookCreation.stepThreeDetails?.bookshelfId || bookshelfId,
        status: bookCreation.stepThreeDetails?.status || (values.status as ContractReadingStatus),
        isFavorite: false,
        genreId: bookCreation.stepThreeDetails?.genre as string,
        accessToken: accessToken as string,
      },
      image: file,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="bookshelfId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Półka</FormLabel>
              <Select
                open={bookshelfSelectOpen}
                onOpenChange={setBookshelfSelectOpen}
                onValueChange={(val) => {
                  dispatch({
                    type: BookCreationActionType.setBookshelfId,
                    bookshelfId: val as ContractReadingStatus,
                  });

                  field.onChange(val);
                }}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <BookshelfSelector
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        setBookshelfSelectOpen(false);
                      }
                    }}
                  />
                </FormControl>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <StatusSelector
                defaultValue={field.value}
                onValueChange={(val) => {
                  dispatch({
                    type: BookCreationActionType.setStatus,
                    status: val as ContractReadingStatus,
                  });

                  field.onChange(val);
                }}
                renderer={({ children }) => <FormControl>{children({})}</FormControl>}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <FormItem>
              <FormLabel>
                <span>Obrazek</span> <span className="text-gray-500">(opcjonalne)</span>
              </FormLabel>
              <FormControl>
                <FileInput
                  {...fieldProps}
                  type="file"
                  accept="image/jpeg"
                  fileName={(value as unknown as File)?.name}
                  onChange={(event) => {
                    onChange(event.target.files && event.target.files[0]);

                    setFile(event.target.files ? (event.target?.files[0] ?? undefined) : undefined);
                  }}
                  ref={fileInputRef}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="genre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategoria</FormLabel>
              <GenreSelect
                genres={genres?.data ?? []}
                onValueChange={(val) => {
                  dispatch({
                    type: BookCreationActionType.setGenre,
                    genre: val,
                  });
                }}
                {...field}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex w-full gap-4 justify-between">
          <Button
            size="lg"
            variant={isProcessing ? 'ghost' : 'outline'}
            disabled={isProcessing}
            onClick={() => {
              dispatch({
                type: BookCreationActionType.setStep,
                step: NonIsbnCreationPathStep.inputSecondDetails,
              });
            }}
          >
            Wróć
          </Button>
          <Button
            size="lg"
            variant={isProcessing ? 'ghost' : 'default'}
            disabled={!form.formState.isValid || isProcessing}
            type="submit"
          >
            {isProcessing && <LoadingSpinner size={40} />}
            {!isProcessing && <>Dodaj książkę</>}
          </Button>
        </div>
        {submissionError ? <p className="text-red-500">{submissionError}</p> : <></>}
      </form>
    </Form>
  );
};
