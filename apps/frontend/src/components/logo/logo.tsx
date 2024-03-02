import { FC } from 'react';

export const Logo: FC = () => {
  return (
    <div className="flex-1 max-h-[700px] max-w-[700px] flex justify-center">
      <img
        src="/book_square.jpg"
        alt="Misyma's logo"
        className="object-fit aspect-square"
      />
    </div>
  );
};
