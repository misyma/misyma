import { FC } from 'react';

export const Logo: FC = () => {
  return (
    <div className="flex-1 max-h-[900px] max-w-[900px] flex justify-center">
      <img
        src="/book_square.jpg"
        alt="Misyma's logo"
        className="object-fit aspect-square"
      />
    </div>
  );
};
