import { rootRoute } from '../../../routes/root';
import { landingRoute } from '../../../routes/landing/landing';
import { loginRoute } from '../../../routes/login/login';
import { registerRoute } from '../../../routes/register/register';
import { resetPasswordRoute } from '../../../routes/resetPassword/resetPassword';
import { newPasswordRoute } from '../../../routes/newPassword/newPassword';
import { verifyEmailRoute } from '../../../routes/verifyEmail/verifyEmail';
import { shelvesRoute } from '../../../routes/shelves/shelves';
import { bookshelfRoute } from '../../../routes/bookshelf/bookshelf';
import { createBookRoute } from '../../../routes/bookshelf/createBook/createBook';
import { searchRoute } from '../../../routes/bookshelf/search/search';
import { searchResultRoute } from '../../../routes/bookshelf/search/routes/result/searchResult';
import { searchCreateRoute } from '../../../routes/bookshelf/search/routes/create/searchCreate';
import { gradesTabPage } from '../../../routes/myBooks/tabs/gradesTab/gradesTab';
import { basicBookDataRoute } from '../../../routes/myBooks/tabs/basicDataTab/basicDataTab';
import { quotationsTabRoute } from '../../../routes/myBooks/tabs/quotationsTab/quotationsTab';
import { booksAdminRoute } from '../../../routes/admin/tabs/books/books';
import { authorsAdminRoute } from '../../../routes/admin/tabs/authors/authors';
import { booksEditAdminRoute } from '../../../routes/admin/tabs/books/edit/books-edit';
import { changeRequestsAdminRoute } from '../../../routes/admin/tabs/changeRequests/changeRequests';
import { profileRoute } from '../../../routes/profile/profile';
import { changeRequestsViewAdminRoute } from '../../../routes/admin/tabs/changeRequests/id/changeRequestView';

export const routeTree = rootRoute.addChildren([
  booksAdminRoute,
  booksEditAdminRoute,
  changeRequestsAdminRoute,
  changeRequestsViewAdminRoute,
  authorsAdminRoute,
  landingRoute,
  loginRoute,
  registerRoute,
  profileRoute,
  resetPasswordRoute,
  newPasswordRoute,
  verifyEmailRoute,
  createBookRoute,
  shelvesRoute,
  bookshelfRoute,
  searchRoute,
  searchResultRoute,
  searchCreateRoute,
  basicBookDataRoute,
  gradesTabPage,
  quotationsTabRoute,
]);
