import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../../components/ui/form';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';

const stepOneIsbnSchema = z.object({
  title: z
    .string({
      required_error: 'Tytuł jest wymagany.',
    })
    .min(3, {
      message: 'Tytuł jest zbyt krótki.',
    }),
});

export const ByTitleForm = (): JSX.Element => {
  const byTitleForm = useForm({
    resolver: zodResolver(stepOneIsbnSchema),
    values: {
      title: '',
    },
    reValidateMode: 'onChange',
  });

  const onFormSubmit = (values: Partial<z.infer<typeof stepOneIsbnSchema>>) => {
    if (!values.title) {
      return;
    }
  };

  return (
    <Form {...byTitleForm}>
      <form
        onSubmit={byTitleForm.handleSubmit(onFormSubmit)}
        className="space-y-8"
      >
        <FormField
          control={byTitleForm.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tytuł</FormLabel>
              <FormControl>
                <Input
                  placeholder="Tytuł"
                  type="text"
                  maxLength={64}
                  includeQuill={false}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={!byTitleForm.formState.isValid}
          className="border border-primary w-60 sm:w-96"
        >
          Pobierz dane
        </Button>
      </form>
    </Form>
  );
};
