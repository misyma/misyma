import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { IoMdCheckmarkCircle } from 'react-icons/io';
import { MdOutlineCancel } from 'react-icons/md';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../../../components/ui/form';
import { Input } from '../../../../../components/ui/input';
import { Button } from '../../../../../components/ui/button';
import { useNavigate } from '@tanstack/react-router';

const stepOneIsbnSchema = z.object({
  isbn: z
    .string({
      required_error: 'Numer ISBN jest wymagany.',
    })
    .regex(/^(?=(?:[^0-9]*[0-9]){10}(?:(?:[^0-9]*[0-9]){3})?$)[\d-]+$/, 'Niewłaściwy format.'),
});

export const IsbnPathForm = (): JSX.Element => {
  const isbnForm = useForm({
    resolver: zodResolver(stepOneIsbnSchema),
    values: {
      isbn: '',
    },
    reValidateMode: 'onChange',
  });

  const navigate = useNavigate();

  const onFormSubmit = (values: Partial<z.infer<typeof stepOneIsbnSchema>>) => {
    if (!values.isbn) {
      return;
    }

    navigate({
      to: '/search/result',
      search: {
        isbn: values.isbn,
      },
    });
  };

  return (
    <Form {...isbnForm}>
      <form
        onSubmit={isbnForm.handleSubmit(onFormSubmit)}
        className="space-y-8"
      >
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
                  otherIcon={
                    isbnForm.formState.isValid ? (
                      <IoMdCheckmarkCircle className="text-green-500 text-2xl" />
                    ) : isbnForm.formState.dirtyFields.isbn ? (
                      <MdOutlineCancel className="text-red-500 text-2xl" />
                    ) : (
                      <></>
                    )
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={!isbnForm.formState.isValid}
          className="border border-primary w-60 sm:w-96"
        >
          Pobierz dane
        </Button>
      </form>
    </Form>
  );
};
