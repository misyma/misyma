import { Link, createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { type FC, useState } from 'react';

import { useSendVerificationEmailMutation } from '../../modules/auth/api/sendVerificationEmailMutation/sendVerificationEmailMutation';
import { RegisterUserForm } from '../../modules/auth/components/registerUserForm/registerUserForm';
import { Button } from '../../modules/common/components/button/button';
import { useToast } from '../../modules/common/components/toast/use-toast';
import { RequireNonAuthComponent } from '../../modules/core/components/requireNonAuth/requireNonAuthComponent';
import { DefaultFormLayout } from '../../modules/core/layouts/default/defaultFormLayout';

export const RegisterPage: FC = () => {
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const [userEmail, setUserEmail] = useState<string>('');

  const navigate = useNavigate();

  const { toast } = useToast();

  const onSuccessfulRegister = (result: { email: string; success: boolean }) => {
    if (result.success) {
      setIsSuccess(true);

      setUserEmail(result.email);
    }
  };

  const { mutate } = useSendVerificationEmailMutation({});

  return (
    <DefaultFormLayout>
      {!isSuccess ? (
        <RegisterUserForm onSuccess={onSuccessfulRegister} />
      ) : (
        <div className="flex flex-col gap-4 w-60 sm:w-96">
          <h1 className="font-semibold text-lg sm:text-xl">
            Wysłaliśmy <span className="text-primary">wiadomość email.</span>
          </h1>
          <h1 className="font-semibold text-lg sm:text-xl max-w-[30rem]">
            Znajdziesz w niej link, który pozwoli Ci aktywować konto
          </h1>
          <div className="pt-5">
            <Button
              size="xl"
              onClick={() => {
                navigate({
                  to: '/login',
                });
              }}
            >
              Przejdź do logowania
            </Button>
            <p className="py-4">
              lub{' '}
              <a
                className="text-primary font-semibold cursor-pointer"
                onClick={() => {
                  mutate(
                    { email: userEmail },
                    {
                      onSuccess: () => {
                        toast({
                          title: 'Wiadomość email została wysłana ponownie.',
                          duration: 3000,
                          variant: 'success',
                        });
                      },
                      onError: () => {
                        toast({
                          description: 'Nie udało się wysłać wiadomości email. Spróbuj ponownie.',
                          duration: 3000,
                          variant: 'destructive',
                        });
                      },
                    },
                  );
                }}
              >
                wyślij email ponownie
              </a>
            </p>
          </div>
        </div>
      )}
      {!isSuccess && (
        <div className="py-16 max-w-[30rem]">
          <span className="align-baseline">
            Masz już konto?{' '}
            <Link
              to="/login"
              className="text-primary font-semibold"
            >
              Wróć do logowania.
            </Link>
          </span>
        </div>
      )}
    </DefaultFormLayout>
  );
};

export const Route = createLazyFileRoute('/register/')({
  component: () => {
    return (
      <RequireNonAuthComponent>
        <RegisterPage />
      </RequireNonAuthComponent>
    );
  },
});
