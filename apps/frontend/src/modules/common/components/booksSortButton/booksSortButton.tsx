import { Command } from 'cmdk';
import { Button } from '../button/button';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '../tooltip/tooltip';
import { HiBarsArrowDown } from 'react-icons/hi2';
import { Popover, PopoverContent, PopoverTrigger } from '../popover/popover';
import { CommandItem, CommandList } from '../command/command';
import { useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

interface BooksSortButtonProps {
	readonly navigationPath: '/admin/tabs/books' | '/mybooks';
}

export const BooksSortButton = ({ navigationPath }: BooksSortButtonProps) => {
	const [popoverOpen, setPopoverOpen] = useState(false);
	const navigate = useNavigate({ from: navigationPath });
	const search = useSearch({ strict: false });

	const handleSort = (sortValue: 'date-asc' | 'date-desc' | '') => {
		setPopoverOpen(false);
		navigate({
			search: {
				...search,
				sort: sortValue,
				page: 1,
			},
		});
	};

	return (
		<TooltipProvider delayDuration={300}>
			<Tooltip>
				<Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
					<PopoverTrigger asChild>
						<TooltipTrigger asChild>
							<Button size="big-icon">
								<HiBarsArrowDown className="w-8 h-8" />
							</Button>
						</TooltipTrigger>
					</PopoverTrigger>
					<PopoverContent className="w-48 p-0" align="start">
						<Command>
							<CommandList>
								<CommandItem
									onSelect={() => handleSort('date-asc')}
									className="cursor-pointer"
								>
									<span>Data rosnąco</span>
								</CommandItem>
								<CommandItem
									onSelect={() => handleSort('date-desc')}
									className="cursor-pointer"
								>
									<span>Data malejąco</span>
								</CommandItem>
							</CommandList>
						</Command>
					</PopoverContent>
					<TooltipContent>
						<p>Sortuj</p>
					</TooltipContent>
				</Popover>
			</Tooltip>
		</TooltipProvider>
	);
};
