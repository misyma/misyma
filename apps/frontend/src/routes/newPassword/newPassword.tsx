import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { SetNewPasswordPage } from '../../pages/setNewPasswordPage/setNewPasswordPage';

export const newPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/new-password',
  component: SetNewPasswordPage,
});
