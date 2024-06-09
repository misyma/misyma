import { rootRoute } from '../../../routes/root';
import { landingRoute } from '../../../routes/landing/landing';
import { loginRoute } from '../../../routes/login/login';
import { registerRoute } from '../../../routes/register/register';
import { meRoute } from '../../../routes/me/me';
import { resetPasswordRoute } from '../../../routes/resetPassword/resetPassword';
import { newPasswordRoute } from '../../../routes/newPassword/newPassword';
import { verifyEmailRoute } from '../../../routes/verifyEmail/verifyEmail';
import { bookRoute } from '../../../routes/myBooks/book';
import { shelvesRoute } from '../../../routes/shelves/shelves';
import { bookshelfRoute } from '../../../routes/bookshelf/bookshelf';
import { createBookRoute } from '../../../routes/bookshelf/createBook/createBook';
import { searchRoute } from '../../../routes/bookshelf/search/search';
import { searchResultRoute } from '../../../routes/bookshelf/search/routes/result/searchResult';
import { searchCreateRoute } from '../../../routes/bookshelf/search/routes/create/searchCreate';

export const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  registerRoute,
  meRoute,
  resetPasswordRoute,
  newPasswordRoute,
  verifyEmailRoute,
  createBookRoute,
  bookRoute,
  shelvesRoute,
  bookshelfRoute,
  searchRoute,
  searchResultRoute,
  searchCreateRoute,
]);
