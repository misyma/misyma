import { HiOutlineFilter } from 'react-icons/hi';
import { CreateBookModal } from '../../book/components/createBookModal/createBookModal';
import { BookCreationProvider } from '../../bookshelf/context/bookCreationContext/bookCreationContext';
import { Button } from '../../common/components/button/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../common/components/tooltip/tooltip';
import { FC } from 'react';
import { BooksSortButton } from './booksSortButton';

interface BooksTabActionsProps {
  toggleFilterVisibility: () => void;
}
export const BooksTabActions: FC<BooksTabActionsProps> = ({
  toggleFilterVisibility,
}) => {
  return (
    <div className="flex flex-shrink-0 gap-2">
      <BookCreationProvider>
        <CreateBookModal />
      </BookCreationProvider>
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="big-icon" onClick={toggleFilterVisibility}>
              <HiOutlineFilter className="w-8 h-8"></HiOutlineFilter>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Filtruj</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <BooksSortButton />
    </div>
  );
};
