import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RegisterUserFormSchemaValues, registerUserFormSchema } from './schema/registerUserFormSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserApiError } from '../../../../api/user/errors/userApiError';
import { useRegisterUserMutation } from '../../../../api/user/mutations/registerUserMutation/registerUserMutation';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../../components/ui/form';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';

interface RegisterUserFormProps {
  onSuccess: (result: boolean) => void;
  onError?: (error: UserApiError) => void;
}

export const RegisterUserForm: FC<RegisterUserFormProps> = ({ onSuccess, onError }: RegisterUserFormProps) => {
  const form = useForm<RegisterUserFormSchemaValues>({
    resolver: zodResolver(registerUserFormSchema),
    defaultValues: {
      email: '',
      password: '',
      repeatedPassword: '',
    },
  });

  const [responseErrorMessage, setResponseErrorMessage] = useState<string | null>(null);

  const registerUserMutation = useRegisterUserMutation({});

  const onSubmit = async (values: RegisterUserFormSchemaValues) => {
    registerUserMutation.mutate(
      {
        email: values.email,
        password: values.password,
        name: 'Maciej',
      },
      {
        onSuccess: (result) => onSuccess(result),
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
    <>
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Haslo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Haslo"
                    type="password"
                    className="w-80"
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
              <FormItem>
                <FormLabel>Powtorz haslo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Haslo"
                    type="password"
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
            className="w-80 border-primary border hover:bg-white bg-white text-primary"
          >
            Zarejestruj sie
          </Button>
          {responseErrorMessage && <FormMessage>{responseErrorMessage}</FormMessage>}
        </form>
      </Form>
    </>
  );
};
