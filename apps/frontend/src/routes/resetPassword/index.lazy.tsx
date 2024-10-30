import { Link, createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { FC, useState } from 'react';
import { SendResetPasswordEmailForm } from '../../modules/auth/components/sendResetPasswordEmailForm/sendResetPasswordEmailForm';
import { RequireNonAuthComponent } from '../../modules/core/components/requireNonAuth/requireNonAuthComponent';
import { Button } from '../../modules/common/components/button/button';
import { DefaultFormLayout } from '../../modules/core/layouts/default/defaultFormLayout';

export const SendResetPasswordEmailPage: FC = () => {
  const navigate = useNavigate();

  const [success, setSuccess] = useState(false);

  const [userEmail, setUserEmail] = useState<string>('');

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
              Jeśli istnieje konto przypisane do tego adresu, otrzymasz{' '}
              <span className="text-primary font-semibold">wiadomość email.</span>
            </p>
            <p className="text-xl mt-3 font-medium py-2">
              Znajdziesz w niej link, który pozwoli Ci ustawić nowe hasło.
            </p>
            <p className="py-8 w-[100%]">
              <Button
                size='xl'
                onClick={() =>
                  navigate({
                    to: '/login',
                  })
                }
              >
                Przejdź do logowania
              </Button>
              <Link
                to="/login"
                className="text-primary font-semibold"
              ></Link>
            </p>
          </div>
        </>
      )}
    </DefaultFormLayout>
  );
};

export const Route = createLazyFileRoute('/resetPassword/')({
  component: () => {
    return (
      <RequireNonAuthComponent>
        <SendResetPasswordEmailPage />
      </RequireNonAuthComponent>
    );
  },
});
