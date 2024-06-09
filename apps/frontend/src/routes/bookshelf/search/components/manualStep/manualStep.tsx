import { z } from 'zod';
import { ReadingStatus as ContractReadingStatus, CreateUserBookResponseBody } from '@common/contracts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useFindUserQuery } from '../../../../../api/user/queries/findUserQuery/findUserQuery';
import { useFindUserBookshelfsQuery } from '../../../../../api/bookshelf/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';
import { useToast } from '../../../../../modules/common/components/ui/use-toast';
import { useCreateUserBookMutation } from '../../../../../api/books/mutations/createUserBookMutation/createUserBookMutation';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../../../modules/common/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../modules/common/components/ui/select';
import { ReadingStatus } from '../../../../../modules/common/constants/readingStatus';
import { FileInput } from '../../../../../modules/common/components/ui/input';
import { Button } from '../../../../../modules/common/components/ui/button';
import { useSearchBookContext } from '../../context/searchCreateBookContext';
import { BookApiError } from '../../../../../api/books/errors/bookApiError';
import { useUploadBookImageMutation } from '../../../../../api/books/mutations/uploadBookImageMutation/uploadBookImageMutation';
import { useQuery } from '@tanstack/react-query';
import { getGenresQueryOptions } from '../../../../../api/genres/queries/getGenresQuery/getGenresQueryOptions';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../../../modules/core/store/states/userState/userStateSlice';

const stepThreeFormSchema = z.object({
  status: z.nativeEnum(ContractReadingStatus, {
    invalid_type_error: 'Niepoprawny typ',
    required_error: 'Wartość jest wymagana.',
  }),
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

export const ManualStep = ({ bookshelfId }: Props): JSX.Element => {
  const searchBookContext = useSearchBookContext();

  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const { data: user } = useFindUserQuery();

  const [file, setFile] = useState<File | undefined>();

  const { data: bookshelvesData } = useFindUserBookshelfsQuery(user?.id);

  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(stepThreeFormSchema),
    values: {
      status: '',
      image: undefined,
      bookshelfId,
      genre: '',
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  const { mutateAsync: createUserBookMutation } = useCreateUserBookMutation({});

  const { mutateAsync: uploadBookImageMutation } = useUploadBookImageMutation({});

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: genresData } = useQuery(
    getGenresQueryOptions({
      accessToken: accessToken as string,
    }),
  );

  const navigate = useNavigate();

  const onGoBack = () => {
    const search: Record<string, string> = {
      bookshelfId,
    };

    if (searchBookContext.searchQuery) {
      search['title'] = searchBookContext.searchQuery;
    } else if (searchBookContext.isbn) {
      search['isbn'] = searchBookContext.isbn;
    } else {
      return navigate({
        to: '/shelves',
      });
    }

    navigate({
      to: '/search/result',
      search,
    });
  };

  const onSubmit = async (values: Partial<z.infer<typeof stepThreeFormSchema>>) => {
    values as z.infer<typeof stepThreeFormSchema>;

    let userBook: CreateUserBookResponseBody;

    try {
      userBook = await createUserBookMutation({
        bookId: searchBookContext.bookId,
        bookshelfId,
        status: values.status as ContractReadingStatus,
        isFavorite: false,
        accessToken: accessToken as string,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'ResourceAlreadyExistsError') {
        toast({
          variant: 'destructive',
          title: `Posiadasz już książkę z ${searchBookContext.isbn ? 'isbn' : 'title'}: ${searchBookContext.isbn ?? searchBookContext.title} na swojej półce.`,
        });

        return;
      }

      setSubmissionError(`Coś poszło nie tak. Spróbuj ponownie.`);

      return;
    }

    try {
      await uploadBookImageMutation({
        bookId: userBook.id,
        file: file as unknown as File,
        accessToken: accessToken as string,
      });

      toast({
        title: 'Książka została położona na półce 😄',
        description: `Książka ${searchBookContext?.title} została położona na półce 😄`,
        variant: 'success',
      });

      await navigate({
        to: `/bookshelf/${bookshelfId}`,
      });
    } catch (error) {
      console.error(error);

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
        //   eslint-disable-next-line
        onSubmit={form.handleSubmit(onSubmit as any)}
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
                  field.onChange(val);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Półka" />
                    <SelectContent>
                      {bookshelvesData?.data.map((bookshelf) => (
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
                  field.onChange(val);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={<span className="text-muted-foreground">Kategoria</span>} />
                    <SelectContent>
                      {Object.values(genresData?.data ?? []).map((genre) => (
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
            onClick={onGoBack}
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
