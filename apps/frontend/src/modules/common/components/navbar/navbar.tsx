import { Link, useNavigate, useRouter } from '@tanstack/react-router';
import { FC, useMemo } from 'react';
import { IoIosLogOut } from 'react-icons/io';
import { useStoreSelector } from '../../../core/store/hooks/useStoreSelector';
import { userStateActions, userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';
import { useStoreDispatch } from '../../../core/store/hooks/useStoreDispatch';
import { CookieService } from '../../../core/services/cookieService/cookieService';
import { useLogoutUserMutation } from '../../../auth/api/logoutUserMutation/logoutUserMutation';
import { UserRole } from '@common/contracts';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '../breadcrumb/breadcrumb';
import { useBreadcrumbKeysContext } from '../../contexts/breadcrumbKeysContext';
export const Navbar: FC = () => {
  const navigate = useNavigate();

  const breadcrumbKeys = useBreadcrumbKeysContext();

  const { mutate: logoutUserMutation } = useLogoutUserMutation({});

  const accessToken = useStoreSelector(userStateSelectors.selectAccessToken);

  const refreshToken = useStoreSelector(userStateSelectors.selectRefreshToken);

  const res = useFindUserQuery();

  const dispatch = useStoreDispatch();

  const router = useRouter();

  const context = router.state.matches;

  const filteredPaths = context.filter((route) => route.id !== '__root__');

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

  const dollarKeys = filteredPaths[0].staticData.routeDisplayableNameParts?.filter((val) => val.includes('$'));

  const allCorrespondingValuesPresent = dollarKeys?.every((entry) => {
    return Object.entries(breadcrumbKeys).find(([key]) => entry === key);
  });

  const breadcrumbItems = useMemo(() => {
    {
      return (
        filteredPaths[0].staticData.routeDisplayableNameParts?.map((val) => (
          <BreadcrumbItem>
            <BreadcrumbLink>{val.includes('$') ? breadcrumbKeys[val] : val}</BreadcrumbLink>
          </BreadcrumbItem>
        )) ?? []
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredPaths[0], breadcrumbKeys]);

  return (
    <div className="flex p-8 flex-col w-full top-0 fixed z-50">
      <div className="bg-white flex justify-end w-full items-center">
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
        <ul className="hidden sm:flex sm:flex-1 md:gap-4 lg:gap-6 sm:justify-end w-full items-center align-middle">
          {res.data?.role === UserRole.admin && (
            <li className="text-primary text-md text-center font-semibold">
              <Link
                to={'/admin/tabs/authors'}
                className={linkClasses}
              >
                Panel administratora
              </Link>
            </li>
          )}
          <li className="text-primary text-md text-center font-semibold">
            <Link
              to={'/shelves'}
              className={linkClasses}
            >
              Moje półki
            </Link>
          </li>
          <li className="text-primary text-md text-center font-semibold">
            <Link className={linkClasses}>Cytaty</Link>
          </li>
          <li className="text-primary text-md text-center font-semibold">
            <Link className={linkClasses}>Kolekcje</Link>
          </li>
          <li className="text-primary text-md text-center font-semibold">
            <Link className={linkClasses}>Statystyki</Link>
          </li>
          <li className="text-primary text-md text-center font-semibold">
            <Link
              to={'/profile'}
              className={linkClasses}
            >
              Profil
            </Link>
          </li>
          <IoIosLogOut
            onClick={handleLogout}
            className="cursor-pointer text-xl sm:text-4xl text-primary"
          />
        </ul>
      </div>
      <Breadcrumb className="pt-4">
        <BreadcrumbList>
          {allCorrespondingValuesPresent &&
            breadcrumbItems.map((item, index) => (
              <>
                {item}
                {index !== breadcrumbItems.length - 1 && <BreadcrumbSeparator></BreadcrumbSeparator>}
              </>
            ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
