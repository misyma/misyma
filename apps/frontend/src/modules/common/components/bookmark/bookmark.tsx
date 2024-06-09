import { ReactNode } from 'react';

export const Bookmark = (): ReactNode => {
  return (
    <div className="flex items-center">
      <div className="bg-primary h-10 w-10 rounded-full"></div>
      <div className="bg-primary h-1 w-full flex items-start justify-end"></div>
    </div>
  );
};
