import { FC, useEffect, useMemo } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';
import { useVerifyUserEmailMutation } from '../../api/user/mutations/verifyUserEmailMutation/verifyUserEmailMutation';

export const VerifyEmailPage: FC = () => {
  const navigate = useNavigate();

  const verifyUserEmailMutation = useVerifyUserEmailMutation({});

  const location = useLocation();

  const searchParams = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);

    return searchParams;
  }, [location])

  useEffect(() => {
    verifyUserEmailMutation.mutate({
      token: searchParams.get('token') || ''
    }, {
      onSuccess: () => {
        navigate('/login');
      },
      onError: () => {
        navigate('/register');
      }
    })
  }, [searchParams, navigate, verifyUserEmailMutation]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex gap-16 w-[1000px] h-[450px]">
        <div className="flex-1 p-8">Weryfikowanie konta...</div>
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
