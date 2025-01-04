import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { type FC } from 'react';

import { Button } from '../modules/common/components/button/button';
import { Logo } from '../modules/common/components/logo/logo';

export const LandingPage: FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen px-8">
      <div className="flex items-center justify-center h-screen">
        <div
          className={
            'flex flex-col-reverse sm:flex-row items-center justify-center px-4 h-[800px] pt-[24rem] sm:pt-[5rem]'
          }
        >
          <div className="flex-1 items-center justify-start text-center px-8 py-8 sm:py-24 max-w-[30rem]">
            <div className="flex flex-col items-baseline">
              <div>
                <p className="text-6xl sm:text-8xl font-semibold text-start ml-[-0.25rem] sm:ml-[-0.45rem]">MISYMA</p>
              </div>
              <p className="text-xl sm:text-2xl text-start mt-3">Twoja prywatna biblioteka</p>

              <Button
                onClick={() =>
                  navigate({
                    to: '/login',
                  })
                }
                size="xl"
                className="py-6 px-6 mt-8 sm:mt-16 text-sm sm:text-xl"
              >
                Odkryj jej możliwości
              </Button>
            </div>
          </div>
          <Logo />
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/')({
  component: LandingPage,
});
