import { zodResolver } from '@hookform/resolvers/zod';
import { ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from '../../../common/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../common/components/ui/form';
import { Textarea } from '../../../common/components/ui/textarea';
import { Button } from '../../../common/components/ui/button';
import { Input } from '../../../common/components/ui/input';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';
import { useQueryClient } from '@tanstack/react-query';
import { Checkbox } from '../../../common/components/ui/checkbox';
import { useToast } from '../../../common/components/ui/use-toast';
import { useCreateQuoteMutation } from '../../../quotes/api/mutations/createQuoteMutation/createQuoteMutation';
import { getQuotesOptionsQueryKey } from '../../../quotes/api/queries/getQuotes/getQuotesOptions';

const createQuotationSchema = z.object({
  page: z
    .string({
      required_error: 'Strona jest wymagana.',
    })
    .min(1, 'Strona musi mieć minimum 1 znak.'),
  content: z
    .string({
      required_error: 'Cytat jest wymagany.',
    })
    .min(1, 'Cytat musi mieć minimum 1 znak.'),
  isFavorite: z.boolean({}),
});

interface Props {
  userBookId: string;
  trigger: ReactNode;
  onMutated: () => void | Promise<void>;
}

export const CreateQuotationModal = ({ userBookId, onMutated, trigger }: Props): ReactNode => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { toast } = useToast();

  const queryClient = useQueryClient();

  const { data: userData } = useFindUserQuery();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [error, setError] = useState('');

  const form = useForm<z.infer<typeof createQuotationSchema>>({
    resolver: zodResolver(createQuotationSchema),
    defaultValues: {
      page: '0',
      content: '',
      isFavorite: false,
    },
  });

  const { mutateAsync } = useCreateQuoteMutation({});

  const onSubmit = async (values: z.infer<typeof createQuotationSchema>): Promise<void> => {
    try {
      await mutateAsync({
        ...values,
        page: values.page,
        accessToken: accessToken as string,
        createdAt: new Date().toISOString(),
        userBookId,
        userId: userData?.id as string,
      });

      onMutated();

      queryClient.invalidateQueries({
        queryKey: getQuotesOptionsQueryKey({
          userBookId,
        }),
      });

      setIsOpen(false);

      toast({
        title: 'Cytat został dodany 😄',
        variant: 'success',
      });
    } catch (error) {
      if (error instanceof Error) {
        return setError(error.message);
      }

      throw error;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        setIsOpen(val);

        form.reset();

        form.clearErrors();

        setError('');
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        style={{
          borderRadius: '40px',
        }}
        className="max-w-xl py-16"
        omitCloseButton={true}
      >
        <DialogHeader className="font-semibold text-center flex justify-center items-center">Dodaj cytat</DialogHeader>
        <DialogDescription className="flex flex-col gap-4 justify-center items-center">
          <p className={error ? 'text-red-500' : 'hidden'}>{error}</p>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 min-w-96"
            >
              <FormField
                control={form.control}
                name="page"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Strony</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Strony cytatu"
                        type="string"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cytat</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Komentarz"
                        maxLength={256}
                        className="resize-none h-44"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isFavorite"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Ulubiona</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <div className="pt-8 gap-2 flex sm:justify-center justify-center sm:items-center items-center">
                <Button
                  className="bg-transparent text-primary w-32 sm:w-40"
                  type="reset"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                >
                  Wróć
                </Button>
                <Button
                  type="submit"
                  disabled={!form.formState.isValid}
                  className="bg-primary w-32 sm:w-40"
                >
                  Potwierdź
                </Button>
              </div>
            </form>
          </Form>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
