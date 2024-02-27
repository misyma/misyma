import { FC } from 'react';
import { Link } from 'react-router-dom';

export const SendResetPasswordEmailSuccessPage: FC = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex gap-16 w-[1000px] h-[450px]">
        <div className="flex-1 py-16">
          <p className="text-xl mt-3 font-medium py-2">Wysłaliśmy wiadomość email.</p>
          <p className="text-xl mt-3 font-medium py-2">Znajdziesz w niej link, który pozwoli Ci ustawić nowe hasło.</p>
          <p className="py-8">
            Email się nie pojawił?{' '}
            <Link
              to="/reset-password"
              className="text-purple-500"
            >
              Wyślij ponownie
            </Link>
          </p>
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
