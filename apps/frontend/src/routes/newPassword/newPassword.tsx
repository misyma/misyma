/* eslint-disable react-refresh/only-export-components */
import { Navigate, createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { FC } from 'react';
import { SetNewPasswordForm } from './components/setNewPasswordForm/setNewPasswordForm';
import { z } from 'zod';
import { DefaultLayout } from '../../layouts/defaultLayout';
import { Logo } from '../../components/logo/logo';

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
    <DefaultLayout>
      <div className="flex-1 py-8">
        <SetNewPasswordForm
          onSuccess={onSuccess}
          token={token}
        />
      </div>
      <Logo />
    </DefaultLayout>
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
