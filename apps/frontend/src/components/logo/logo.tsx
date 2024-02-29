import { FC } from 'react';

export const Logo: FC = () => {
  return (
    <div className="flex-1 max-h-[600px] max-w-[600px] flex justify-center">
      <img
        src="/book_square.jpg"
        alt="Misyma's logo"
        className="object-fit aspect-square"
      />
    </div>
  );
};
