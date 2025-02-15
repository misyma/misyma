import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import { HiPencil } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { z } from 'zod';

import { type Quote } from '@common/contracts';

import { Button } from '../../../common/components/button/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from '../../../common/components/dialog/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../common/components/form/form';
import { Input } from '../../../common/components/input/input';
import { LoadingSpinner } from '../../../common/components/spinner/loading-spinner';
import { Textarea } from '../../../common/components/textArea/textarea';
import { useToast } from '../../../common/components/toast/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../common/components/tooltip/tooltip';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useUpdateQuoteMutation } from '../../api/mutations/updateQuoteMutation/updateQuoteMutation';
import { QuotesApiQueryKeys } from '../../api/queries/quotesApiQueryKeys';

const editQuoteSchema = z
  .object({
    page: z
      .string({
        required_error: 'Strona jest wymagana.',
      })
      .max(16, {
        message: 'Strona może mieć maksymalnie 16 znaków.',
      })
      .optional()
      .or(z.literal('')),
    content: z
      .string({
        required_error: 'Cytat jest wymagany.',
      })
      .min(1, 'Cytat musi mieć minimum 1 znak.')
      .max(256, 'Strona może mieć maksymalnie 256 znaków.')
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.page) {
      return;
    }

    const match = value.page.match(/[0-9-]+/g);

    if (match?.[0]?.length !== value.page.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_string,
        message: 'Strona powinna zawierać cyfry lub znak `-`',
        validation: 'regex',
        path: ['page'],
      });
    }
  });

interface Props {
  quote: Quote;
}

export const UpdateQuoteModal = ({ quote }: Props) => {
  return <WrappedModal quote={quote} />;
};

const WrappedModal = ({ quote }: Props): ReactNode => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { toast } = useToast();

  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [error, setError] = useState('');

  const form = useForm<z.infer<typeof editQuoteSchema>>({
    resolver: zodResolver(editQuoteSchema),
    defaultValues: {
      page: quote.page,
      content: quote.content,
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  const { mutateAsync, isPending: isUpdating } = useUpdateQuoteMutation({});

  const onSubmit = async (values: z.infer<typeof editQuoteSchema>): Promise<void> => {
    if (values.content === quote.content && values.page === quote.page) {
      setIsOpen(false);

      return;
    }

    const payload: {
      content: string | undefined;
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
        accessToken: accessToken as string,
        quoteId: quote.id,
        errorHandling: {
          title: 'Błąd podczas aktualizowania cytatu.',
        },
      });

      await queryClient.invalidateQueries({
        predicate: ({ queryKey }) => queryKey[0] === QuotesApiQueryKeys.findQuotes,
      });

      setIsOpen(false);

      toast({
        title: 'Cytat został zaaktualizowany 😄',
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
    <TooltipProvider delayDuration={0}>
      <Dialog
        open={isOpen}
        onOpenChange={(val) => {
          setIsOpen(val);

          form.reset();

          form.clearErrors();

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
                <HiPencil className="cursor-pointer text-primary h-8 w-8" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zaaktualizuj cytat</p>
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
            Zaaktualizuj cytat
          </DialogHeader>
          <DialogDescription className="flex flex-col gap-4 justify-center items-center">
            <p className={error ? 'text-red-500' : 'hidden'}>{error}</p>
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
                          maxLength={256}
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
                    variant={isUpdating ? 'ghost' : 'outline'}
                    disabled={isUpdating}
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
                    variant={isUpdating ? 'ghost' : 'default'}
                    disabled={!form.formState.isValid || !form.formState.isDirty || isUpdating}
                    className="bg-primary w-32 sm:w-40"
                  >
                    {isUpdating && <LoadingSpinner size={40} />}
                    {!isUpdating && <p>Potwierdź</p>}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};
