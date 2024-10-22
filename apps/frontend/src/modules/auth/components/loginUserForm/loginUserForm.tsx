import { FC, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ControllerRenderProps, useForm } from 'react-hook-form';
import {
  LoginUserFormValues,
  loginUserFormSchema,
} from './schema/loginUserFormSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { type LoginUserResponseBody } from '@common/contracts';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../common/components/form/form';
import { Input } from '../../../common/components/input/input';
import { Button } from '../../../common/components/button/button';
import { cn } from '../../../common/lib/utils';
import { PasswordEyeIcon } from '../../../common/components/icons/passwordEyeIcon/passwordEyeIcon';
import { useLoginUserMutation } from '../../api/loginUserMutation/loginUserMutation';
import { UserApiError } from '../../../user/errors/userApiError';
import { LoadingSpinner } from '../../../common/components/spinner/loading-spinner';

interface LoginUserFormProps {
  onSuccess: (loginUserResponseBody: LoginUserResponseBody) => void;
  onError?: (error: UserApiError) => void;
}

export const LoginUserForm: FC<LoginUserFormProps> = ({
  onSuccess,
  onError,
}: LoginUserFormProps) => {
  const { mutate, isPending } = useLoginUserMutation({});

  const [passwordInputType, setPasswordInputType] = useState<
    'text' | 'password'
  >('password');

  const form = useForm<LoginUserFormValues>({
    resolver: zodResolver(loginUserFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  const [responseErrorMessage, setResponseErrorMessage] = useState<
    null | string
  >(null);

  const onSubmit = async (values: LoginUserFormValues) => {
    mutate(
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
      }
    );
  };

  const setInputFieldErrorState = (
    field:
      | ControllerRenderProps<{
          email: string;
        }>
      | ControllerRenderProps<{
          password: string;
        }>
  ) => {
    if (form.formState.errors[field.name]) {
      return 'border-red-500';
    }

    return '';
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="h-[5.5rem]">
                <FormLabel>Email*</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Email"
                    maxLength={254}
                    containerClassName={cn(
                      'focus:border-input',
                      setInputFieldErrorState(field)
                    )}
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
                <FormLabel>Hasło*</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Hasło"
                    type={passwordInputType}
                    maxLength={64}
                    includeQuill={false}
                    otherIcon={
                      <PasswordEyeIcon
                        onClick={() =>
                          setPasswordInputType(
                            passwordInputType === 'password'
                              ? 'text'
                              : 'password'
                          )
                        }
                        passwordType={passwordInputType}
                      />
                    }
                    containerClassName={cn(
                      'focus:border-input',
                      setInputFieldErrorState(field)
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <Button
              type="submit"
              size="xl"
              disabled={!form.formState.isValid || isPending}
            >
              {!isPending && "Wejdź do biblioteki"}
              {isPending && <LoadingSpinner size={24} />}
            </Button>
            <div className="text-xs text-center w-60 sm:w-96 pt-[4px]">
              <Link to="/resetPassword" className="text-primary">
                Nie pamiętasz hasła?{' '}
              </Link>
            </div>
          </div>
          {responseErrorMessage && (
            <FormMessage>{responseErrorMessage}</FormMessage>
          )}
          <p className="font-light">
            Nie masz konta?{' '}
            <Link to="/register" className="text-primary font-semibold">
              Zarejestruj się :)
            </Link>
          </p>
        </form>
      </Form>
    </>
  );
};
