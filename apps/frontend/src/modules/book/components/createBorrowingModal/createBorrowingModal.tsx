import { FC, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader } from '../../../common/components/ui/dialog';
import { format } from 'date-fns';
import { Button } from '../../../common/components/ui/button';
import { cn } from '../../../common/lib/utils';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../common/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '../../../common/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../../../common/components/ui/calendar';
import { useCreateBorrowingMutation } from '../../api/mutations/createBorrowingMutation/createBorrowingMutation';
import { useStoreSelector } from '../../../core/store/hooks/useStoreSelector';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { Input } from '../../../common/components/ui/input';
import { useToast } from '../../../common/components/ui/use-toast';

interface Props {
  bookId: string;
  className?: string;
  open: boolean;
  onMutated: () => void | Promise<void>;
  onClosed: () => void | Promise<void>;
}

const createBorrowingSchema = z.object({
  borrower: z
    .string({
      required_error: 'Wypożyczający jest wymagany.',
      invalid_type_error: 'Niewłaściwa wartość.',
    })
    .min(1, {
      message: 'Wymagany jest minimum 1 znak.',
    })
    .max(256, {
      message: 'Pole wypożyczający może mieć maksymalnie 256 znaków.',
    }),
  startedAt: z.date({
    required_error: 'Data rozpoczęcia jest wymagana.',
    invalid_type_error: 'Niewłaściwa wartość.',
  }),
});

export const CreateBorrowingModal: FC<Props> = ({ bookId, open, onClosed, onMutated }: Props) => {
  const accessToken = useStoreSelector(userStateSelectors.selectAccessToken);

  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState<boolean>(open);

  const [error, setError] = useState('');

  const form = useForm<z.infer<typeof createBorrowingSchema>>({
    resolver: zodResolver(createBorrowingSchema),
    defaultValues: {
      borrower: '',
      startedAt: new Date(),
    },
  });

  const { mutateAsync } = useCreateBorrowingMutation({});

  const onCreateBookReading = async (values: z.infer<typeof createBorrowingSchema>) => {
    try {
      await mutateAsync({
        ...values,
        startedAt: values.startedAt.toISOString(),
        accessToken: accessToken as string,
        userBookId: bookId,
      });

      onMutated();

      setIsOpen(false);

      toast({
        title: 'Książka została wypożyczona.',
        description: `Książka została wypożyczona ${values.borrower} od dnia ${values.startedAt.toDateString()}`,
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

        setError('');
      }}
    >
      <DialogContent
        style={{
          borderRadius: '40px',
        }}
        className="max-w-xl py-16"
        omitCloseButton={true}
      >
        <DialogHeader className="font-semibold text-center flex justify-center items-center">
          Dodatkowe informacje
        </DialogHeader>
        <DialogDescription className="flex flex-col gap-4 justify-center items-center">
          <p className={error ? 'text-red-500' : 'hidden'}>{error}</p>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onCreateBookReading)}
              className="space-y-8 min-w-96"
            >
              <FormField
                control={form.control}
                name="borrower"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imię osoby wypożyczającej</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Imię osoby wypożyczającej"
                        type="text"
                        includeQuill={true}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startedAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data wypożyczenia</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'min-w-96 pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>DD-MM-RRRR</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>{' '}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-8 gap-2 flex sm:justify-center justify-center sm:items-center items-center">
                <Button
                  className="bg-transparent text-primary w-32 sm:w-40"
                  onClick={() => {
                    setIsOpen(false);

                    onClosed();
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
