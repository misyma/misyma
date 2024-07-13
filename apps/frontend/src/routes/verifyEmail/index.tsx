import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { FC, useEffect } from 'react';
import { z } from 'zod';
import { RequireNonAuthComponent } from '../../modules/core/components/requireNonAuth/requireNonAuthComponent';
import { useToast } from '../../modules/common/components/ui/use-toast';
import { Logo } from '../../modules/common/components/logo/logo';
import { useVerifyUserEmailMutation } from '../../modules/auth/api/verifyUserEmailMutation/verifyUserEmailMutation';
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

const searchSchema = z.object({
  token: z.string().min(1).catch(''),
});

export const Route = createFileRoute('/verifyEmail/')({
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
})
