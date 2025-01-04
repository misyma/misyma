import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { type FC, type ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { type Writeable, z } from 'zod';

import { type UpdateAuthorRequestBody } from '@common/contracts';

import { Button } from '../../common/components/button/button';
import { Checkbox } from '../../common/components/checkbox/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from '../../common/components/dialog/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../common/components/form/form';
import { Input } from '../../common/components/input/input';
import { ApiError } from '../../common/errors/apiError';
import { userStateSelectors } from '../../core/store/states/userState/userStateSlice';
import { useUpdateAuthorMutation } from '../api/admin/mutations/updateAuthorMutation/updateAuthorMutation';
import { AuthorsApiQueryKeys } from '../api/user/queries/authorsApiQueryKeys';

interface Props {
  className?: string;
  authorId: string;
  authorName: string;
  isApproved: boolean;
  trigger: ReactNode;
  onMutated: () => void | Promise<void>;
}

const updateAuthorSchema = z.object({
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
    .or(z.literal('')),
  isApproved: z.boolean().or(z.undefined()),
});

interface FormProps {
  authorId: string;
  authorName: string;
  isApproved: boolean;
  setIsOpen: (val: boolean) => void;
  setError: (message: string) => void;
  onMutated: () => void | Promise<void>;
}

const UpdateAuthorForm: FC<FormProps> = ({ authorId, setError, setIsOpen, authorName, isApproved, onMutated }) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const queryClient = useQueryClient();

  const { mutateAsync: updateAuthor } = useUpdateAuthorMutation({});

  const form = useForm({
    resolver: zodResolver(updateAuthorSchema),
    defaultValues: {
      name: authorName,
      isApproved,
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  const onCreate = async (values: z.infer<typeof updateAuthorSchema>) => {
    try {
      if (values.isApproved === isApproved && values.name === authorName) {
        setIsOpen(false);

        return form.reset();
      }

      const update: Writeable<UpdateAuthorRequestBody> = {};

      if (values.isApproved !== isApproved) {
        update.isApproved = values.isApproved;
      }

      if (values.name !== authorName) {
        update.name = values.name;
      }

      await updateAuthor({
        accessToken: accessToken ?? '',
        authorId,
        ...update,
      });

      await onMutated();

      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === AuthorsApiQueryKeys.findAuthorsQuery,
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
        <FormField
          name="isApproved"
          render={({ field }) => (
            <FormItem className="flex items-center gap-4">
              <FormControl>
                <Checkbox
                  className="w-6 h-6"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Potwierdzony</FormLabel>
              <FormMessage></FormMessage>
            </FormItem>
          )}
        />
        <Button
          disabled={!form.formState.isValid || !form.formState.isDirty}
          type="submit"
        >
          Aktualizuj
        </Button>
      </form>
    </Form>
  );
};

export const UpdateAuthorModal: FC<Props> = ({ trigger, authorId, authorName, isApproved, onMutated }: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [error, setError] = useState('');

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        setIsOpen(val);

        setError('');
      }}
    >
      <DialogTrigger asChild>
        <div className="cursor-pointer">{trigger}</div>
      </DialogTrigger>
      <DialogContent
        style={{
          borderRadius: '40px',
        }}
        className="max-w-xl py-16"
        omitCloseButton={true}
      >
        <DialogHeader className="font-semibold text-center flex justify-center items-center">
          Zaaktualizuj autora
        </DialogHeader>
        <DialogDescription className="flex flex-col gap-4 justify-center items-center">
          <p className={error ? 'text-red-500' : 'hidden'}>{error}</p>
          <UpdateAuthorForm
            authorId={authorId}
            authorName={authorName}
            isApproved={isApproved}
            onMutated={onMutated}
            setError={setError}
            setIsOpen={setIsOpen}
          />
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
