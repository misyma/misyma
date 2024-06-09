import { FC, ReactNode, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from '../../../../modules/common/components/ui/dialog';
import { format } from 'date-fns';
import { Button } from '../../../../modules/common/components/ui/button';
import { cn } from '../../../../modules/common/lib/utils';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../../modules/common/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../modules/common/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../../../../modules/common/components/ui/calendar';
import { Textarea } from '../../../../modules/common/components/ui/textarea';
import { useAddBookReadingMutation } from '../../../../api/bookReadings/mutations/bookReadings/addBookReadingMutation/addBookReadingMutation';

interface Props {
  bookId: string;
  rating: number;
  className?: string;
  trigger: ReactNode;
  onMutated: () => void | Promise<void>;
}

const createBookReadingSchema = z.object({
  userBookId: z.string().uuid(),
  comment: z.string().min(1).max(256),
  rating: z.number().min(1).max(10).int(),
  startedAt: z.date(),
  endedAt: z.date().optional(),
});

export const CreateBookReadingModal: FC<Props> = ({ bookId, rating, trigger, onMutated }: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [error, setError] = useState('');

  const form = useForm<z.infer<typeof createBookReadingSchema>>({
    resolver: zodResolver(createBookReadingSchema),
    defaultValues: {
      userBookId: bookId,
      comment: '',
      rating,
      startedAt: undefined,
      endedAt: undefined,
    },
  });

  const { mutateAsync } = useAddBookReadingMutation({});

  const onCreateBookReading = async (values: z.infer<typeof createBookReadingSchema>) => {
    try {
      await mutateAsync({
        ...values,
        startedAt: values.startedAt.toISOString(),
        endedAt: values.endedAt ? values.endedAt.toISOString() : undefined,
      });

      onMutated();

      setIsOpen(false);
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
      <DialogTrigger asChild>{trigger}</DialogTrigger>
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
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Komentarz</FormLabel>
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
                name="startedAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data rozpoczęcia czytania</FormLabel>
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
                            {field.value ? format(field.value, 'PPP') : <span>Wybierz dzień rozpoczęcia</span>}
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
              <FormField
                control={form.control}
                name="endedAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data zakończenia czytania</FormLabel>
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
                            {field.value ? format(field.value, 'PPP') : <span>Wybierz dzień zakończenia</span>}
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
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-8 gap-2 flex sm:justify-center justify-center sm:items-center items-center">
                <Button
                  className="bg-transparent text-primary w-32 sm:w-40"
                  onClick={() => setIsOpen(false)}
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
