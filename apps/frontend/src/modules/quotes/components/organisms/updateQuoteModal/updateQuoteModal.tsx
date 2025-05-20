import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { HiPencil } from 'react-icons/hi';

import { type Quote } from '@common/contracts';

import { Button } from '../../../../common/components/button/button';
import {
  Dialog,
  DialogContent,
  DialogContentScrollArea,
  DialogDescription,
  DialogHeader,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../../common/components/tooltip/tooltip';
import useDebounce from '../../../../common/hooks/useDebounce';
import {
  type EditQuote,
  editQuoteSchema,
  useUpdateQuoteMutation,
} from '../../../api/mutations/updateQuoteMutation/updateQuoteMutation';

interface Props {
  quote: Quote;
}

export const UpdateQuoteButton = ({ quote }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const debouncedOpen = useDebounce(isOpen, 100);

  return (
    <>
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsOpen(true)}
              variant="ghost"
              size="icon"
            >
              <HiPencil className="cursor-pointer text-primary h-8 w-8" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="z-50">
            <p>Zaaktualizuj cytat</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {debouncedOpen && (
        <UpdateQuoteModal
          open={isOpen}
          quote={quote}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

const UpdateQuoteModal = ({ quote, open, onClose }: Props & { onClose: () => void; open: boolean }) => {
  const { toast } = useToast();

  const form = useForm<EditQuote>({
    resolver: zodResolver(editQuoteSchema),
    defaultValues: {
      page: quote.page ?? '',
      content: quote.content,
    },
    reValidateMode: 'onChange',
    mode: 'onChange',
  });

  const { mutateAsync, isPending: isUpdating } = useUpdateQuoteMutation({});

  const onSubmit = async (values: EditQuote) => {
    if (values.content === quote.content && values.page === quote.page) {
      onClose();
      return;
    }

    try {
      await mutateAsync({
        ...values,
        quoteId: quote.id,
        errorHandling: { title: 'Błąd podczas aktualizowania cytatu.' },
      });

      toast({ title: 'Cytat został zaaktualizowany 😄', variant: 'success' });
      form.reset();
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        form.setError('content', { type: 'manual', message: error.message });
      }
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent
        className="max-w-xl py-16"
        style={{ borderRadius: '40px' }}
      >
        <DialogHeader className="font-semibold text-center flex justify-center items-center">
          Zaaktualizuj cytat
        </DialogHeader>{' '}
        <DialogDescription className="flex flex-col gap-4 justify-center items-center">
          {' '}
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
                    <FormItem>
                      <FormLabel>Strony</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Strony cytatu"
                          maxLength={16}
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
                          placeholder="Cytat..."
                          maxLength={1000}
                          className="resize-none h-44"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-center gap-2 pt-8">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="w-32 sm:w-40"
                  >
                    Wróć
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    disabled={!form.formState.isValid || !form.formState.isDirty || isUpdating}
                    className="bg-primary w-32 sm:w-40"
                  >
                    {isUpdating ? <LoadingSpinner size={40} /> : 'Potwierdź'}
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
