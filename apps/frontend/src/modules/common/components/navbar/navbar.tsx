import { Link, useNavigate, useRouter } from '@tanstack/react-router';
import { FC, Fragment, useMemo } from 'react';
import { IoIosLogOut } from 'react-icons/io';
import { useStoreSelector } from '../../../core/store/hooks/useStoreSelector';
import {
  userStateActions,
  userStateSelectors,
} from '../../../core/store/states/userState/userStateSlice';
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
import { User } from '@common/contracts';

const NavbarBreadcrumbs = () => {
  const breadcrumbKeys = useBreadcrumbKeysContext();

  const router = useRouter();

  const context = router.state.matches;

  const filteredPaths =
    context.filter((route) => route.id !== '__root__') ?? [];
  const allDollarKeys = filteredPaths[0]?.staticData.routeDisplayableNameParts
    ?.map((val) => {
      const dollarValues = [];

      if (val.readableName.includes('$')) {
        dollarValues.push(val.readableName);
      }

      if (val.href.includes('$')) {
        dollarValues.push(val.href);
      }

      return dollarValues;
    })
    .filter(Boolean)
    .flat(2);

  const allCorrespondingValuesPresent = allDollarKeys?.every((entry) => {
    return Object.entries(breadcrumbKeys).find(([key]) => entry.includes(key));
  });

  const replaceHrefPlaceholderWithValue = (href: string): string => {
    const regex = /\$[^/]*\/?$/g;
    const hrefPlaceholderKeys = href.match(regex);

    let finalHref = href;
    hrefPlaceholderKeys?.forEach((matchedKey) => {
      finalHref = href.replace(matchedKey, breadcrumbKeys[matchedKey]);
    });

    return finalHref;
  };

  const truncateText = (text: string, maxWords: number): string => {
    if (!text) {
      return '';
    }

    const parts = text.split(' ');

    if (parts.length <= maxWords) {
      return text;
    }

    return `${parts.slice(0, maxWords).join(' ')} ...`;
  };

  const breadcrumbItems = useMemo(() => {
    {
      return (
        filteredPaths[0]?.staticData.routeDisplayableNameParts?.map(
          (val, index) => (
            <BreadcrumbItem key={`${index}-${val}-breadcrumb`}>
              <BreadcrumbLink asChild>
                <Link
                  key={`${index}-${val}-breadcrumb-link`}
                  className="max-w-80 truncate inline-block"
                  to={replaceHrefPlaceholderWithValue(val.href)}
                >
                  {val?.readableName?.includes('$')
                    ? truncateText(breadcrumbKeys[val?.readableName], 4)
                    : val.readableName}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          )
        ) ?? []
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredPaths[0], breadcrumbKeys]);

  return (
    <Breadcrumb className="pt-4">
      <BreadcrumbList>
        {allCorrespondingValuesPresent &&
          breadcrumbItems.map((item, index) => (
            <Fragment key={`breadcrumb-fragment-${index}`}>
              {item}
              {index !== breadcrumbItems.length - 1 && (
                <BreadcrumbSeparator></BreadcrumbSeparator>
              )}
            </Fragment>
          ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

const useUserState = () => {
  const { mutate: logoutUserMutation } = useLogoutUserMutation({});

  const navigate = useNavigate();

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
      }
    );
  };

  return {
    handleLogout,
    res,
  };
};

const TextLogo: FC = () => (
  <div className="w-[100%] text-3xl md:text-5xl lg:text-5xl font-logo-bold">
    <Link to="/shelves">MISYMA</Link>
  </div>
);

const NavbarList: FC<{ user?: User; handleLogout: () => void }> = ({
  user,
  handleLogout,
}) => {
  const linkClasses =
    '[&.active]:font-extrabold [&.active]:underline underline-offset-8 decoration-[3px] text-nowrap';

  return (
    <ul className="hidden sm:flex sm:flex-1 md:gap-4 lg:gap-6 sm:justify-end w-full items-center align-middle">
      {user?.role === UserRole.admin && (
        <li className="text-primary text-md text-center font-semibold">
          <Link to={'/admin/tabs/authors'} className={linkClasses}>
            Panel administratora
          </Link>
        </li>
      )}
      <li className="text-primary text-md text-center font-semibold">
        <Link to={'/shelves'} className={linkClasses}>
          Moje półki
        </Link>
      </li>
      <li className="text-primary text-md text-center font-semibold">
        <Link to="/non-existent1" className={linkClasses}>
          Cytaty
        </Link>
      </li>
      <li className="text-primary text-md text-center font-semibold">
        <Link to="/non-existent2" className={linkClasses}>
          Kolekcje
        </Link>
      </li>
      <li className="text-primary text-md text-center font-semibold">
        <Link to="/non-existent3" className={linkClasses}>
          Statystyki
        </Link>
      </li>
      <li className="text-primary text-md text-center font-semibold">
        <Link to={'/profile'} className={linkClasses}>
          Profil
        </Link>
      </li>
      <IoIosLogOut
        onClick={handleLogout}
        className="cursor-pointer text-xl sm:text-4xl text-primary"
      />
    </ul>
  );
};

export const Navbar: FC = () => {
  const { res, handleLogout } = useUserState();

  return (
    <div className="flex pt-8 px-8 flex-col bg-white w-full top-0 fixed z-50">
      <div className="bg-white flex justify-end w-full items-center">
        <TextLogo />
        <input type="checkbox" className="md:hidden burger-input"></input>
        <div className="md:hidden">
          <span className="burger-span"></span>
          <span className="burger-span"></span>
          <span className="burger-span"></span>
        </div>
        <NavbarList handleLogout={handleLogout} user={res.data} />
      </div>
      <NavbarBreadcrumbs />
    </div>
  );
};
