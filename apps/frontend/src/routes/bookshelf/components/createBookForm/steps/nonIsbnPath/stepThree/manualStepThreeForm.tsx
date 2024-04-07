import { z } from 'zod';
import {
  BookCreationActionType,
  BookCreationNonIsbnState,
  NonIsbnCreationPathStep,
  useBookCreation,
  useBookCreationDispatch,
} from '../../../context/bookCreationContext/bookCreationContext';
import { ReadingStatus } from '@common/contracts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../../../../components/ui/form';
import { Input } from '../../../../../../../components/ui/input';
import { Button } from '../../../../../../../components/ui/button';
import { useCreateBookMutation } from '../../../../../../../api/books/mutations/createBookMutation/createBookMutation';
import { useCreateUserBookMutation } from '../../../../../../../api/books/mutations/createUserBookMutation/createUserBookMutation';
import { useFindUserQuery } from '../../../../../../../api/user/queries/findUserQuery/findUserQuery';
import { useNavigate } from '@tanstack/react-router';

const stepThreeFormSchema = z.object({
  status: z.nativeEnum(ReadingStatus),
  image: z.string().min(1),
});

interface Props {
  bookshelfId: string;
}

export const ManualStepThreeForm = ({ bookshelfId }: Props): JSX.Element => {
  const bookCreation = useBookCreation<false>() as BookCreationNonIsbnState;

  const dispatch = useBookCreationDispatch();

  const { data: user } = useFindUserQuery();

  const form = useForm({
    resolver: zodResolver(stepThreeFormSchema),
    values: {
      status: bookCreation.stepThreeDetails?.status,
      image: bookCreation.stepThreeDetails?.image,
    },
  });

  const { mutateAsync: createBookMutation } = useCreateBookMutation({});

  const { mutateAsync: createUserBookMutation } = useCreateUserBookMutation({});

  const navigate = useNavigate();

  const onSubmit = async (values: Partial<z.infer<typeof stepThreeFormSchema>>) => {
    values as z.infer<typeof stepThreeFormSchema>;

    const bookCreationResponse = await createBookMutation({
      authorIds: [], // temp.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      format: bookCreation.stepTwoDetails?.format as unknown as any,
      language: bookCreation.stepTwoDetails?.language as string,
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
      status: bookCreation.stepThreeDetails?.status as ReadingStatus,
      userId: user?.id as string,
    });

    await navigate({
      to: `/bookshelf/${bookshelfId}`
    })
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Input
                  placeholder="Status"
                  type="text"
                  includeQuill={false}
                  onInput={(e) => {
                    dispatch({
                      type: BookCreationActionType.setStatus,
                      status: e.currentTarget.value as ReadingStatus,
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
      </form>
    </Form>
  );
};
