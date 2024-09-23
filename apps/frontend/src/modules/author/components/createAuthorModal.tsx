import { FC, ReactNode, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { DialogTitle } from '@radix-ui/react-dialog';
import { userStateSelectors } from '../../core/store/states/userState/userStateSlice';
import { useToast } from '../../common/components/toast/use-toast';
import { useCreateAuthorMutation } from '../api/admin/mutations/createAuthorMutation/createAuthorMutation';
import { AuthorsApiQueryKeys } from '../api/user/queries/authorsApiQueryKeys';
import { ApiError } from '../../common/errors/apiError';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from '../../common/components/dialog/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../common/components/form/form';
import { AuthorFieldTooltip } from './authorFieldTooltip';
import { Input } from '../../common/components/input/input';
import { Button } from '../../common/components/button/button';

interface Props {
  className?: string;
  trigger: ReactNode;
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
        message: 'Imię nie może być puste.',
      }
    ),
});

export const CreateAuthorModal: FC<Props> = ({ trigger, onMutated }: Props) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const { toast } = useToast();

  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [error, setError] = useState('');

  const { mutateAsync: createAuthor } = useCreateAuthorMutation({});

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
        accessToken: accessToken ?? '',
        name: values.name,
      });

      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === AuthorsApiQueryKeys.findAuthorsQuery,
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
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        aria-describedby="Author creation dialog"
        style={{
          borderRadius: '40px',
        }}
        className="max-w-xl py-16"
        omitCloseButton={false}
      >
        <DialogDescription className="hidden">
          Author creation dialog
        </DialogDescription>
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
                      <Input min={1} max={128} type="text" {...field} />
                    </FormControl>
                    <FormMessage></FormMessage>
                  </FormItem>
                )}
              />
              <Button disabled={!form.formState.isValid} type="submit">
                Stwórz
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
