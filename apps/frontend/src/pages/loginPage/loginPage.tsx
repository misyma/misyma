import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreDispatch } from '../../core/store/hooks/useStoreDispatch';
import { userStateActions } from '../../core/store/states/userState/userStateSlice';
import { type LoginUserResponseBody } from '@common/contracts';
import { LoginUserForm } from './components/loginUserForm/loginUserForm';

export const LoginPage: FC = () => {
  const storeDispatch = useStoreDispatch();

  const navigate = useNavigate();

  const onSuccessfulLogin = (loginUserResponseBody: LoginUserResponseBody) => {
    const { refreshToken, accessToken } = loginUserResponseBody;

    storeDispatch(
      userStateActions.setCurrentUserTokens({
        accessToken,
        refreshToken,
      }),
    );

    navigate('/app');
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex gap-16 w-[1000px] h-[450px]">
        <div className="flex-1 py-8">
          <LoginUserForm onSuccessfulLogin={onSuccessfulLogin} />
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
