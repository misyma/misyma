import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  BookCreationActionType,
  BookCreationNonIsbnState,
  NonIsbnCreationPathStep,
  useBookCreation,
  useBookCreationDispatch,
} from '../context/bookCreationContext/bookCreationContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../../../modules/common/components/ui/form';
import { Input } from '../../../../../modules/common/components/ui/input';
import { Button } from '../../../../../modules/common/components/ui/button';

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

    dispatch({
      type: BookCreationActionType.setStep,
      step: NonIsbnCreationPathStep.inputFirstDetails,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="yearOfIssue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data wydania</FormLabel>
              <FormControl>
                <Input
                  placeholder="Data wydania"
                  type="number"
                  includeQuill={true}
                  min={1500}
                  onInput={(e) => {
                    dispatch({
                      type: BookCreationActionType.setYearOfIssue,
                      yearOfIssue: Number(e.currentTarget.value),
                    });
                  }}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={!form.formState.isValid}
          className="border border-primary w-60 sm:w-96"
          onClick={() => {
            onSubmit(form.getValues());
          }}
        >
          Przejdź dalej
        </Button>
      </form>
    </Form>
  );
};
