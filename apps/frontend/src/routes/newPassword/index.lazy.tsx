import { Navigate, createFileRoute, useNavigate } from '@tanstack/react-router';
import { type FC } from 'react';
import { z } from 'zod';

import { SetNewPasswordForm } from '../../modules/auth/components/setNewPasswordForm/setNewPasswordForm';
import { RequireNonAuthComponent } from '../../modules/core/components/requireNonAuth/requireNonAuthComponent';
import { DefaultFormLayout } from '../../modules/core/layouts/default/defaultFormLayout';

export const SetNewPasswordPage: FC = () => {
  const navigate = useNavigate();

  const { token } = Route.useSearch();

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

const resetPasswordTokenSchema = z.object({
  token: z.string().min(1).catch(''),
});

export const Route = createFileRoute('/newPassword/')({
  component: () => {
    return (
      <RequireNonAuthComponent>
        <SetNewPasswordPage />
      </RequireNonAuthComponent>
    );
  },
  validateSearch: resetPasswordTokenSchema,
  onError: () => {
    return <Navigate to={'/login'} />;
  },
});
