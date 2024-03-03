/* eslint-disable react-refresh/only-export-components */
import { Link, createRoute } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { FC, useState } from 'react';
import { RegisterUserForm } from './components/registerUserForm/registerUserForm';
import { DefaultFormLayout } from '../../layouts/defaultFormLayout';

export const RegisterPage: FC = () => {
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const onSuccessfulRegister = (result: boolean) => {
    if (result) {
      setIsSuccess(true);
    }
  };

  return (
    <DefaultFormLayout>
      {!isSuccess ? (
        <RegisterUserForm onSuccess={onSuccessfulRegister} />
      ) : (
        <div className="flex flex-col gap-4">
          <h1 className="font-semibold text-xl sm:text-2xl">Wysłaliśmy wiadomość email.</h1>
          <h1 className="font-semibold text-xl sm:text-2xl max-w-[30rem]">
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
      <div className="py-16 flex flex-1 w-60 sm:w-80">
        <span className="align-baseline">
          Masz już konto?{' '}
          <Link
            to="/login"
            className="text-primary font-semibold"
          >
            Wróć do logowania.
          </Link>
        </span>
      </div>
    </DefaultFormLayout>
  );
};

export const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
});
