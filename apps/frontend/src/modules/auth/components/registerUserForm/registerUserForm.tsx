import { zodResolver } from '@hookform/resolvers/zod';
import { type FC, useState } from 'react';
import { useForm } from 'react-hook-form';

import { type RegisterUserFormSchemaValues, registerUserFormSchema } from './schema/registerUserFormSchema';
import { Button } from '../../../common/components/button/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../common/components/form/form';
import { PasswordEyeIcon } from '../../../common/components/icons/passwordEyeIcon/passwordEyeIcon';
import { Input } from '../../../common/components/input/input';
import { type UserApiError } from '../../../user/errors/userApiError';
import { useRegisterUserMutation } from '../../api/registerUserMutation/registerUserMutation';
import { LoadingSpinner } from '../../../common/components/spinner/loading-spinner';

interface RegisterUserFormProps {
  onSuccess: (result: { email: string; success: boolean }) => void;
  onError?: (error: UserApiError) => void;
}

export const RegisterUserForm: FC<RegisterUserFormProps> = ({ onSuccess, onError }: RegisterUserFormProps) => {
  const form = useForm<RegisterUserFormSchemaValues>({
    resolver: zodResolver(registerUserFormSchema),
    defaultValues: {
      firstName: '',
      email: '',
      password: '',
      repeatedPassword: '',
    },
    mode: 'onTouched',
  });

  const [responseErrorMessage, setResponseErrorMessage] = useState<string | null>(null);

  const registerUserMutation = useRegisterUserMutation({});

  const [passwordType, setPasswordType] = useState<'text' | 'password'>('password');

  const [repeatedPasswordType, setRepeatedPasswordType] = useState<'text' | 'password'>('password');

  const onSubmit = async (values: RegisterUserFormSchemaValues) => {
    try {
      const result = await registerUserMutation.mutateAsync({
        email: values.email,
        password: values.password,
        name: values.firstName,
      });

      onSuccess({
        email: values.email,
        success: result,
      });
    } catch (error) {
      setResponseErrorMessage((error as UserApiError)?.context?.message);

      if (onError) {
        onError(error as UserApiError);
      }
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="h-[5.5rem]">
                <FormLabel>Imię</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Imię"
                    maxLength={64}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="h-[5.5rem]">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Email"
                    maxLength={320}
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
              <FormItem className="h-[5.5rem]">
                <FormLabel>Hasło</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Hasło"
                    type={passwordType}
                    includeQuill={false}
                    otherIcon={
                      <PasswordEyeIcon
                        onClick={() => setPasswordType(passwordType === 'password' ? 'text' : 'password')}
                        passwordType={passwordType}
                      />
                    }
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
                    type={repeatedPasswordType}
                    includeQuill={false}
                    otherIcon={
                      <PasswordEyeIcon
                        onClick={() =>
                          setRepeatedPasswordType(repeatedPasswordType === 'password' ? 'text' : 'password')
                        }
                        passwordType={repeatedPasswordType}
                      />
                    }
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
            disabled={!form.formState.isValid || registerUserMutation.isPending}
          >
            {registerUserMutation.isPending && <LoadingSpinner size={24} />}
            {!registerUserMutation.isPending && 'Zarejestruj się'}
          </Button>
          {responseErrorMessage && <FormMessage>{responseErrorMessage}</FormMessage>}
        </form>
      </Form>
    </>
  );
};
