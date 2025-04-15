import { useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useRouter } from '@tanstack/react-router';
import { type FC, Fragment, useMemo } from 'react';

import { userRoles, type User } from '@common/contracts';

import { useLogoutUserMutation } from '../../../auth/api/logoutUserMutation/logoutUserMutation';
import { CookieService } from '../../../core/services/cookieService/cookieService';
import { useStoreDispatch } from '../../../core/store/hooks/useStoreDispatch';
import { useStoreSelector } from '../../../core/store/hooks/useStoreSelector';
import { userStateActions, userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';
import { useBreadcrumbKeysContext } from '../../contexts/breadcrumbKeysContext';
import { cn } from '../../lib/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '../breadcrumb/breadcrumb';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from '../menubar/menubar';
import { useLocation } from '@tanstack/react-router';

const NavbarBreadcrumbs = () => {
  const breadcrumbKeys = useBreadcrumbKeysContext();

  const location = useLocation();

  const navigate = useNavigate();

  const router = useRouter();

  const context = router.state.matches;

  const filteredPaths = context.filter((route) => route.id !== '__root__') ?? [];

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
        filteredPaths[0]?.staticData.routeDisplayableNameParts?.map((val, index) => {
          const isCurrentPath = replaceHrefPlaceholderWithValue(val.href) === location.pathname;

          return (
            <BreadcrumbItem key={`${index}-${val}-breadcrumb`}>
              <BreadcrumbLink asChild>
                <Link
                  key={`${index}-${val}-breadcrumb-link`}
                  disabled={isCurrentPath}
                  className={cn('max-w-80 truncate inline-block flex-shrink-0')}
                  onClick={(e) => {
                    const href = replaceHrefPlaceholderWithValue(val.href);

                    if (isCurrentPath) {
                      e.preventDefault();
                      return;
                    }
                    navigate({
                      to: href,
                    });
                  }}
                >
                  {val?.readableName?.includes('$')
                    ? truncateText(breadcrumbKeys[val?.readableName], 4)
                    : val.readableName}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          );
        }) ?? []
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredPaths[0], breadcrumbKeys]);

  return (
    <Breadcrumb className="flex-shrink-0">
      <BreadcrumbList className="pt-4 flex-shrink-0 min-h-[1.25rem]">
        {allCorrespondingValuesPresent &&
          breadcrumbItems.map((item, index) => (
            <Fragment key={`breadcrumb-fragment-${index}`}>
              {item}
              {index !== breadcrumbItems.length - 1 && <BreadcrumbSeparator></BreadcrumbSeparator>}
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

  const queryClient = useQueryClient();

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

          queryClient.invalidateQueries({
            predicate: () => true,
          });

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

  return {
    handleLogout,
    res,
  };
};

const TextLogo: FC = () => (
  <div className="w-[100%] text-3xl font-bold">
    <Link to="/mybooks">MISYMA</Link>
  </div>
);

const NavbarList: FC<{ user?: User; handleLogout: () => void }> = ({ user, handleLogout }) => {
  const navigate = useNavigate();

  const linkClasses =
    '[&.active]:font-extrabold hover:text-primary [&.active]:text-primary underline-offset-8 decoration-[3px] text-nowrap';

  return (
    <ul className="hidden sm:flex sm:flex-1 md:gap-4 lg:gap-12 sm:justify-end w-full items-center align-middle">
      {user?.role === userRoles.admin && (
        <li className="text-gray-700 text-md text-center font-semibold">
          <Link
            to={'/admin/tabs/'}
            className={linkClasses}
          >
            Panel administratora
          </Link>
        </li>
      )}
      <li className="text-gray-700 text-md text-center font-semibold">
        <Link
          to={'/mybooks'}
          className={linkClasses}
        >
          Moje książki
        </Link>
      </li>
      <li className="text-gray-700 text-md text-center font-semibold">
        <Link
          to={'/shelves'}
          className={linkClasses}
        >
          Półki
        </Link>
      </li>
      <li className="text-gray-700 text-md text-center font-semibold">
        <Link
          to={'/quotes'}
          className={linkClasses}
        >
          Cytaty
        </Link>
      </li>
      <li className="text-gray-700 text-md text-center font-semibold">
        <Menubar className="rounded-none space-x-0 border-none data-[state=open]:!bg-none">
          <MenubarMenu>
            <MenubarTrigger
              omitOpenBg
              className={cn(linkClasses, 'text-gray-700 font-semibold text-md p-0')}
            >
              <Link
                to={'/profile'}
                className={linkClasses}
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                Profil
              </Link>
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem
                onClick={() => {
                  navigate({
                    to: '/profile/statistics',
                  });
                }}
                className="pt-2 hover:text-primary"
              >
                Statystyki
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem
                onClick={() => {
                  navigate({
                    to: '/profile',
                  });
                }}
                className="pt-2 hover:text-primary"
              >
                Ustawienia
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem
                onClick={handleLogout}
                className="py-2 hover:text-primary"
              >
                Wyloguj
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </li>
    </ul>
  );
};

export const Navbar: FC = () => {
  const { res, handleLogout } = useUserState();

  return (
    <div className="flex pt-3 px-6 flex-col bg-background w-full sticky top-0 z-50 shadow-sm">
      <div className="bg-background flex justify-end w-full items-center">
        <TextLogo />
        <input
          type="checkbox"
          className="md:hidden burger-input"
        ></input>
        <div className="md:hidden">
          <span className="burger-span"></span>
          <span className="burger-span"></span>
          <span className="burger-span"></span>
        </div>
        <NavbarList
          handleLogout={handleLogout}
          user={res.data}
        />
      </div>
      <NavbarBreadcrumbs />
    </div>
  );
};
