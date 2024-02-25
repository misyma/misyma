import { FC, useState } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../ui/form';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { LoginUserFormValues, loginUserFormSchema } from './schema/loginUserFormSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLoginUserMutation } from '../../../api/user/mutations/loginUserMutation/loginUserMutation';
import { LoginUserResponseBody } from '@common/contracts';
import { UserApiError } from '../../../api/user/errors/userApiError';

interface LoginUserFormProps {
    onSuccessfulLogin: (loginUserResponseBody: LoginUserResponseBody) => void;
    onError?: (error: UserApiError) => void;
}

export const LoginUserForm: FC<LoginUserFormProps> = ( { onSuccessfulLogin, onError }: LoginUserFormProps) => {
  const loginUserMutation = useLoginUserMutation({});

  const form = useForm<LoginUserFormValues>({
    resolver: zodResolver(loginUserFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const [responseErrorMessage, setResponseErrorMessage] = useState<null | string>(null);

  const onSubmit = async (values: LoginUserFormValues) => {
    loginUserMutation.mutate(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: (loginUserResponseBody) => onSuccessfulLogin(loginUserResponseBody),
        onError: (error) => {
          setResponseErrorMessage(error.context.message);

          if(onError) {
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
          <Button
            type="submit"
            className="w-80 border-black border hover:bg-white bg-white text-primary"
          >
            Zaloguj się
          </Button>
          <p>
            Nie masz konta?{' '}
            <Link
              to="/register"
              className="text-primary"
            >
              Zarejestruj się
            </Link>
          </p>
        </form>
        {responseErrorMessage && <FormMessage>{responseErrorMessage}</FormMessage>}
      </Form>
    </>
  );
};
