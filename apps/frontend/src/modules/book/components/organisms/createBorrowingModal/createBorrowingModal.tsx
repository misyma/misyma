import { zodResolver } from '@hookform/resolvers/zod';
import { formatDate } from 'date-fns';
import { pl } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { type FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useFindUserBookshelfsQuery } from '../../../../bookshelf/api/queries/findUserBookshelfsQuery/findUserBookshelfsQuery';
import { useCreateBorrowingMutation } from '../../../../borrowing/api/mutations/createBorrowingMutation/createBorrowingMutation';
import { Button } from '../../../../common/components/button/button';
import { Calendar } from '../../../../common/components/calendar/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Popover, PopoverContent, PopoverTrigger } from '../../../../common/components/popover/popover';
import { useToast } from '../../../../common/components/toast/use-toast';
import { cn } from '../../../../common/lib/utils';

interface Props {
  bookId: string;
  currentBookshelfId: string;
  className?: string;
  open: boolean;
  onMutated?: () => void | Promise<void>;
  onClosed?: () => void | Promise<void>;
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
    .max(32, {
      message: 'Pole wypożyczający może mieć maksymalnie 32 znaki.',
    }),
  startedAt: z.date({
    required_error: 'Data rozpoczęcia jest wymagana.',
    invalid_type_error: 'Niewłaściwa wartość.',
  }),
});

export const CreateBorrowingModal: FC<Props> = ({ bookId, currentBookshelfId, open, onClosed, onMutated }: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(open);
  const [error, setError] = useState('');
  const [calendarVisible, setCalendarVisible] = useState(false);

  const { data: bookshelvesData } = useFindUserBookshelfsQuery({
    pageSize: 150,
  });

  const { toast } = useToast();

  const form = useForm<z.infer<typeof createBorrowingSchema>>({
    resolver: zodResolver(createBorrowingSchema),
    defaultValues: {
      borrower: '',
      startedAt: new Date(),
    },
  });

  const { mutateAsync } = useCreateBorrowingMutation({
    onSuccess: () => setIsOpen(false),
  });

  const onOpenChange = (val: boolean) => {
    setCalendarVisible(val);
  };

  const onCreateBorrowing = async (values: z.infer<typeof createBorrowingSchema>) => {
    try {
      const borrowingBookshelfId = bookshelvesData?.data.find((bksh) => bksh.name === 'Wypożyczalnia')?.id;

      await mutateAsync({
        ...values,
        startedAt: values.startedAt.toISOString(),
        userBookId: bookId,
        borrowingBookshelfId: borrowingBookshelfId ?? '',
        currentBookshelfId,
      });

      if (onMutated) {
        onMutated();
      }

      toast({
        title: 'Książka została wypożyczona.',
        description: `Książka została wypożyczona przez ${values.borrower} od dnia ${formatDate(
          values.startedAt,
          'PPP',
          {
            locale: pl,
          },
        )}`,
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

        if (onClosed) {
          onClosed();
        }
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
          <DialogTitle>Dodatkowe informacje</DialogTitle>
        </DialogHeader>
        <DialogDescription className="flex flex-col gap-4 justify-center items-center">
          <p className={error ? 'text-red-500' : 'hidden'}>{error}</p>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onCreateBorrowing)}
              className="space-y-4 min-w-96"
            >
              <FormField
                control={form.control}
                name="borrower"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>Imię osoby wypożyczającej</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Imię osoby wypożyczającej"
                        maxLength={32}
                        type="text"
                        includeQuill={false}
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
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>Data wypożyczenia</FormLabel>
                    <Popover
                      modal={true}
                      open={calendarVisible}
                      onOpenChange={onOpenChange}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            type="button"
                            className={cn(
                              'min-w-96 pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              formatDate(field.value, 'PPP', {
                                locale: pl,
                              })
                            ) : (
                              <span>DD-MM-RRRR</span>
                            )}
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
                  variant={'outline'}
                  size={'lg'}
                  type="reset"
                  onClick={() => {
                    setIsOpen(false);

                    if (onClosed) {
                      onClosed();
                    }
                  }}
                >
                  Wróć
                </Button>
                <Button
                  variant={'default'}
                  size={'lg'}
                  type="submit"
                  disabled={!form.formState.isValid}
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
