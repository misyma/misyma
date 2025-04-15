import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { z } from 'zod';

import { ReadingStatus as ContractReadingStatus, readingStatuses } from '@common/contracts';

import { useFindUserBookshelfsQuery } from '../../../../bookshelf/api/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';
import { useSearchBookContext } from '../../../../bookshelf/context/searchCreateBookContext/searchCreateBookContext';
import { Button } from '../../../../common/components/button/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../common/components/form/form';
import { FileInput } from '../../../../common/components/input/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../common/components/select/select';
import { LoadingSpinner } from '../../../../common/components/spinner/loading-spinner';
import { ReadingStatus } from '../../../../common/constants/readingStatus';
import { userStateSelectors } from '../../../../core/store/states/userState/userStateSlice';
import { FindBookByIdQueryOptions } from '../../../api/user/queries/findBookById/findBookByIdQueryOptions';
import { type BookNavigationFrom } from '../../../constants';
import { BookApiError } from '../../../errors/bookApiError';
import { useCreateBookWithUserBook } from '../../../hooks/createBookWithUserBook/createBookWithUserBook';

const stepThreeFormSchema = z.object({
  status: z.nativeEnum(readingStatuses, {
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
});

interface Props {
  bookshelfId?: string;
  navigateTo: BookNavigationFrom;
}

export const ManualStep = ({ bookshelfId, navigateTo }: Props): JSX.Element => {
  const searchBookContext = useSearchBookContext();

  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [file, setFile] = useState<File | undefined>();
  const [bookshelfSelectOpen, setBookshelfSelectOpen] = useState(false);
  const [statusSelectOpen, setStatusSelectOpen] = useState(false);

  const { data: bookshelvesData } = useFindUserBookshelfsQuery({
    pageSize: 200,
  });

  const form = useForm({
    resolver: zodResolver(stepThreeFormSchema),
    values: {
      status: '',
      image: undefined,
      bookshelfId,
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { data: bookResponse } = useQuery(
    FindBookByIdQueryOptions({
      bookId: searchBookContext.bookId,
    }),
  );

  const navigate = useNavigate();

  const onGoBack = () => {
    const search: {
      isbn: string;
      title: string;
      bookshelfId: string;
      searchBy: 'title' | 'isbn';
    } = {
      bookshelfId: bookshelfId ?? '',
      isbn: '',
      title: '',
      searchBy: 'title',
    };

    if (searchBookContext.searchQuery) {
      search['title'] = searchBookContext.searchQuery;

      search['searchBy'] = 'title';
    } else if (searchBookContext.isbn) {
      search['isbn'] = searchBookContext.isbn;

      search['searchBy'] = 'isbn';
    } else {
      return navigate({
        to: '/mybooks',
      });
    }

    navigate({
      to: '/shelves/bookshelf/search/result',
      search: {
        ...search,
      },
    });
  };

  const { create, isProcessing } = useCreateBookWithUserBook({
    onOperationError: setSubmissionError,
    navigateTo,
  });

  const onSubmit = async (values: Partial<z.infer<typeof stepThreeFormSchema>>) => {
    try {
      await create({
        userBookPayload: {
          bookId: searchBookContext.bookId,
          bookshelfId: (values.bookshelfId || bookshelfId) ?? '',
          status: values.status as ContractReadingStatus,
          isFavorite: false,
          accessToken: accessToken as string,
        },
        bookTitle: bookResponse?.title ?? '',
        image: file,
      });
    } catch (error) {
      if (error instanceof BookApiError && error.context.statusCode === 409) {
        return;
      }

      setSubmissionError(`Coś poszło nie tak. Spróbuj ponownie.`);

      return;
    }
  };

  return (
    <Form {...form}>
      <form
        //   eslint-disable-next-line
        onSubmit={form.handleSubmit(onSubmit as any)}
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
                  field.onChange(val);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Półka" />
                    <SelectContent>
                      {bookshelvesData?.data.map((bookshelf) => (
                        <SelectItem
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
              <FormLabel>
                <span>Obrazek</span>
                <span className="text-gray-500"> (opcjonalne)</span>
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
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex w-full gap-4">
          <Button
            className="border border-primary w-full"
            onClick={onGoBack}
            size="lg"
            variant={isProcessing ? 'ghost' : 'outline'}
            disabled={isProcessing}
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
