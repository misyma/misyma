import { FC, useEffect } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

export const VerifyEmailPage: FC = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);

  useEffect(() => {
    const verifyEmail = async (token: string | null) => {
      if (!token) {
        console.error('No token found');

        navigate('/login');

        return;
      }

      const verifyEmailResponse = await fetch('https://api.misyma.com/api/users/verify-email', {
        body: JSON.stringify({
          token,
        }),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (verifyEmailResponse.status === 200) {
        navigate('/login');
      } else {
        console.error('Failed to verify email');

        navigate('/register');
      }
    };

    verifyEmail(searchParams.get('token') || '');
  }, [searchParams, navigate]);

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
