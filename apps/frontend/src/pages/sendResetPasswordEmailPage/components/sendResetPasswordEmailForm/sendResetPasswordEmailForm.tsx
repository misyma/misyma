import { zodResolver } from '@hookform/resolvers/zod';
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';

import type { UserApiError } from '../../../../api/user/errors/userApiError';
import { useSendResetPasswordEmailMutation } from '../../../../api/user/mutations/sendResetPasswordEmailMutation/sendResetPasswordEmailMutation';
import { Button } from '../../../../components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../../components/ui/form';
import { Input } from '../../../../components/ui/input';
import {
  SendResetPasswordEmailFormSchemaValues,
  sendResetPasswordEmailFormSchema,
} from './schema/sendResetPasswordEmailFormSchema';

interface SendResetPasswordEmailFormProps {
  onSuccess: () => void;
  onError?: (error: UserApiError) => void;
}

export const SendResetPasswordEmailForm: FC<SendResetPasswordEmailFormProps> = ({
  onSuccess,
  onError,
}: SendResetPasswordEmailFormProps) => {
  const form = useForm<SendResetPasswordEmailFormSchemaValues>({
    resolver: zodResolver(sendResetPasswordEmailFormSchema),
    defaultValues: {
      email: '',
    },
  });

  const [responseErrorMessage, setResponseErrorMessage] = useState<string | null>(null);

  const sendResetPasswordEmailMutation = useSendResetPasswordEmailMutation({});

  const onSubmit = async (values: SendResetPasswordEmailFormSchemaValues) => {
    sendResetPasswordEmailMutation.mutate(
      {
        email: values.email,
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
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Email"
                  className="w-80"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-80 border-black border border-black hover:bg-white bg-white text-primary"
        >
          Zresetuj hasło
        </Button>
        {responseErrorMessage && <FormMessage>{responseErrorMessage}</FormMessage>}
      </form>
    </Form>
  );
};
