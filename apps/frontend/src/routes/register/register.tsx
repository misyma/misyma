/* eslint-disable react-refresh/only-export-components */
import { createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { FC } from 'react';
import { RegisterUserForm } from './components/registerUserForm/registerUserForm';

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
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col-reverse sm:flex-row items-center justify-center px-4 h-[600px]">
        <div className="flex-1 p-8">
          <RegisterUserForm onSuccess={onSuccessfulRegister} />
        </div>
        <div className="flex-1 max-h-[300px] max-w-[300px] sm:max-h-[600px] sm:max-w-[600px] flex justify-center">
          <img
            src="/book_square.jpg"
            alt="Misyma's logo"
          />
        </div>
      </div>
    </div>
  );
};

export const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
});
