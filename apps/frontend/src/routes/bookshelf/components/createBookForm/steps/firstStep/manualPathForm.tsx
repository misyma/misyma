import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '../../../../../../components/ui/form';
import { Input } from '../../../../../../components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  BookCreationActionType,
  BookCreationNonIsbnState,
  useBookCreation,
  useBookCreationDispatch,
} from '../../context/bookCreationContext/bookCreationContext';

const stepOneYoISchema = z.object({
  yearOfIssue: z
    .number({
      coerce: true,
      required_error: 'Data wydania musi być liczbą.',
    })
    .int({
      message: 'Data wydania musi być wartością całkowitą.',
    })
    .min(1500, {
      message: 'Serio?', // todo
    })
    .max(2500, {
      message: 'xd', // todo
    }), // consider dynamic limit till "current" year
});

export const ManualPathForm = (): JSX.Element => {
  const bookCreation = useBookCreation<false>() as BookCreationNonIsbnState;

  const dispatch = useBookCreationDispatch();

  const form = useForm({
    resolver: zodResolver(stepOneYoISchema),
    values: {
      yearOfIssue: bookCreation.yearOfIssue,
    },
  });

  const onSubmit = (values: Partial<z.infer<typeof stepOneYoISchema>>) => {
    if (!values.yearOfIssue) {
      return;
    }

    dispatch({
      type: BookCreationActionType.setYearOfIssue,
      yearOfIssue: values.yearOfIssue,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="yearOfIssue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data wydania</FormLabel>
              <FormControl>
                <Input
                  placeholder="Data wydania"
                  type="text"
                  includeQuill={false}
                  onInput={(e) => {
                    dispatch({
                      type: BookCreationActionType.setYearOfIssue,
                      yearOfIssue: e.currentTarget.valueAsNumber,
                    });
                  }}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
