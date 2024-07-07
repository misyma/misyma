import { Link, useNavigate } from '@tanstack/react-router';
import { FC } from 'react';
import { IoIosLogOut } from 'react-icons/io';
import { useStoreSelector } from '../../../core/store/hooks/useStoreSelector';
import { userStateActions, userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';
import { useStoreDispatch } from '../../../core/store/hooks/useStoreDispatch';
import { CookieService } from '../../../core/services/cookieService/cookieService';
import { useLogoutUserMutation } from '../../../auth/api/logoutUserMutation/logoutUserMutation';
import { UserRole } from '@common/contracts';
export const Navbar: FC = () => {
  const navigate = useNavigate();

  const { mutate: logoutUserMutation } = useLogoutUserMutation({});

  const accessToken = useStoreSelector(userStateSelectors.selectAccessToken);

  const refreshToken = useStoreSelector(userStateSelectors.selectRefreshToken);

  const res = useFindUserQuery();

  const dispatch = useStoreDispatch();

  const handleLogout = () => {
    if (!accessToken || !refreshToken || !res.data?.id) {
      return;
    }

    logoutUserMutation(
      {
        accessToken,
        userId: res.data?.id,
        refreshToken,
      },
      {
        onSuccess: () => {
          CookieService.removeUserDataCookie();

          CookieService.removeUserTokensCookie();

          dispatch(userStateActions.removeUserState());

          navigate({
            to: '/login',
          });
        },
        onError: () => {
          // TODO: Think through error handling
          CookieService.removeUserDataCookie();

          CookieService.removeUserTokensCookie();

          dispatch(userStateActions.removeUserState());
        },
      },
    );
  };

  const linkClasses = '[&.active]:font-extrabold [&.active]:underline underline-offset-8 decoration-[3px] text-nowrap';

  return (
    <div className="bg-white p-8 top-0 fixed z-50 flex justify-end w-full items-center">
      <div className="w-[100%] text-3xl md:text-5xl lg:text-5xl font-logo-bold">
        <Link to="/">MISYMA</Link>
      </div>
      <input
        type="checkbox"
        className="md:hidden burger-input"
      ></input>
      <div className="md:hidden">
        <span className="burger-span"></span>
        <span className="burger-span"></span>
        <span className="burger-span"></span>
      </div>
      <ul className="hidden sm:flex sm:flex-1 md:gap-4 lg:gap-12 sm:justify-end w-full items-center align-middle">
        {res.data?.role === UserRole.admin && (
          <li className="text-primary text-xl text-center font-semibold">
            <Link
              to={'/admin/authors'}
              className={linkClasses}
            >
              Panel administratora
            </Link>
          </li>
        )}
        <li className="text-primary text-xl text-center font-semibold">
          <Link
            to={'/shelves'}
            className={linkClasses}
          >
            Moje półki
          </Link>
        </li>
        <li className="text-primary text-xl text-center font-semibold">
          <Link
            to={'/quotes'}
            className={linkClasses}
          >
            Cytaty
          </Link>
        </li>
        <li className="text-primary text-xl text-center font-semibold">
          <Link
            to={'/collections'}
            className={linkClasses}
          >
            Kolekcje
          </Link>
        </li>
        <li className="text-primary text-xl text-center font-semibold">
          <Link
            to={'/statistics'}
            className={linkClasses}
          >
            Statystyki
          </Link>
        </li>
        <IoIosLogOut
          onClick={handleLogout}
          className="cursor-pointer text-xl sm:text-4xl text-primary"
        />
      </ul>
    </div>
  );
};
