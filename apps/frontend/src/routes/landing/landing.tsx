/* eslint-disable react-refresh/only-export-components */
import { createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { FC } from 'react';
import { Button } from '../../components/ui/button';
import { Logo } from '../../components/logo/logo';

export const LandingPage: FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex items-center justify-center h-screen">
        <div className={'flex flex-col-reverse sm:flex-row items-center justify-center px-4 h-[800px]'}>
          <div className="flex-1 items-center justify-start text-center py-8 sm:py-24">
            <div className="flex flex-col items-baseline">
              <div>
                <p className="sm:ml-[-3px] font-big-clamped font-semibold text-start">MISYMA</p>
              </div>
              <p className="font-medium-clamped text-start mt-3">Twoja prywatna biblioteka</p>
              <Button
                className="w-60 sm:w-96 mt-8 sm:mt-16 text-sm sm:text-xl"
                onClick={() => navigate({
                  to: '/login',
                })}
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

export const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});
