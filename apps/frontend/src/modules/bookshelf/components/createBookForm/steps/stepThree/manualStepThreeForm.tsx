import { z } from 'zod';
import {
  BookCreationActionType,
  BookCreationNonIsbnState,
  NonIsbnCreationPathStep,
  useBookCreation,
  useBookCreationDispatch,
} from '../../../../context/bookCreationContext/bookCreationContext';
import {
  ReadingStatus as ContractReadingStatus,
  CreateAuthorResponseBody,
  CreateBookResponseBody,
  CreateUserBookResponseBody,
} from '@common/contracts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../../common/components/ui/form';
import { FileInput } from '../../../../../common/components/ui/input';
import { Button } from '../../../../../common/components/ui/button';
import { useCreateBookMutation } from '../../../../../book/api/mutations/createBookMutation/createBookMutation';
import { useFindUserQuery } from '../../../../../user/api/queries/findUserQuery/findUserQuery';
import { useNavigate } from '@tanstack/react-router';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../common/components/ui/select';
import { ReadingStatus } from '../../../../../common/constants/readingStatus';
import { useToast } from '../../../../../common/components/ui/use-toast';
import { useEffect, useRef, useState } from 'react';
import { useUploadBookImageMutation } from '../../../../../book/api/mutations/uploadBookImageMutation/uploadBookImageMutation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getGenresQueryOptions } from '../../../../../genres/api/queries/getGenresQuery/getGenresQueryOptions';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../../core/store/states/userState/userStateSlice';
import { useFindUserBookshelfsQuery } from '../../../../api/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';
import { BookApiError } from '../../../../../book/errors/bookApiError';
import { useCreateUserBookMutation } from '../../../../../book/api/mutations/createUserBookMutation/createUserBookMutation';
import { useCreateAuthorDraftMutation } from '../../../../../author/api/mutations/createAuthorDraftMutation/createAuthorDraftMutation';
import { useFindAuthorsQuery } from '../../../../../author/api/queries/findAuthorsQuery/findAuthorsQuery';

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

  const queryClient = useQueryClient();

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const dispatch = useBookCreationDispatch();

  const { data: user } = useFindUserQuery();

  const { data: bookshelvesData } = useFindUserBookshelfsQuery({
    userId: user?.id as string,
    pageSize: 50,
  });

  const { mutateAsync: createAuthorDraft } = useCreateAuthorDraftMutation({});

  const { data } = useQuery(
    getGenresQueryOptions({
      accessToken: accessToken as string,
    }),
  );

  const [file, setFile] = useState<File | undefined>();

  const { toast } = useToast();

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

  const { mutateAsync: createBookMutation } = useCreateBookMutation({});

  const { mutateAsync: createUserBookMutation } = useCreateUserBookMutation({});

  const { mutateAsync: uploadBookImageMutation } = useUploadBookImageMutation({});

  const navigate = useNavigate();

  const onSubmit = async (values: Partial<z.infer<typeof stepThreeFormSchema>>) => {
    values as z.infer<typeof stepThreeFormSchema>;

    try {
      let authorDraftResponse: CreateAuthorResponseBody | undefined = undefined;

      let authorId = bookCreation.stepOneDetails?.author as string;

      if (bookCreation.stepOneDetails?.authorName) {
        try {
          authorDraftResponse = await createAuthorDraft({
            name: bookCreation.stepOneDetails.authorName,
          });

          authorId = authorId || (authorDraftResponse?.id as string);
        } catch (error) {
          if (error instanceof Error) {
            if (error.name === 'ResourceAlreadyExistsError') {
              const response = await refetch();

              if (!response.data?.data[0]) {
                return;
              }

              authorId = response.data?.data[0].id as string;
            } else {
              toast({
                variant: 'destructive',
                title: `Coś poszło nie tak przy ustawianiu autora. Wróć do kroku pierwszego i spróbuj raz jeszcze.`,
              });
            }
          }
        }
      }

      let bookCreationResponse: CreateBookResponseBody;

      try {
        bookCreationResponse = await createBookMutation({
          authorIds: [authorId],
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
          releaseYear: // eslint-disable-next-line
            (bookCreation.stepOneDetails?.yearOfIssue as any) === '' ? undefined : bookCreation.stepOneDetails?.yearOfIssue,
          accessToken: accessToken as string,
          publisher: bookCreation.stepOneDetails?.publisher === '' ? undefined : bookCreation.stepOneDetails?.publisher,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: `Książka z isbn: ${bookCreation.stepOneDetails?.isbn} już istnieje.`,
          description: `Utwórz książkę używając funkcji wyszukiwania.`,
        });

        setSubmissionError(`Książka z isbn ${bookCreation.stepOneDetails?.isbn} już istnieje.`);

        return;
      }

      let userBook: CreateUserBookResponseBody;

      try {
        userBook = await createUserBookMutation({
          bookId: bookCreationResponse.id,
          bookshelfId,
          status: bookCreation.stepThreeDetails?.status || (values.status as ContractReadingStatus),
          isFavorite: false,
          genreIds: [bookCreation.stepThreeDetails?.genre as string],
          accessToken: accessToken as string,
        });
      } catch (error) {
        if (error instanceof Error && error.message === 'ResourceAlreadyExistsError') {
          toast({
            variant: 'destructive',
            title: `Posiadasz już książkę z isbn: ${bookCreation.stepOneDetails?.isbn} na swojej półce.`,
          });

          return;
        }

        setSubmissionError(`Coś poszło nie tak. Spróbuj ponownie.`);

        return;
      }

      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'findBooksByBookshelfId' &&
          query.queryKey[1] === bookCreation.stepThreeDetails?.bookshelfId,
      });

      if (file) {
        await uploadBookImageMutation({
          bookId: userBook.id,
          file: file as unknown as File,
          accessToken: accessToken as string,
        });
      }

      toast({
        title: 'Książka została położona na półce 😄',
        description: `Książka ${bookCreation.stepOneDetails?.title} została położona na półce 😄`,
        variant: 'success',
      });

      await navigate({
        to: `/bookshelf/${bookshelfId}`,
      });
    } catch (error) {
      if (error instanceof BookApiError) {
        setSubmissionError(error.context.message);

        toast({
          title: 'Coś poszło nie tak...',
          description: 'Nie udało się utworzyć książki. Spróbuj ponownie.',
          variant: 'destructive',
        });

        return;
      }

      setSubmissionError('Coś poszło nie tak. Spróbuj ponownie.');

      toast({
        title: 'Coś poszło nie tak...',
        description: 'Nie udało się utworzyć książki. Spróbuj ponownie.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="bookshelfId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Półka</FormLabel>
              <Select
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
                  <SelectTrigger>
                    <SelectValue placeholder="Półka" />
                    <SelectContent>
                      {bookshelvesData?.data.filter((bookshelf) => bookshelf.name !== 'Wypożyczalnia').map((bookshelf) => (
                        <SelectItem value={bookshelf.id}>{bookshelf.name}</SelectItem>
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
                        <SelectItem value={key}>{status}</SelectItem>
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
                        <SelectItem value={genre.id}>{genre.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </SelectTrigger>
                </FormControl>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex w-full gap-4">
          <Button
            className="border border-primary w-full"
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
            className="border border-primary w-full"
            disabled={!form.formState.isValid}
            type="submit"
          >
            Dodaj książkę
          </Button>
        </div>
        {submissionError ? <p className="text-red-500">{submissionError}</p> : <></>}
      </form>
    </Form>
  );
};
