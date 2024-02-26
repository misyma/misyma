import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { RegisterPage } from '../../pages/registerPage/registerPage';

export const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
});
