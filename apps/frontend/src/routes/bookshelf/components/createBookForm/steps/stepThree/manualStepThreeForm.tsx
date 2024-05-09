import { z } from 'zod';
import {
  BookCreationActionType,
  BookCreationNonIsbnState,
  NonIsbnCreationPathStep,
  useBookCreation,
  useBookCreationDispatch,
} from '../../context/bookCreationContext/bookCreationContext';
import { ReadingStatus as ContractReadingStatus } from '@common/contracts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../../../../components/ui/form';
import { Input } from '../../../../../../components/ui/input';
import { Button } from '../../../../../../components/ui/button';
import { useCreateBookMutation } from '../../../../../../api/books/mutations/createBookMutation/createBookMutation';
import { useCreateUserBookMutation } from '../../../../../../api/books/mutations/createUserBookMutation/createUserBookMutation';
import { useFindUserQuery } from '../../../../../../api/user/queries/findUserQuery/findUserQuery';
import { useNavigate } from '@tanstack/react-router';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../../components/ui/select';
import { ReadingStatus } from '../../../../../../common/constants/readingStatus';
import { useToast } from '../../../../../../components/ui/use-toast';
import { useState } from 'react';
import { BookApiError } from '../../../../../../api/books/errors/bookApiError';
import { BookGenre } from '../../../../../../common/constants/bookGenre';
import { useFindUserBookshelfsQuery } from '../../../../../../api/bookshelf/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';

const stepThreeFormSchema = z.object({
  status: z.nativeEnum(ContractReadingStatus),
  image: z.string().min(1),
  bookshelfId: z.string().uuid(),
  genre: z.string().min(1),
});

interface Props {
  bookshelfId: string;
}

export const ManualStepThreeForm = ({ bookshelfId }: Props): JSX.Element => {
  const bookCreation = useBookCreation<false>() as BookCreationNonIsbnState;

  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const dispatch = useBookCreationDispatch();

  const { data: user } = useFindUserQuery();

  const {
    data: bookshelvesData,
  } = useFindUserBookshelfsQuery(user?.id);

  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(stepThreeFormSchema),
    values: {
      status: bookCreation.stepThreeDetails?.status,
      image: bookCreation.stepThreeDetails?.image,
      bookshelfId,
      genre: bookCreation.stepThreeDetails?.genre,
    },
    reValidateMode: 'onChange',
    mode: 'onTouched'
  });

  const { mutateAsync: createBookMutation } = useCreateBookMutation({});

  const { mutateAsync: createUserBookMutation } = useCreateUserBookMutation({});

  const navigate = useNavigate();

  const onSubmit = async (values: Partial<z.infer<typeof stepThreeFormSchema>>) => {
    values as z.infer<typeof stepThreeFormSchema>;

    try {
      const bookCreationResponse = await createBookMutation({
        authorIds: [bookCreation.stepOneDetails?.author as string],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        format: bookCreation.stepTwoDetails?.format as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        language: bookCreation.stepTwoDetails?.language as any,
        title: bookCreation.stepOneDetails?.title as string,
        publisher: bookCreation.stepOneDetails?.publisher,
        translator: bookCreation.stepTwoDetails?.translator,
        pages: bookCreation.stepTwoDetails?.pagesCount,
        releaseYear: bookCreation.yearOfIssue,
        ...(bookCreation.stepOneDetails as Required<BookCreationNonIsbnState['stepOneDetails']>),
        ...(bookCreation.stepTwoDetails as Required<BookCreationNonIsbnState['stepTwoDetails']>),
        ...(bookCreation.stepThreeDetails as Required<BookCreationNonIsbnState['stepThreeDetails']>),
      });

      await createUserBookMutation({
        bookId: bookCreationResponse.id,
        bookshelfId,
        status: bookCreation.stepThreeDetails?.status as ContractReadingStatus,
        userId: user?.id as string,
      });

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
                    <SelectValue
                      placeholder="Półka"
                    />
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Obrazek</FormLabel>
              <FormControl>
                <Input
                  placeholder="Obrazek"
                  type="text"
                  includeQuill={false}
                  onInput={(e) => {
                    dispatch({
                      type: BookCreationActionType.setImage,
                      image: e.currentTarget.value,
                    });
                  }}
                  {...field}
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
                      {Object.entries(BookGenre).map(([key, genre]) => (
                        <SelectItem value={key}>{genre}</SelectItem>
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
