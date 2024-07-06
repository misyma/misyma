import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { SetNewPasswordFormSchemaValues, setNewPasswordFormSchema } from './schema/setNewPasswordFormSchema';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../common/components/ui/form';
import { Input } from '../../../common/components/ui/input';
import { Button } from '../../../common/components/ui/button';
import { useSetNewPasswordMutation } from '../../api/setNewPasswordMutation/setNewPasswordMutation';
import { UserApiError } from '../../../user/errors/userApiError';

interface SetNewPasswordFormProps {
  onSuccess: () => void;
  onError?: (error: UserApiError) => void;
  token: string;
}

export const SetNewPasswordForm: FC<SetNewPasswordFormProps> = ({
  onSuccess,
  onError,
  token,
}: SetNewPasswordFormProps) => {
  const form = useForm<SetNewPasswordFormSchemaValues>({
    resolver: zodResolver(setNewPasswordFormSchema),
    defaultValues: {
      repeatedPassword: '',
      password: '',
    },
    mode: 'onTouched'
  });

  const [responseErrorMessage, setResponseErrorMessage] = useState<string | null>(null);

  const setNewPasswordMutation = useSetNewPasswordMutation({});

  const onSubmit = async (values: SetNewPasswordFormSchemaValues) => {
    setNewPasswordMutation.mutate(
      {
        password: values.password,
        token,
      },
      {
        onSuccess: () => onSuccess(),
        onError: (error) => {
          setResponseErrorMessage(error.context?.message);

          if (onError) {
            onError(error);
          }
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="h-[5.5rem]">
              <FormLabel>Nowe hasło</FormLabel>
              <FormControl>
                <Input
                  placeholder="Hasło"
                  type="password"
                  className="w-60 sm:w-96"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="repeatedPassword"
          render={({ field }) => (
            <FormItem className="h-[5.5rem]">
              <FormLabel>Powtórz hasło</FormLabel>
              <FormControl>
                <Input
                  placeholder="Hasło"
                  type="password"
                  className="w-60 sm:w-96"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={!form.formState.isValid}
          className="w-60 sm:w-96 border border-primary"
        >
          Ustaw nowe hasło
        </Button>
        {responseErrorMessage && <FormMessage>{responseErrorMessage}</FormMessage>}
      </form>
    </Form>
  );
};
