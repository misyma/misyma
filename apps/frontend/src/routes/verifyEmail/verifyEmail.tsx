/* eslint-disable react-refresh/only-export-components */
import { Link, createRoute, useNavigate } from '@tanstack/react-router';
import { useVerifyUserEmailMutation } from '../../api/user/mutations/verifyUserEmailMutation/verifyUserEmailMutation';
import { FC, useEffect } from 'react';
import { rootRoute } from '../root';
import { z } from 'zod';
import { DefaultLayout } from '../../layouts/default/defaultLayout';
import { Logo } from '../../components/logo/logo';
import { RequireNonAuthComponent } from '../../core/components/requireNonAuth/requireNonAuthComponent';
import { useToast } from '../../components/ui/use-toast';

export const VerifyEmailPage: FC = () => {
  const navigate = useNavigate();

  const verifyUserEmailMutation = useVerifyUserEmailMutation({});

  const { toast } = useToast();

  const { token } = verifyEmailRoute.useSearch();

  useEffect(() => {
    verifyUserEmailMutation.mutate(
      {
        token,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Email został potwierdzony.',
            description: 'Twój adres email został potwierdzony. Możesz już wejść do swojej własnej biblioteki',
            variant: 'success',
          });

          navigate({
            to: '/login',
          });
        },
        onError: () => {
          toast({
            title: 'Wystąpił błąd.',
            description: 'Wystąpił błąd i Twój adres email nie został potwierdzony. Spróbuj ponownie.',
            variant: 'destructive',
          });

          navigate({
            to: '/register',
          });
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DefaultLayout>
      <div className="flex-1 py-8">Weryfikowanie konta...</div>
      <Logo />
    </DefaultLayout>
  );
};

const searchSchema = z.object({
  token: z.string().min(1).catch(''),
});

export const verifyEmailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/verify-email',
  component: () => {
    return (
      <RequireNonAuthComponent>
        <VerifyEmailPage />
      </RequireNonAuthComponent>
    );
  },
  validateSearch: searchSchema,
  onError: () => {
    return <Link to={'/login'} />;
  },
});
