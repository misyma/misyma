import { FC } from 'react';

import { useNavigate } from 'react-router-dom';
import { RegisterUserForm } from './components/registerUserForm/registerUserForm';
import { RegisterUserForm } from './components/registerUserForm/registerUserForm';

export const RegisterPage: FC = () => {
  const navigate = useNavigate();

  const onSuccessfulRegister = (result: boolean) => {
    if (result) {
  const onSuccessfulRegister = (result: boolean) => {
    if (result) {
      navigate('/login');
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex gap-16 w-[1000px] h-[450px]">
        <div className="flex-1 py-8">
          <RegisterUserForm onSuccess={onSuccessfulRegister} />
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
