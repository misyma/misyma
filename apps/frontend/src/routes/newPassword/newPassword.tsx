/* eslint-disable react-refresh/only-export-components */
import { Navigate, createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { FC } from 'react';
import { SetNewPasswordForm } from './components/setNewPasswordForm/setNewPasswordForm';
import { z } from 'zod';

export const SetNewPasswordPage: FC = () => {
  const navigate = useNavigate();

  const { token } = newPasswordRoute.useSearch();

  const onSuccess = async () => {
    navigate({
      to: '/login',
    });
  };

  if (!token) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex gap-16 w-[1000px] h-[450px]">
        <div className="flex-1 py-8">
          <SetNewPasswordForm
            onSuccess={onSuccess}
            token={token}
          />
        </div>
        <div className="flex-1 flex justify-center">
          <img
            src="/logo.jpg"
            alt="Misyma's logo"
          />
        </div>
      </div>
    </div>
  );
};

const productSearchSchema = z.object({
  token: z.string().min(1).catch(''),
});

export const newPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/new-password',
  component: SetNewPasswordPage,
  validateSearch: productSearchSchema,
});
