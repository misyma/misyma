import { rootRoute } from '../../routes/root';
import { landingRoute } from '../../routes/landing/landing';
import { loginRoute } from '../../routes/login/login';
import { registerRoute } from '../../routes/register/register';
import { meRoute } from '../../routes/me/me';

export const routeTree = rootRoute.addChildren([landingRoute, loginRoute, registerRoute, meRoute]);
