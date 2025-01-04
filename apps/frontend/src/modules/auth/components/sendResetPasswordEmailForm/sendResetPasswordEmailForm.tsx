import { zodResolver } from '@hookform/resolvers/zod';
import { type FC, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  type SendResetPasswordEmailFormSchemaValues,
  sendResetPasswordEmailFormSchema,
} from './schema/sendResetPasswordEmailFormSchema';
import { Button } from '../../../common/components/button/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../common/components/form/form';
import { Input } from '../../../common/components/input/input';
import { type UserApiError } from '../../../user/errors/userApiError';
import { useSendResetPasswordEmailMutation } from '../../api/sendResetPasswordEmailMutation/sendResetPasswordEmailMutation';

interface SendResetPasswordEmailFormProps {
  onSuccess: (email: string) => void;
  onError?: (error: UserApiError) => void;
  email?: string;
}

export const SendResetPasswordEmailForm: FC<SendResetPasswordEmailFormProps> = ({
  onSuccess,
  onError,
  email = '',
}: SendResetPasswordEmailFormProps) => {
  const form = useForm<SendResetPasswordEmailFormSchemaValues>({
    resolver: zodResolver(sendResetPasswordEmailFormSchema),
    defaultValues: {
      email,
    },
    mode: 'onTouched',
  });

  const [responseErrorMessage, setResponseErrorMessage] = useState<string | null>(null);

  const sendResetPasswordEmailMutation = useSendResetPasswordEmailMutation({});

  const onSubmit = async (values: SendResetPasswordEmailFormSchemaValues) => {
    sendResetPasswordEmailMutation.mutate(
      {
        email: values.email,
      },
      {
        onSuccess: () => onSuccess(form.getValues().email),
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
          name="email"
          render={({ field }) => (
            <FormItem className="h-[5.5rem]">
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size="xl"
          disabled={!form.formState.isValid}
        >
          Zresetuj hasło
        </Button>
        {responseErrorMessage && <FormMessage>{responseErrorMessage}</FormMessage>}
      </form>
    </Form>
  );
};
