/* eslint-disable react-refresh/only-export-components */
import { createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { FC } from 'react';
import { RegisterUserForm } from './components/registerUserForm/registerUserForm';
import { DefaultLayout } from '../../layouts/defaultLayout';
import { Logo } from '../../components/logo/logo';

export const RegisterPage: FC = () => {
  const navigate = useNavigate();

  const onSuccessfulRegister = (result: boolean) => {
    if (result) {
      navigate({
        to: '/login',
      });
    }
  };

  return (
    <DefaultLayout innerContainerClassName="flex-col-reverse sm:flex-row">
      <div className="flex-1 p-8">
        <RegisterUserForm onSuccess={onSuccessfulRegister} />
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
