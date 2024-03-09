import { Link, useNavigate } from '@tanstack/react-router';
import { FC } from 'react';
import { FaUser } from 'react-icons/fa';

export const Navbar: FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-8 top-0 fixed flex flex-1 justify-end w-full items-center">
      <div className="w-[100%] font-semibig-clamped font-logo-bold">
        <Link to="/">MISYMA</Link>
      </div>
      <input
        type="checkbox"
        className="sm:hidden burger-input"
      ></input>
      <div className="sm:hidden">
        <span className="burger-span"></span>
        <span className="burger-span"></span>
        <span className="burger-span"></span>
      </div>
      <ul className="hidden sm:flex sm:flex-1 sm:gap-8 sm:justify-end w-full items-center">
        <li>
          <Link
            to={'/'}
            className="[&.active]:font-bold"
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            to={'/test1'}
            className="[&.active]:font-bold"
          >
            Test1
          </Link>
        </li>
        <li>
          <Link
            to={'/test2'}
            className="[&.active]:font-bold"
          >
            Test2
          </Link>
        </li>
        <li>
          <Link
            to={'/test3'}
            className="[&.active]:font-bold"
          >
            Test3
          </Link>
        </li>
        <FaUser
          onClick={() => {
            navigate({
              to: '/login',
            });
          }}
          className="cursor-pointer text-2xl sm:text-4xl"
        />
      </ul>
    </div>
  );
};
