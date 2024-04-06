import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../../../../components/ui/form';
import { Input } from '../../../../../../components/ui/input';
import {
  BookCreationActionType,
  BookCreationIsbnState,
  useBookCreation,
  useBookCreationDispatch,
} from '../../context/bookCreationContext/bookCreationContext';

interface Props {
  onSubmit: () => void;
}

const stepOneIsbnSchema = z.object({
  isbn: z
    .string({
      required_error: 'Numer ISBN jest wymagany.',
    })
    .min(1, {
      message: 'Numer ISBN musi mieć minimum 1 znak.',
    })
    .max(64, {
      message: 'Numer ISBN musi posiadać maximum 64 znaki',
    }),
});

export const IsbnPathForm = ({ onSubmit }: Props): JSX.Element => {
  const bookCreation = useBookCreation<true>() as BookCreationIsbnState;

  const isbnForm = useForm({
    resolver: zodResolver(stepOneIsbnSchema),
    values: {
      isbn: bookCreation.isbn,
    },
  });

  const dispatch = useBookCreationDispatch();

  const onFormSubmit = (values: Partial<z.infer<typeof stepOneIsbnSchema>>) => {
    if (!values.isbn) {
      return;
    }

    dispatch({
      type: BookCreationActionType.setIsbn,
      isbn: values.isbn,
    });

    onSubmit();
  };

  return (
    <Form {...isbnForm}>
      <form onSubmit={isbnForm.handleSubmit(onFormSubmit)}>
        <FormField
          control={isbnForm.control}
          name="isbn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ISBN</FormLabel>
              <FormControl>
                <Input
                  placeholder="ISBN"
                  type="text"
                  maxLength={64}
                  includeQuill={false}
                  onInput={(e) => {
                    dispatch({
                      type: BookCreationActionType.setIsbn,
                      isbn: e.currentTarget.value,
                    });
                  }}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
