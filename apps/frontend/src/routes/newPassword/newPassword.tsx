/* eslint-disable react-refresh/only-export-components */
import { Navigate, createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { FC } from 'react';
import { SetNewPasswordForm } from './components/setNewPasswordForm/setNewPasswordForm';
import { z } from 'zod';
import { DefaultFormLayout } from '../../layouts/defaultFormLayout';

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
    <DefaultFormLayout>
      <SetNewPasswordForm
        onSuccess={onSuccess}
        token={token}
      />
    </DefaultFormLayout>
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
  onError: () => {
    return <Navigate to={'/login'} />;
  },
});
