import { FC, ReactNode, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from '../../../common/components/dialog/dialog';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../common/components/form/form';
import { Input } from '../../../common/components/input/input';
import { Button } from '../../../common/components/button/button';
import { useCreateAuthorMutation } from '../../api/admin/mutations/createAuthorMutation/createAuthorMutation';
import { useSelector } from 'react-redux';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { ApiError } from '../../../common/errors/apiError';
import { useQueryClient } from '@tanstack/react-query';
import { AuthorsApiQueryKeys } from '../../api/user/queries/authorsApiQueryKeys';
import { useToast } from '../../../common/components/toast/use-toast';

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
      message: 'Imię autora musi miec co najmniej trzy znaki.',
    })
    .max(128, {
      message: 'Imię autora powinno mieć maksymalnie 128 znaków.',
    })
});

export const AddAuthorModal: FC<Props> = ({ trigger, onMutated }: Props) => {
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
    mode: 'onTouched',
  });

  const onCreate = async (values: z.infer<typeof createAuthorSchema>) => {
    try {
      await createAuthor({
        accessToken: accessToken ?? '',
        name: values.name,
      });

      await onMutated();

      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === AuthorsApiQueryKeys.findAuthorsQuery,
      });

      toast({
        variant: 'success',
        title: `Autor: ${values.name} został stworzony.`,
      });
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
          Stwórz autora
        </DialogHeader>
        <DialogDescription className="flex flex-col gap-4 justify-center items-center">
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
                    <FormLabel>Imię i nazwisko</FormLabel>
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
                disabled={!form.formState.isValid}
                type="submit"
              >
                Stwórz
              </Button>
            </form>
          </Form>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
