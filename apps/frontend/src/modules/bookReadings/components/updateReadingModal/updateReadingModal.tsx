import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { formatDate } from 'date-fns';
import { pl } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { type FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { HiPencil, HiStar } from 'react-icons/hi';
import { z } from 'zod';

import { type BookReading } from '@common/contracts';

import { Button } from '../../../common/components/button/button';
import { Calendar } from '../../../common/components/calendar/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../../../common/components/dialog/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../common/components/form/form';
import { Popover, PopoverContent, PopoverTrigger } from '../../../common/components/popover/popover';
import { RadioGroup, RadioGroupItem } from '../../../common/components/radioGroup/radio-group';
import { LoadingSpinner } from '../../../common/components/spinner/loading-spinner';
import { Textarea } from '../../../common/components/textArea/textarea';
import { useToast } from '../../../common/components/toast/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../common/components/tooltip/tooltip';
import { cn } from '../../../common/lib/utils';
import { useUpdateBookReadingMutation } from '../../api/mutations/bookReadings/updateBookReadingMutation/updateBookReadingMutation';
import { BookReadingsApiQueryKeys } from '../../api/queries/bookReadingsApiQueryKeys';

interface Props {
  bookReading: BookReading;
  className?: string;
}

const updateBookReadingSchema = z
  .object({
    userBookId: z.string().uuid(),
    comment: z.string().min(1).max(256).optional(),
    rating: z
      .number({
        coerce: true,
      })
      .min(1)
      .max(10)
      .int()
      .optional(),
    startedAt: z.date(),
    endedAt: z.date(),
  })
  .superRefine((args, ctx) => {
    if (args.startedAt && args.endedAt && args.startedAt.getTime() > args.endedAt.getTime()) {
      ctx.addIssue({
        code: 'invalid_date',
        message: 'Data rozpoczęcia czytania nie może być późniejsza niż data zakończenia czytania.',
        path: ['startedAt'],
      });
    }
  });

interface UpdateBookReadingFormProps {
  bookReading: BookReading;
  setIsOpen: (bol: boolean) => void;
  setError: (err: string) => void;
}

const UpdateBookReadingForm: FC<UpdateBookReadingFormProps> = ({ bookReading, setIsOpen, setError }) => {
  const queryClient = useQueryClient();

  const { toast } = useToast();

  const form = useForm<z.infer<typeof updateBookReadingSchema>>({
    resolver: zodResolver(updateBookReadingSchema),
    defaultValues: {
      userBookId: bookReading.userBookId,
      comment: bookReading?.comment,
      rating: bookReading?.rating as number,
      startedAt: new Date(bookReading?.startedAt as string) as Date,
      endedAt: new Date(bookReading?.endedAt as string) as Date,
    },
  });

  const [hoveredValue, setHoveredValue] = useState<number | undefined>();

  const { mutateAsync, isPending: isUpdatingBookReading } = useUpdateBookReadingMutation({});

  const onCreateBookReading = async (values: z.infer<typeof updateBookReadingSchema>) => {
    if (
      values.comment === bookReading.comment &&
      new Date(values.endedAt).getTime() === new Date(bookReading.endedAt).getTime() &&
      new Date(values.startedAt).getTime() === new Date(bookReading.startedAt).getTime() &&
      values.rating === bookReading.rating &&
      values.userBookId === bookReading.userBookId
    ) {
      form.reset();

      setIsOpen(false);

      return;
    }

    try {
      await mutateAsync({
        ...values,
        readingId: bookReading.id,
        startedAt: values.startedAt.toISOString(),
        endedAt: values.endedAt.toISOString(),
      });

      form.reset();

      setIsOpen(false);

      await queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          queryKey[0] === BookReadingsApiQueryKeys.findBookReadings && queryKey[1] === bookReading.userBookId,
      });

      toast({
        variant: 'success',
        title: `Ocena została zaaktualizowana.`,
      });
    } catch (error) {
      if (error instanceof Error) {
        return setError(error.message);
      }

      throw error;
    }
  };

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
              <div className="flex gap-2 items-center justify-end">
                <FormLabel className="text-base">
                  <div className="animate-wiggle text-primary font-bold ">{hoveredValue || field.value}</div>
                </FormLabel>
                <RadioGroup
                  onValueChange={(value) => field.onChange(`${Number(value) + 1}`)}
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
                                Number(field.value) >= index + 1 && !hoveredValue ? 'text-primary' : '',
                              )}
                            />
                          </div>
                        </>
                      );
                    })}
                  </>
                </RadioGroup>
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
                            'text-left w-full font-light text-black',
                          )}
                        >
                          {formatDate(field.value, 'PPP', {
                            locale: pl,
                          })}
                        </span>
                      ) : (
                        <span className={cn('text-muted-foreground font-light text-left w-full')}>
                          Wybierz dzień rozpoczęcia
                        </span>
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
                            'font-light text-left w-full text-black',
                          )}
                        >
                          {formatDate(field.value, 'PPP', {
                            locale: pl,
                          })}
                        </span>
                      ) : (
                        <span className={cn('text-muted-foreground font-light text-left w-full')}>
                          Wybierz dzień zakończenia
                        </span>
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
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.getValues()?.startedAt?.getTime() > form.getValues()?.endedAt?.getTime() && (
          <p className="font-bold text-center text-red-500">
            Data rozpoczęcia czytania nie może <br></br> być późniejsza niż data zakończenia czytania.{' '}
          </p>
        )}
        <div className="pt-8 gap-2 flex sm:justify-center justify-center sm:items-center items-center">
          <Button
            className="bg-transparent text-primary w-32 sm:w-40"
            type="button"
            onClick={() => setIsOpen(false)}
            disabled={isUpdatingBookReading}
          >
            Wróć
          </Button>
          <Button
            type="submit"
            disabled={!form.formState.isValid || isUpdatingBookReading}
            className="bg-primary w-32 sm:w-40"
          >
            {isUpdatingBookReading && <LoadingSpinner size={40} />}
            {!isUpdatingBookReading && <>Potwierdź</>}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export const UpdateBookReadingModal: FC<Props> = ({ bookReading }: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [error, setError] = useState('');

  return (
    <TooltipProvider delayDuration={0}>
      <Dialog
        modal={true}
        open={isOpen}
        onOpenChange={(val) => {
          setIsOpen(val);

          setError('');
        }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                onClick={() => setIsOpen(true)}
                variant="ghost"
                size="icon"
              >
                <HiPencil className="h-8 w-8 text-primary" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zaaktualizuj ocenę</p>
          </TooltipContent>
        </Tooltip>
        <DialogContent
          style={{
            borderRadius: '40px',
          }}
          className="max-w-xl py-16"
          omitCloseButton={true}
        >
          <DialogHeader className="font-semibold text-center flex justify-center items-center">
            Zaaktualizuj ocenę
          </DialogHeader>
          <div className="flex flex-col gap-4 justify-center items-center">
            <p className={error ? 'text-red-500' : 'hidden'}>{error}</p>
            <UpdateBookReadingForm
              bookReading={bookReading}
              setIsOpen={setIsOpen}
              setError={setError}
            />
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};
