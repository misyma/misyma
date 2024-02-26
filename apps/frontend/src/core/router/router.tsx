import { rootRoute } from '../../routes/root';
import { landingRoute } from '../../routes/landing/landing';
import { loginRoute } from '../../routes/login/login';
import { registerRoute } from '../../routes/register/register';

export const routeTree = rootRoute.addChildren([landingRoute, loginRoute, registerRoute]);

// export const router = createBrowserRouter(
//   createRoutesFromElements(
//     <Route
//       path="/"
//       element={<RootPage />}
//     >
//       <Route element={<RequireAuthComponent />}>
//         <Route
//           path="/app"
//           element={<AuthenticatedPage />}
//         ></Route>
//       </Route>
//       <Route element={<UnauthenticatedPage />}>
//         <Route
//           path="login"
//           element={<LoginPage />}
//         />
//         <Route
//           path="register"
//           element={<RegisterPage />}
//         />
//         <Route
//           path="/"
//           element={<LandingPage />}
//         />
//         <Route
//           path="/verify-email"
//           element={<VerifyEmailPage />}
//         />
//       </Route>

//       <Route
//         path="*"
//         element={<NotFoundPage />}
//       />
//     </Route>,
//   ),
// );
