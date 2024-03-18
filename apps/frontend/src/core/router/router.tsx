import { rootRoute } from '../../routes/root';
import { landingRoute } from '../../routes/landing/landing';
import { loginRoute } from '../../routes/login/login';
import { registerRoute } from '../../routes/register/register';
import { meRoute } from '../../routes/me/me';
import { resetPasswordRoute } from '../../routes/resetPassword/resetPassword';
import { newPasswordRoute } from '../../routes/newPassword/newPassword';
import { verifyEmailRoute } from '../../routes/verifyEmail/verifyEmail';
import { bookRoute } from '../../routes/myBooks/book';
import { shelvesRoute } from '../../routes/shelves/shelves';
import { bookshelfRoute } from '../../routes/bookshelf/bookshelf';

export const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  registerRoute,
  meRoute,
  resetPasswordRoute,
  newPasswordRoute,
  verifyEmailRoute,
  bookRoute,
  shelvesRoute,
  bookshelfRoute
]);
