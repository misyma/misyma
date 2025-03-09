import { zodResolver } from '@hookform/resolvers/zod';
import { DialogTitle } from '@radix-ui/react-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { type FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { HiPlus } from 'react-icons/hi2';
import { z } from 'zod';

import { AuthorFieldTooltip } from './authorFieldTooltip';
import { Button } from '../../common/components/button/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from '../../common/components/dialog/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../common/components/form/form';
import { Input } from '../../common/components/input/input';
import { LoadingSpinner } from '../../common/components/spinner/loading-spinner';
import { useToast } from '../../common/components/toast/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../common/components/tooltip/tooltip';
import { ApiError } from '../../common/errors/apiError';
import { useCreateAuthorMutation } from '../api/admin/mutations/createAuthorMutation/createAuthorMutation';
import { AuthorsApiQueryKeys } from '../api/user/queries/authorsApiQueryKeys';

interface Props {
  className?: string;
  onMutated: () => void | Promise<void>;
}

const createAuthorSchema = z.object({
  name: z
    .string({
      required_error: 'Imię jest wymagane.',
    })
    .min(3, {
      message: 'Imię i nazwisko autora musi miec co najmniej trzy znaki.',
    })
    .max(128, {
      message: 'Imię autora powinno mieć maksymalnie 128 znaków.',
    })
    .refine(
      (value) => {
        return value.trim().length > 3;
      },
      {
        message: 'Imię nie może być puste.',
      },
    ),
});

export const CreateAuthorModal: FC<Props> = ({ onMutated }: Props) => {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [error, setError] = useState('');

  const { mutateAsync: createAuthor, isPending } = useCreateAuthorMutation({});

  const form = useForm({
    resolver: zodResolver(createAuthorSchema),
    values: {
      name: '',
    },
    reValidateMode: 'onChange',
    mode: 'onChange',
  });

  const onCreate = async (values: z.infer<typeof createAuthorSchema>) => {
    try {
      await createAuthor({
        name: values.name,
      });

      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === AuthorsApiQueryKeys.findAuthorsQuery,
      });

      toast({
        variant: 'success',
        title: `Autor: ${values.name} został stworzony.`,
      });

      await onMutated();
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        throw error;
      }
    }

    setIsOpen(false);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        setIsOpen(val);

        setError('');

        form.reset();
      }}
    >
      <DialogTrigger asChild>
        <DialogTrigger asChild>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setIsOpen(true)}
                  size="big-icon"
                >
                  <HiPlus className="w-8 h-8"></HiPlus>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Stwórz autora</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </DialogTrigger>
      </DialogTrigger>
      <DialogContent
        aria-describedby="Author creation dialog"
        style={{
          borderRadius: '40px',
        }}
        className="max-w-xl py-16"
        omitCloseButton={false}
      >
        <DialogDescription className="hidden">Author creation dialog</DialogDescription>
        <DialogTitle className="hidden">Stwórz autora</DialogTitle>
        <DialogHeader
          aria-label="Create author modal header"
          className="font-semibold text-center flex justify-center items-center"
        >
          Stwórz autora
        </DialogHeader>
        <div className="flex items-center justify-center">
          <p className={error ? 'text-red-500' : 'hidden'}>{error}</p>
          <Form {...form}>
            <form
              className="flex flex-col gap-8 py-4"
              onSubmit={form.handleSubmit(onCreate)}
            >
              <FormField
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-2 items-center pb-1">
                      <FormLabel>Imię i nazwisko</FormLabel>
                      <AuthorFieldTooltip side="bottom" />
                    </div>
                    <FormControl>
                      <Input
                        min={1}
                        max={128}
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage></FormMessage>
                  </FormItem>
                )}
              />
              <Button
                disabled={isPending || !form.formState.isValid}
                type="submit"
              >
                {isPending ? <LoadingSpinner size={24} /> : 'Stwórz'}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
