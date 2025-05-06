import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '../../../../common/components/button/button';
import {
  Dialog,
  DialogContent,
  DialogContentScrollArea,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from '../../../../common/components/dialog/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../common/components/form/form';
import { Input } from '../../../../common/components/input/input';
import { LoadingSpinner } from '../../../../common/components/spinner/loading-spinner';
import { Textarea } from '../../../../common/components/textArea/textarea';
import { useToast } from '../../../../common/components/toast/use-toast';
import { useFindUserQuery } from '../../../../user/api/queries/findUserQuery/findUserQuery';
import {
  type CreateQuote,
  createQuoteSchema,
  useCreateQuoteMutation,
} from '../../../api/mutations/createQuoteMutation/createQuoteMutation';

interface Props {
  userBookId: string;
  trigger: ReactNode;
  onMutated: () => void | Promise<void>;
}

export const CreateQuotationModal = ({ userBookId, onMutated, trigger }: Props): ReactNode => {
  const { toast } = useToast();

  const { data: userData } = useFindUserQuery();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [error, setError] = useState('');

  const form = useForm<CreateQuote>({
    resolver: zodResolver(createQuoteSchema),
    defaultValues: {
      page: '',
      content: '',
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  const { mutateAsync, isPending: isCreating } = useCreateQuoteMutation({});

  const onSubmit = async (values: CreateQuote): Promise<void> => {
    const payload: {
      content: string;
      page: string | undefined;
    } = {
      content: values.content,
      page: undefined,
    };

    if (values.page) {
      payload.page = values.page;
    }

    try {
      await mutateAsync({
        ...values,
        ...payload,
        createdAt: new Date().toISOString(),
        userBookId,
        userId: userData?.id as string,
        isFavorite: false,
      });

      onMutated();

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
          <DialogContentScrollArea>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 min-w-96"
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
                          maxLength={16}
                          inputMode="text"
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
                          maxLength={1000}
                          className="resize-none h-44"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="pt-8 gap-2 flex sm:justify-center justify-center sm:items-center items-center">
                  <Button
                    className="bg-transparent text-primary w-32 sm:w-40"
                    type="reset"
                    disabled={isCreating}
                    onClick={() => {
                      setIsOpen(false);
                    }}
                  >
                    Wróć
                  </Button>
                  <Button
                    type="submit"
                    disabled={!form.formState.isValid || isCreating}
                    className="bg-primary w-32 sm:w-40"
                  >
                    {!isCreating && <>Potwierdź</>}
                    {isCreating && <LoadingSpinner size={40} />}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContentScrollArea>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
