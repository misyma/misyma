import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { type FC, useEffect } from 'react';

import { useVerifyUserEmailMutation } from '../../modules/auth/api/verifyUserEmailMutation/verifyUserEmailMutation';
import { Logo } from '../../modules/common/components/logo/logo';
import { useToast } from '../../modules/common/components/toast/use-toast';
import { RequireNonAuthComponent } from '../../modules/core/components/requireNonAuth/requireNonAuthComponent';
import { DefaultLayout } from '../../modules/core/layouts/default/defaultLayout';

export const VerifyEmailPage: FC = () => {
  const navigate = useNavigate();

  const verifyUserEmailMutation = useVerifyUserEmailMutation({});

  const { toast } = useToast();

  const { token } = Route.useSearch();

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

export const Route = createLazyFileRoute('/verifyEmail/')({
  component: () => {
    return (
      <RequireNonAuthComponent>
        <VerifyEmailPage />
      </RequireNonAuthComponent>
    );
  },
});
