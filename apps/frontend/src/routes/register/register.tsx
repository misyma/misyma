/* eslint-disable react-refresh/only-export-components */
import { Link, createRoute } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { FC, useState } from 'react';
import { RegisterUserForm } from './components/registerUserForm/registerUserForm';
import { DefaultLayout } from '../../layouts/defaultLayout';
import { Logo } from '../../components/logo/logo';

export const RegisterPage: FC = () => {
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const onSuccessfulRegister = (result: boolean) => {
    if (result) {
      setIsSuccess(true);
    }
  };



  return (
    <DefaultLayout innerContainerClassName="flex-col-reverse sm:flex-row">
      <div className="flex-1">
        {!isSuccess ? (
          <RegisterUserForm onSuccess={onSuccessfulRegister} />
        ) : (
          <div className="flex flex-col gap-4">
            <h1 className="font-semibold text-xl sm:text-2xl">Wysłaliśmy wiadomość email.</h1>
            <h1 className="font-semibold text-xl sm:text-2xl">
              Znajdziesz w niej link, który pozwoli Ci aktywować konto
            </h1>
            <div>
              <p>
                Email się nie pojawił?{' '}
                <a
                  className="text-primary font-semibold"
                  href="xd" // TODO: Send email again mutation :)
                >
                  Wyślij ponownie
                </a>
              </p>
              <p>
                lub{' '}
                <Link
                  className="text-primary font-semibold"
                  to={'/login'}
                >
                  przejdź do logowania.
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
      <Logo />
    </DefaultLayout>
  );
};

export const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
});
