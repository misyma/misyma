/* eslint-disable react-refresh/only-export-components */
import { Link, createRoute } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { FC, useState } from 'react';
import { SendResetPasswordEmailForm } from './components/sendResetPasswordEmailForm/sendResetPasswordEmailForm';
import { DefaultFormLayout } from '../../layouts/defaultFormLayout';
import { useSendResetPasswordEmailMutation } from '../../api/user/mutations/sendResetPasswordEmailMutation/sendResetPasswordEmailMutation';
import { useToast } from '../../components/ui/use-toast';

export const SendResetPasswordEmailPage: FC = () => {
  const [success, setSuccess] = useState(false);

  const [userEmail, setUserEmail] = useState<string>('');

  const { mutate: sendResetPasswordEmailMutation } = useSendResetPasswordEmailMutation({});

  const { toast } = useToast();

  const onSuccess = async (email: string) => {
    setSuccess(true);

    setUserEmail(email);
  };

  return (
    <DefaultFormLayout>
      {!success ? (
        <>
          <div className="flex flex-col py-16 max-w-[25rem]">
            <SendResetPasswordEmailForm
              onSuccess={onSuccess}
              email={userEmail}
            />
            <p className="py-12">
              Pomyłka?{' '}
              <Link
                className="text-primary font-semibold"
                to={'/login'}
              >
                Przejdź do logowania.
              </Link>
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="py-16 w-60 sm:w-96">
            <p className="text-xl mt-3 font-medium py-2">
              Wysłaliśmy <span className="text-primary font-semibold">wiadomość email.</span>
            </p>
            <p className="text-xl mt-3 font-medium py-2">
              Znajdziesz w niej link, który pozwoli Ci ustawić nowe hasło.
            </p>
            <p className="py-8">
              Email się nie pojawił?{' '}
              <a
                className="text-primary font-semibold cursor-pointer"
                onClick={() => {
                  setUserEmail(userEmail);

                  sendResetPasswordEmailMutation(
                    { email: userEmail },
                    {
                      onSuccess: () => {
                        toast({
                          description: 'Wiadomość email została wysłana ponownie.',
                          duration: 3000,
                        });
                      },
                      onError: () => {
                        toast({
                          description: 'Nie udało się wysłać wiadomości email. Spróbuj ponownie.',
                          duration: 3000,
                          variant: 'destructive',
                        });
                      },
                    },
                  );
                }}
              >
                Wyślij ponownie
              </a>{' '}
              lub{' '}
              <Link
                to="/login"
                className="text-primary font-semibold"
              >
                przejdź do logowania
              </Link>
            </p>
          </div>
        </>
      )}
    </DefaultFormLayout>
  );
};

export const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reset-password',
  component: SendResetPasswordEmailPage,
});
