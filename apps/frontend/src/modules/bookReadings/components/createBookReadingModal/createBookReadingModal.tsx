import { FC, ReactNode, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '../../../common/components/dialog/dialog';
import { formatDate } from 'date-fns';
import { Button } from '../../../common/components/button/button';
import { cn } from '../../../common/lib/utils';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../common/components/form/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../common/components/popover/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../../../common/components/calendar/calendar';
import { Textarea } from '../../../common/components/textArea/textarea';
import { useAddBookReadingMutation } from '../../api/mutations/bookReadings/addBookReadingMutation/addBookReadingMutation';
import { useQueryClient } from '@tanstack/react-query';
import { BookReadingsApiQueryKeys } from '../../api/queries/bookReadingsApiQueryKeys';
import { pl } from 'date-fns/locale';
import {
  RadioGroup,
  RadioGroupItem,
} from '../../../common/components/radioGroup/radio-group';
import { HiStar } from 'react-icons/hi';
import { LoadingSpinner } from '../../../common/components/spinner/loading-spinner';

interface Props {
  bookId: string;
  rating: number;
  className?: string;
  trigger: ReactNode;
  onMutated: () => void | Promise<void>;
}

const createBookReadingSchema = z
  .object({
    userBookId: z.string().uuid(),
    comment: z.string().min(1).max(256).optional(),
    rating: z
      .number({
        coerce: true,
      })
      .min(1)
      .max(10)
      .int(),
    startedAt: z.date(),
    endedAt: z.date(),
  })
  .superRefine((args, ctx) => {
    if (args.startedAt.getTime() > args.endedAt.getTime()) {
      ctx.addIssue({
        code: 'invalid_date',
        message:
          'Data rozpoczęcia czytania nie może być późniejsza niż data zakończenia czytania.',
        path: ['startedAt'],
      });
    }
  });

interface CreateBookReadingFormProps {
  bookId: string;
  rating: number;
  onMutated: () => void;
  setIsOpen: (bol: boolean) => void;
  setError: (err: string) => void;
}

const CreateBookReadingForm: FC<CreateBookReadingFormProps> = ({
  bookId,
  rating,
  onMutated,
  setIsOpen,
  setError,
}) => {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof createBookReadingSchema>>({
    resolver: zodResolver(createBookReadingSchema),
    defaultValues: {
      userBookId: bookId,
      comment: undefined,
      rating,
      startedAt: undefined,
      endedAt: undefined,
    },
  });

  const { mutateAsync, isPending } = useAddBookReadingMutation({});

  const onCreateBookReading = async (
    values: z.infer<typeof createBookReadingSchema>
  ) => {
    try {
      await mutateAsync({
        ...values,
        startedAt: values.startedAt.toISOString(),
        endedAt: values.endedAt.toISOString(),
      });

      form.reset();

      onMutated();

      await queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          queryKey[0] === BookReadingsApiQueryKeys.findBookReadings &&
          queryKey[1] === bookId,
      });

      setIsOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        return setError(error.message);
      }

      throw error;
    }
  };

  const [hoveredValue, setHoveredValue] = useState<number | undefined>();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onCreateBookReading)}
        className="space-y-4 min-w-96"
      >
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem className="flex flex-col justify-end">
              <div className="flex gap-2 items-center justify-start">
                <RadioGroup
                  onValueChange={(value) =>
                    field.onChange(`${Number(value) + 1}`)
                  }
                  value={`${field.value ?? 0}`}
                  className="flex flex-row gap-0"
                >
                  <>
                    {Array.from({ length: 10 }).map((_, index) => {
                      return (
                        <>
                          <div className="relative star-container">
                            <RadioGroupItem
                              className="absolute opacity-0 h-7 w-7"
                              disabled={false}
                              key={index}
                              value={`${index}`}
                              onMouseEnter={() => setHoveredValue(index + 1)}
                              onMouseLeave={() => setHoveredValue(undefined)}
                            />
                            <HiStar
                              className={cn(
                                'h-7 w-7',
                                Number(field.value) >= index + 1 &&
                                  !hoveredValue
                                  ? 'text-primary'
                                  : ''
                              )}
                            />
                          </div>
                        </>
                      );
                    })}
                  </>
                </RadioGroup>
                <FormLabel className="text-base">
                  <div className="animate-wiggle text-primary font-bold ">
                    {hoveredValue || field.value}
                  </div>
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2">
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
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      size="xl"
                      variant={'outline'}
                      className={cn('px-3 text-left font-normal')}
                    >
                      {field.value ? (
                        <span
                          className={cn(
                            !field.value && 'text-muted-foreground',
                            'text-left w-full font-light text-black'
                          )}
                        >
                          {formatDate(field.value, 'PPP', {
                            locale: pl,
                          })}
                        </span>
                      ) : (
                        <span
                          className={cn(
                            'text-muted-foreground font-light text-left w-full'
                          )}
                        >
                          Wybierz dzień rozpoczęcia
                        </span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date('1900-01-01')
                    }
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
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      size="xl"
                      className={cn('px-3 text-left font-normal')}
                    >
                      {field.value ? (
                        <span
                          className={cn(
                            !field.value && 'text-muted-foreground',
                            'font-light text-left w-full text-black'
                          )}
                        >
                          {formatDate(field.value, 'PPP', {
                            locale: pl,
                          })}
                        </span>
                      ) : (
                        <span
                          className={cn(
                            'text-muted-foreground font-light text-left w-full'
                          )}
                        >
                          Wybierz dzień zakończenia
                        </span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.getValues()?.startedAt?.getTime() >
          form.getValues()?.endedAt?.getTime() && (
          <p className="font-bold text-center text-red-500">
            Data rozpoczęcia czytania nie może <br></br> być późniejsza niż data
            zakończenia czytania.{' '}
          </p>
        )}
        <div className="pt-8 gap-2 flex sm:justify-center justify-center sm:items-center items-center">
          <Button
            className="bg-transparent text-primary w-32 sm:w-40"
            onClick={() => setIsOpen(false)}
          >
            Wróć
          </Button>
          <Button
            type="submit"
            disabled={!form.formState.isValid || isPending}
            className="bg-primary w-32 sm:w-40"
          >
            {isPending && <LoadingSpinner size={20} />}
            {!isPending && <p>{'Potwierdź'}</p>}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export const CreateBookReadingModal: FC<Props> = ({
  bookId,
  rating,
  trigger,
  onMutated,
}: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [error, setError] = useState('');

  return (
    <Dialog
      modal={true}
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
      >
        <DialogHeader className="font-semibold text-center flex justify-center items-center">
          Dodatkowe informacje
        </DialogHeader>
        <div className="flex flex-col gap-4 justify-center items-center">
          <p className={error ? 'text-red-500' : 'hidden'}>{error}</p>
          <CreateBookReadingForm
            bookId={bookId}
            onMutated={onMutated}
            rating={rating}
            setIsOpen={setIsOpen}
            setError={setError}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
