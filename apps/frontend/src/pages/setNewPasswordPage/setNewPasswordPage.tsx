import { FC, useMemo } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { SetNewPasswordForm } from './components/setNewPasswordForm/setNewPasswordForm';

export const SetNewPasswordPage: FC = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const token = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);

    return searchParams.get('token');
  }, [location]);

  const onSuccess = async () => {
    navigate('/login');
  };

  if (!token) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex gap-16 w-[1000px] h-[450px]">
        <div className="flex-1 py-8">
          <SetNewPasswordForm
            onSuccess={onSuccess}
            token={token}
          />
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
