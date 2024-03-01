import { FC, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ControllerRenderProps, useForm } from 'react-hook-form';
import { LoginUserFormValues, loginUserFormSchema } from './schema/loginUserFormSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { type LoginUserResponseBody } from '@common/contracts';
import { useLoginUserMutation } from '../../../../api/user/mutations/loginUserMutation/loginUserMutation';
import { UserApiError } from '../../../../api/user/errors/userApiError';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../../components/ui/form';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { cn } from '../../../../lib/utils';

interface LoginUserFormProps {
  onSuccess: (loginUserResponseBody: LoginUserResponseBody) => void;
  onError?: (error: UserApiError) => void;
}

export const LoginUserForm: FC<LoginUserFormProps> = ({ onSuccess, onError }: LoginUserFormProps) => {
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
        onSuccess: (loginUserResponseBody) => onSuccess(loginUserResponseBody),
        onError: (error) => {
          setResponseErrorMessage(error.context.message);

          if (onError) {
            onError(error);
          }
        },
      },
    );
  };

  const setInputFieldErrorState = (
    field:
      | ControllerRenderProps<{
          email: string;
        }>
      | ControllerRenderProps<{
          password: string;
        }>,
  ) => {
    if (form.formState.errors[field.name]) {
      return 'border-red-500';
    }

    return '';
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
                    className={cn('w-60 sm:w-80 focus:border-input bg-[#D1D5DB]/20', setInputFieldErrorState(field))}
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
                    className={cn('w-60 sm:w-80 focus:border-input bg-[#D1D5DB]/20', setInputFieldErrorState(field))}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-60 sm:w-80 border-primary border-[1.25px] bg-white text-primary font-semibold hover:bg-periwinkle-50 hover:opacity-90"
          >
            Wejdź do biblioteki
          </Button>
          <p className="font-light">
            Nie masz konta?{' '}
            <Link
              to="/register"
              className="text-primary font-semibold"
            >
              Zarejestruj się
            </Link>
          </p>
          <p>
            Zapomniałeś hasła?{' '}
            <Link
              to="/reset-password"
              className="text-primary"
            >
              Kliknij tutaj
            </Link>
          </p>
        </form>
        {responseErrorMessage && <FormMessage>{responseErrorMessage}</FormMessage>}
      </Form>
    </>
  );
};
