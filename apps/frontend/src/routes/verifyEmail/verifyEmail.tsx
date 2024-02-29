/* eslint-disable react-refresh/only-export-components */
import { Link, createRoute, useNavigate } from '@tanstack/react-router';
import { useVerifyUserEmailMutation } from '../../api/user/mutations/verifyUserEmailMutation/verifyUserEmailMutation';
import { FC, useEffect } from 'react';
import { rootRoute } from '../root';
import { z } from 'zod';

export const VerifyEmailPage: FC = () => {
  const navigate = useNavigate();

  const verifyUserEmailMutation = useVerifyUserEmailMutation({});

  const { token } = verifyEmailRoute.useSearch();

  useEffect(() => {
    verifyUserEmailMutation.mutate(
      {
        token,
      },
      {
        onSuccess: () => {
          navigate({
            to: '/login',
          });
        },
        onError: () => {
          navigate({
            to: '/register',
          });
        },
      },
    );
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex gap-16 w-[1000px] h-[450px]">
        <div className="flex-1 py-8">Weryfikowanie konta...</div>
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

const searchSchema = z.object({
  token: z.string().min(1).catch(''),
});

export const verifyEmailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/verify-email',
  component: VerifyEmailPage,
  validateSearch: searchSchema,
  onError: () => {
    return <Link to={'/login'} />;
  },
});
