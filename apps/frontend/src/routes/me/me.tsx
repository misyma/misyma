import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { AuthenticatedPage } from '../../pages/authenticatedPage/authenticatedPage';
import { RequireAuthComponent } from '../../core/components/requireAuth/requireAuthComponent';

export const meRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'me',
  component: () => {
    return (
      <RequireAuthComponent>
        <AuthenticatedPage />
      </RequireAuthComponent>
    );
  },
});
