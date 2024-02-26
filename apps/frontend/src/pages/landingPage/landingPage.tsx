import { FC } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export const LandingPage: FC = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex items-center justify-center px-4 h-[600px]">
        <div className="flex-1 items-center justify-start text-center py-24">
          <div className="flex flex-col items-baseline">
            <h1 className="text-4xl sm:text-7xl font-semibold text-start">MISYMA</h1>
            <p className="text-xl text-start mt-3 font-medium">Twoja prywatna biblioteka</p>
            <Link to="/login">
              <Button className="w-40 sm:w-80 mt-16">Odkryj jej możliwości</Button>
            </Link>
          </div>
        </div>
        <div className="flex-1 max-h-[600px] max-w-[600px] flex justify-center">
          <img
            src="/book_square.jpg"
            alt="Misyma's logo"
            className="object-fit aspect-square"
          />
        </div>
      </div>
    </div>
  );
};
