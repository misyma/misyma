import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { SendResetPasswordEmailForm } from './components/sendResetPasswordEmailForm/sendResetPasswordEmailForm';

export const SendResetPasswordEmailPage: FC = () => {
  const navigate = useNavigate();

  const onSuccess = async () => {
    console.log('y');
    navigate('/reset-password-success');
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex gap-16 w-[1000px] h-[450px]">
        <div className="flex-1 py-8">
          <SendResetPasswordEmailForm onSuccess={onSuccess} />
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
