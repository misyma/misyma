import { FC } from 'react';

import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const LandingPage: FC = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex gap-16 w-[1000px] h-[450px]">
        <div className="flex-1 text-center py-24">
          <h1 className="text-6xl font-semibold">MISYMA</h1>
          <p className="text-xl mt-3 font-medium">Twoja prywatna biblioteka</p>
          <Link to="/login">
            <Button className="w-80 mt-16">Odkryj jej możliwości</Button>
          </Link>
        </div>
        <div className="flex-1 flex justify-center">
          <img
            src="/logo.jpg"
            alt="Misyma's logo"
          />
        </div>
      </div>
    </div>
  );
};
