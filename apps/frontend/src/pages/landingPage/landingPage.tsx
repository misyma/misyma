import { FC } from 'react';

import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const LandingPage: FC = () => {
  return (
    <>
      <div className="flex items-center justify-center h-screen">
        <div className="flex gap-16 w-[1000px]">
          <div className="flex-1 text-center p-16">
            <h1 className="text-6xl text-bold">MISYMA</h1>
            <p className="text-xl mt-3">Twoja prywatna biblioteka</p>
            <Link to="/login">
              <Button className="w-80 mt-32">Odkryj jej mozliwosci</Button>
            </Link>
          </div>
          <div className="flex-1 flex justify-center">
            <img
              src="https://source.unsplash.com/1600x900/?nature,water"
              alt="Nature"
              className="w-70 h-96 object-cover"
            />
          </div>
        </div>
      </div>
    </>
  );
};
