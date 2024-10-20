import { FC, ReactNode } from 'react';
import { BookImageMiniature } from '../components/bookImageMiniature/bookImageMiniature';

interface BookTabLayoutProps {
  MainBodySlot: ReactNode;
  ActionsSlot: ReactNode;
  NavigationSlot: ReactNode;
  ButtonSlot: ReactNode;
  bookImageSrc: string;
}
export const BookTabLayout: FC<BookTabLayoutProps> = ({
  MainBodySlot,
  ActionsSlot,
  NavigationSlot,
  ButtonSlot,
  bookImageSrc,
}) => {
  return (
    <div className="flex w-full justify-center items-center w-100% px-8 py-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 w-full gap-y-8 gap-x-4  sm:max-w-screen-2xl">
        <div className="col-span-2 sm:col-start-1 sm:col-span-5 flex justify-between">
          {/* sm:visible otherwise dropdown component visible */}
          {NavigationSlot}
          {ActionsSlot}
        </div>
        <div className="flex flex-col sm:flex-row col-start-1 col-span-2 sm:col-span-5 gap-6 w-full">
          <div>
            <BookImageMiniature
              className="object-cover max-w-80"
              bookImageSrc={bookImageSrc}
            />
          </div>
          <div className="flex justify-center">{ButtonSlot}</div>
          <div className="flex flex-col gap-4 w-3/4">{MainBodySlot}</div>
        </div>{' '}
      </div>
    </div>
  );
};
