import { zodResolver } from '@hookform/resolvers/zod';
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CreateBookshelfFormValues, createBookshelfSchema } from './schema/createBookshelfSchema';
import { useCreateBookshelfMutation } from '../../../../api/shelf/mutations/createBookshelfMutation/createBookshelfMutation';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../../components/ui/form';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { useFindUserQuery } from '../../../../api/user/queries/findUserQuery/findUserQuery';
import { useToast } from '../../../../components/ui/use-toast';
import { ShelfApiError } from '../../../../api/shelf/errors/shelfApiError';

interface Props {
  onGoBack: (created: boolean) => void;
}

export const CreateBookshelfForm: FC<Props> = ({ onGoBack }: Props) => {
  const createBookshelfMutation = useCreateBookshelfMutation({});

  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const { data } = useFindUserQuery();

  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(createBookshelfSchema),
    defaultValues: {
      name: '',
      address: undefined,
      imageUrl: undefined,
    },
  });

  const onSubmit = async (values: CreateBookshelfFormValues) => {
    try {
      await createBookshelfMutation.mutateAsync({
        ...values,
        userId: data?.id as string,
      });

      toast({
        title: 'Półka została stworzona',
        description: `Półka o nazwie: ${values.name} została stworzona.`,
        variant: 'success',
      });

      onGoBack(true);
    } catch (error) {
      if (error instanceof ShelfApiError) {
        setSubmissionError(error.message);

        return;
      }

      setSubmissionError('Coś poszło nie tak. Spróbuj ponownie.')
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
          name="name"
          render={({ field }) => (
            <FormItem className="h-[5.5rem]">
              <FormLabel>Nazwa półki*</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nazwa półki"
                  maxLength={254}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem className="h-[5.5rem]">
              <FormLabel>Adres</FormLabel>
              <FormControl>
                {/* Change to combo dropdown :) */}
                <Input
                  placeholder="Adres"
                  maxLength={254}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem className="h-[5.5rem]">
              <FormLabel>Obrazek</FormLabel>
              <FormControl>
                {/* Change to combo dropdown :) */}
                <Input
                  placeholder="Obrazek"
                  maxLength={254}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4 sm:gap-8 w-full">
          <Button
            onClick={() => {
              onGoBack(false);

              form.reset();
            }}
            className="border-primary border-[1.25px] w-[50%]"
          >
            Wróć
          </Button>
          <Button
            type="submit"
            disabled={!form.formState.isValid}
            className="border-primary border-[1.25px] w-[50%]"
          >
            Zapisz
          </Button>
        </div>
        {submissionError}
      </form>
    </Form>
  );
};
