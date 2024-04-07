import { z } from 'zod';
import {
  BookCreationActionType,
  BookCreationNonIsbnState,
  NonIsbnCreationPathStep,
  useBookCreation,
  useBookCreationDispatch,
} from '../../../context/bookCreationContext/bookCreationContext';
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

const stepOneSchema = z.object({
  title: z.string().min(1).max(64),
  author: z.string().min(1).max(64),
  publisher: z.string().min(1).max(64),
  genre: z.string().min(1).max(64),
});

export const ManualStepOneForm = (): JSX.Element => {
  const bookCreation = useBookCreation<false>() as BookCreationNonIsbnState;

  const dispatch = useBookCreationDispatch();

  const form = useForm({
    resolver: zodResolver(stepOneSchema),
    values: {
      title: bookCreation.stepOneDetails?.title,
      author: bookCreation.stepOneDetails?.author,
      publisher: bookCreation.stepOneDetails?.publisher,
      genre: bookCreation.stepOneDetails?.genre,
    },
  });

  const onSubmit = (values: Partial<z.infer<typeof stepOneSchema>>) => {
    const vals = values as z.infer<typeof stepOneSchema>;

    dispatch({
      type: BookCreationActionType.nonIsbnStepOneDetails,
      author: vals.author,
      genre: vals.genre,
      publisher: vals.publisher,
      title: vals.title,
    });

    dispatch({
      type: BookCreationActionType.setStep,
      step: NonIsbnCreationPathStep.inputSecondDetails,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Autor</FormLabel>
              <FormControl>
                <Input
                  placeholder="Autor"
                  type="text"
                  includeQuill={false}
                  onInput={(e) => {
                    dispatch({
                      type: BookCreationActionType.setAuthor,
                      author: e.currentTarget.value,
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
              <FormLabel>Gatunek</FormLabel>
              <FormControl>
                <Input
                  placeholder="Gatunek"
                  type="text"
                  includeQuill={false}
                  onInput={(e) => {
                    dispatch({
                      type: BookCreationActionType.setGenre,
                      genre: e.currentTarget.value,
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
          name="publisher"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wydawnictwo</FormLabel>
              <FormControl>
                <Input
                  placeholder="Wydawnictwo"
                  type="text"
                  includeQuill={false}
                  onInput={(e) => {
                    dispatch({
                      type: BookCreationActionType.setPublisher,
                      publisher: e.currentTarget.value,
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tytuł</FormLabel>
              <FormControl>
                <Input
                  placeholder="Tytuł"
                  type="text"
                  includeQuill={false}
                  onInput={(e) => {
                    dispatch({
                      type: BookCreationActionType.setTitle,
                      title: e.currentTarget.value,
                    });
                  }}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <Button
            onClick={() => {
              dispatch({
                type: BookCreationActionType.setStep,
                step: 0,
              });
            }}
          >
            Wróć
          </Button>
          <Button type="submit">Przejdź dalej</Button>
        </div>
      </form>
    </Form>
  );
};
