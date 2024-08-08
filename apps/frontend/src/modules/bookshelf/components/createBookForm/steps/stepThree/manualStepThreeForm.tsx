import { z } from 'zod';
import {
  BookCreationActionType,
  BookCreationNonIsbnState,
  NonIsbnCreationPathStep,
  useBookCreation,
  useBookCreationDispatch,
} from '../../../../context/bookCreationContext/bookCreationContext';
import { ReadingStatus as ContractReadingStatus } from '@common/contracts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../../common/components/form/form';
import { FileInput } from '../../../../../common/components/input/input';
import { Button } from '../../../../../common/components/button/button';
import { useFindUserQuery } from '../../../../../user/api/queries/findUserQuery/findUserQuery';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../common/components/select/select';
import { ReadingStatus } from '../../../../../common/constants/readingStatus';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getGenresQueryOptions } from '../../../../../genres/api/queries/getGenresQuery/getGenresQueryOptions';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../../core/store/states/userState/userStateSlice';
import { useFindUserBookshelfsQuery } from '../../../../api/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';
import { useFindAuthorsQuery } from '../../../../../author/api/user/queries/findAuthorsQuery/findAuthorsQuery';
import { useCreateBookWithUserBook } from '../../../../hooks/createBookWithUserBook/createBookWithUserBook';
import { LoadingSpinner } from '../../../../../common/components/spinner/loading-spinner';

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

  const [genreSelectOpen, setGenreSelectOpen] = useState(false);

  const [bookshelfSelectOpen, setBookshelfSelectOpen] = useState(false);

  const [statusSelectOpen, setStatusSelectOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const dispatch = useBookCreationDispatch();

  const { data: user } = useFindUserQuery();

  const { data: bookshelvesData } = useFindUserBookshelfsQuery({
    userId: user?.id as string,
    pageSize: 50,
  });

  const { data } = useQuery(
    getGenresQueryOptions({
      accessToken: accessToken as string,
    }),
  );

  const [file, setFile] = useState<File | undefined>();

  useEffect(() => {
    if (file) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  }, [file]);

  const form = useForm({
    resolver: zodResolver(stepThreeFormSchema),
    defaultValues: {
      status: bookCreation.stepThreeDetails?.status,
      image: file,
      bookshelfId,
      genre: bookCreation.stepThreeDetails?.genre,
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  const { refetch } = useFindAuthorsQuery({
    name: bookCreation.stepOneDetails?.authorName,
    enabled: false,
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
        releaseYear:
          // eslint-disable-next-line
          (bookCreation.stepOneDetails?.yearOfIssue as any) === ''
            ? undefined
            : bookCreation.stepOneDetails?.yearOfIssue,
        accessToken: accessToken as string,
        publisher: bookCreation.stepOneDetails?.publisher === '' ? undefined : bookCreation.stepOneDetails?.publisher,
      },
      userBookPayload: {
        bookshelfId: bookCreation.stepThreeDetails?.bookshelfId || bookshelfId,
        status: bookCreation.stepThreeDetails?.status || (values.status as ContractReadingStatus),
        isFavorite: false,
        genreIds: [bookCreation.stepThreeDetails?.genre as string],
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
              >
                <FormControl>
                  <SelectTrigger className='text-start'>
                    <SelectValue
                      placeholder="Półka"
                    />
                    <SelectContent>
                      {bookshelvesData?.data
                        .filter((bookshelf) => bookshelf.name !== 'Wypożyczalnia')
                        .map((bookshelf) => (
                          <SelectItem
                            className='text-start'
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                setBookshelfSelectOpen(false);
                              }
                            }}
                            value={bookshelf.id}
                          >
                            {bookshelf.name}
                          </SelectItem>
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
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                open={statusSelectOpen}
                onOpenChange={setStatusSelectOpen}
                onValueChange={(val) => {
                  dispatch({
                    type: BookCreationActionType.setStatus,
                    status: val as ContractReadingStatus,
                  });

                  field.onChange(val);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder="Status"
                      className="bg-red-500"
                    />
                    <SelectContent>
                      {Object.entries(ReadingStatus).map(([key, status]) => (
                        <SelectItem
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              setStatusSelectOpen(false);
                            }
                          }}
                          value={key}
                        >
                          {status}
                        </SelectItem>
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
          control={form.control}
          name="image"
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <FormItem>
              <FormLabel>Obrazek</FormLabel>
              <FormControl>
                <FileInput
                  {...fieldProps}
                  type="file"
                  accept="image/jpeg"
                  fileName={(value as unknown as File)?.name}
                  onChange={(event) => {
                    onChange(event.target.files && event.target.files[0]);

                    setFile(event.target.files ? event.target?.files[0] ?? undefined : undefined);
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
              <Select
                open={genreSelectOpen}
                onOpenChange={setGenreSelectOpen}
                onValueChange={(val) => {
                  dispatch({
                    type: BookCreationActionType.setGenre,
                    genre: val,
                  });

                  field.onChange(val);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={<span className="text-muted-foreground">Kategoria</span>} />
                    <SelectContent>
                      {Object.values(data?.data ?? []).map((genre) => (
                        <SelectItem
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              setGenreSelectOpen(false);
                            }
                          }}
                          value={genre.id}
                        >
                          {genre.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectTrigger>
                </FormControl>
              </Select>
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
