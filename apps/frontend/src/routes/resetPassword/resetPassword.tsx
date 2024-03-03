/* eslint-disable react-refresh/only-export-components */
import { Link, createRoute } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { FC, useState } from 'react';
import { SendResetPasswordEmailForm } from './components/sendResetPasswordEmailForm/sendResetPasswordEmailForm';
import { DefaultFormLayout } from '../../layouts/defaultFormLayout';

export const SendResetPasswordEmailPage: FC = () => {
  const [success, setSuccess] = useState(false);

  const onSuccess = async () => {
    setSuccess(true);
  };

  return (
    <DefaultFormLayout>
      {!success ? (
        <>
          <div className="flex flex-col py-16 max-w-[25rem]">
            <SendResetPasswordEmailForm onSuccess={onSuccess} />
            <p className='py-12'>
              Pomyłka? <Link className='text-primary font-semibold' to={'/login'}>Przejdź do logowania.</Link>
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="py-16">
            <p className="text-xl mt-3 font-medium py-2">Wysłaliśmy <span className='text-primary font-semibold'>wiadomość email.</span></p>
            <p className="text-xl mt-3 font-medium py-2">
              Znajdziesz w niej link, który pozwoli Ci ustawić nowe hasło.
            </p>
            <p className="py-8">
              Email się nie pojawił?{' '}
              <a
                className="text-primary font-semibold"
                onClick={() => setSuccess(false)}
              >
                Wyślij ponownie
              </a>
              {' '}lub{' '}
              <Link to='/login' className='text-primary font-semibold'>
                przejdź do logowania
              </Link>
            </p>
          </div>
        </>
      )}
    </DefaultFormLayout>
  );
};

export const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reset-password',
  component: SendResetPasswordEmailPage,
});
