/* eslint-disable react-refresh/only-export-components */
import { Link, createRoute } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { FC } from 'react';
import { Button } from '../../components/ui/button';
import { DefaultLayout } from '../../layouts/defaultLayout';
import { Logo } from '../../components/logo/logo';

export const LandingPage: FC = () => {
  return (
    <DefaultLayout>
      <div className="flex-1 items-center justify-start text-center py-24">
        <div className="flex flex-col items-baseline">
          <h1 className="text-4xl sm:text-7xl font-semibold text-start">MISYMA</h1>
          <p className="text-xl text-start mt-3 font-medium">Twoja prywatna biblioteka</p>
          <Link to="/login">
            <Button className="w-40 sm:w-80 mt-16">Odkryj jej możliwości</Button>
          </Link>
        </div>
      </div>
      <Logo />
    </DefaultLayout>
  );
};

export const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});
