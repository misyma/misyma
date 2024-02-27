import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { SendResetPasswordEmailPage } from '../../pages/sendResetPasswordEmailPage/sendResetPasswordEmailPage';

export const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reset-password',
  component: SendResetPasswordEmailPage,
});
