import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { z } from 'zod';

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
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';
import { useCreateQuoteMutation } from '../../api/mutations/createQuoteMutation/createQuoteMutation';
import { getQuotesOptionsQueryKey } from '../../api/queries/getQuotes/getQuotesOptions';

const createQuotationSchema = z
  .object({
    page: z
      .string({
        required_error: 'Strona jest wymagana.',
      })
      .max(16, {
        message: 'Strona może mieć maksylamnie 16 znaków.',
      })
      .or(z.literal('')),
    content: z
      .string({
        required_error: 'Cytat jest wymagany.',
      })
      .min(1, 'Cytat musi mieć minimum 1 znak.')
      .max(256, 'Strona może mieć maksymalnie 256 znaków.'),
  })
  .superRefine((value, ctx) => {
    if (!value.page) {
      return;
    }

    const pageRegex = /^\d+(-\d+)?$/;

    if (!pageRegex.test(value.page)) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_string,
        message: 'Zły format. Pożądany format liczba albo liczba-liczba.',
        validation: 'regex',
        path: ['page'],
      });
    }
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
      page: '',
      content: '',
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  const { mutateAsync, isPending: isCreating } = useCreateQuoteMutation({});

  const onSubmit = async (values: z.infer<typeof createQuotationSchema>): Promise<void> => {
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
        accessToken: accessToken as string,
        createdAt: new Date().toISOString(),
        userBookId,
        userId: userData?.id as string,
        isFavorite: false,
      });

      onMutated();

      setIsOpen(false);

      await queryClient.invalidateQueries({
        queryKey: getQuotesOptionsQueryKey({
          userBookId,
        }),
      });

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
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
