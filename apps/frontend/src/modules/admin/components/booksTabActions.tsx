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
import { BooksSortButton } from '../../common/components/booksSortButton/booksSortButton';

interface BooksTabActionsProps {
	toggleFilterVisibility: () => void;
	filterApplied: boolean;
}
export const BooksTabActions: FC<BooksTabActionsProps> = ({
	filterApplied,
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
							<div className="relative w-full">
								<div className="flex w-full items-center justify-center">
									<HiOutlineFilter className="w-8 h-8"></HiOutlineFilter>
								</div>
								{filterApplied && (
									<div className="absolute h-4 w-4 top-[-10px] right-[-8px] rounded-full bg-green-500"></div>
								)}
							</div>
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Filtruj</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
			<BooksSortButton navigationPath="/admin/tabs/books" />
		</div>
	);
};
