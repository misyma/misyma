import { Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';

import { RootPage } from '../../pages/rootPage/rootPage';
import { AuthenticatedPage } from '../../pages/authenticatedPage/authenticatedPage';
import { LoginPage } from '../../pages/loginPage/loginPage';
import { NotFoundPage } from '../../pages/notFoundPage/notFoundPage';
import { UnauthenticatedPage } from '../../pages/unauthenticatedPage/unauthenticatedPage';
import { LandingPage } from '../../pages/landingPage/landingPage';
import { RegisterPage } from '../../pages/registerPage/registerPage';
import { VerifyEmailPage } from '../../pages/verifyEmailPage/verifyEmailPage';
import { RequireAuth } from '../components/requireAuth';

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={<RootPage />}
    >
      <Route element={<RequireAuth />}>
        <Route
          path="/app"
          element={<AuthenticatedPage />}
        ></Route>
      </Route>
      <Route element={<UnauthenticatedPage />}>
        <Route
          path="login"
          element={<LoginPage />}
        />
        <Route
          path="register"
          element={<RegisterPage />}
        />
        <Route
          path="/"
          element={<LandingPage />}
        />
        <Route
          path="/verify-email"
          element={<VerifyEmailPage />}
        />
      </Route>

      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Route>,
  ),
);
