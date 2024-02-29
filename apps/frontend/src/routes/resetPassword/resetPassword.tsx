/* eslint-disable react-refresh/only-export-components */
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { FC, useState } from 'react';
import { SendResetPasswordEmailForm } from './components/sendResetPasswordEmailForm/sendResetPasswordEmailForm';

export const SendResetPasswordEmailPage: FC = () => {
  const [success, setSuccess] = useState(false);

  const onSuccess = async () => {
    setSuccess(true);
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex gap-16 w-[1000px] h-[450px]">
        {!success ? (
          <>
            <div className="flex-1 py-8">
              <SendResetPasswordEmailForm onSuccess={onSuccess} />
            </div>
            <div className="flex-1 flex justify-center">
              <img
                src="/logo.jpg"
                alt="Misyma's logo"
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 py-16">
              <p className="text-xl mt-3 font-medium py-2">Wysłaliśmy wiadomość email.</p>
              <p className="text-xl mt-3 font-medium py-2">
                Znajdziesz w niej link, który pozwoli Ci ustawić nowe hasło.
              </p>
              <p className="py-8">
                Email się nie pojawił?{' '}
                <a
                  className="text-periwinkle-800"
                  onClick={() => setSuccess(false)}
                >
                  Wyślij ponownie
                </a>
              </p>
            </div>
            <div className="flex-1 flex justify-center">
              <img
                src="/logo.jpg"
                alt="Misyma's logo"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reset-password',
  component: SendResetPasswordEmailPage,
});
