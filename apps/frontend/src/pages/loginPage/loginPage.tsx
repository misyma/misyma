import { type LoginUserResponseBody } from '@common/contracts';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreDispatch } from '../../core/store/hooks/useStoreDispatch';
import { userStateActions } from '../../core/store/states/userState/userStateSlice';
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
      <div className="flex flex-col-reverse sm:flex-row items-center justify-center px-4 h-[600px]">
        <div className="flex-1 p-8">
          <LoginUserForm onSuccess={onSuccessfulLogin} />
        </div>
        <div className="flex-1 max-h-[300px] max-w-[300px] sm:max-h-[600px] sm:max-w-[600px] flex justify-center">
          <img
            src="/book_square.jpg"
            alt="Misyma's logo"
            className="object-fit aspect-square"
          />
        </div>
      </div>
    </div>
  );
};
