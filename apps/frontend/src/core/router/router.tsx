import { Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';

import { RootPage } from '../../pages/rootPage/rootPage';
import { AuthenticatedPage } from '../../pages/authenticatedPage/authenticatedPage';
import { LoginPage } from '../../pages/loginPage/loginPage';
import { NotFoundPage } from '../../pages/notFoundPage/notFoundPage';
import { UnauthenticatedPage } from '../../pages/unauthenticatedPage/unauthenticatedPage';
import { LandingPage } from '../../pages/landingPage/landingPage';
import { RegisterPage } from '../../pages/registerPage/registerPage';
import { VerifyEmailPage } from '../../pages/verifyEmailPage/verifyEmailPage';
import { RequireAuthComponent } from '../components/requireAuth/requireAuthComponent';
import { SetNewPasswordPage } from '../../pages/setNewPasswordPage/setNewPasswordPage';
import { SendResetPasswordEmailPage } from '../../pages/sendResetPasswordEmailPage/sendResetPasswordEmailPage';
import { SendResetPasswordEmailSuccessPage } from '../../pages/sendResetPasswordEmailSuccessPage/sendResetPasswordEmailSuccessPage';

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={<RootPage />}
    >
      <Route element={<RequireAuthComponent />}>
        <Route
          path="/app"
          element={<AuthenticatedPage />}
        ></Route>
      </Route>
      <Route element={<UnauthenticatedPage />}>
        <Route
          path="/"
          element={<LandingPage />}
        />
        <Route
          path="login"
          element={<LoginPage />}
        />
        <Route
          path="register"
          element={<RegisterPage />}
        />
        <Route
          path="/verify-email"
          element={<VerifyEmailPage />}
        />
        <Route
          path="/new-password"
          element={<SetNewPasswordPage />}
        />
        <Route
          path="/reset-password"
          element={<SendResetPasswordEmailPage />}
        />
        <Route
          path="/reset-password-success"
          element={<SendResetPasswordEmailSuccessPage />}
        />
      </Route>

      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Route>,
  ),
);
