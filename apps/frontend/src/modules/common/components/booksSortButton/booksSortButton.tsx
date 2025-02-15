import { useNavigate, useSearch } from '@tanstack/react-router';
import { Command } from 'cmdk';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { HiBarsArrowDown } from 'react-icons/hi2';

import { Button } from '../button/button';
import { CommandItem, CommandList } from '../command/command';
import { Popover, PopoverContent, PopoverTrigger } from '../popover/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../tooltip/tooltip';

interface BooksSortButtonProps {
  readonly navigationPath: '/mybooks' | `/shelves/bookshelf/${string}`;
}

export const BooksSortButton = ({ navigationPath }: BooksSortButtonProps) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const navigate = useNavigate({ from: navigationPath });

  const search = useSearch({ strict: false });

  const handleSort = (sortField: string, sortOrder: string) => {
    setPopoverOpen(false);

    navigate({
      search: {
        ...search,
        sortField,
        sortOrder,
        page: 1,
      },
    });
  };

  const selectedSortCheckmark = <Check className="h-4 w-4" />;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <Popover
          open={popoverOpen}
          onOpenChange={setPopoverOpen}
        >
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              <Button size="big-icon">
                <HiBarsArrowDown className="w-8 h-8" />
              </Button>
            </TooltipTrigger>
          </PopoverTrigger>
          <PopoverContent
            className="w-45 p-0"
            align="start"
          >
            <Command>
              <CommandList>
                <CommandItem
                  onSelect={() => handleSort('createdAt', 'desc')}
                  className="cursor-pointer flex justify-between"
                >
                  <span>Data dodania: najnowsze</span>
                  {(!search.sortField && !search.sortOrder && selectedSortCheckmark) ||
                    (search.sortField === 'createdAt' && search.sortOrder === 'desc' && selectedSortCheckmark)}
                </CommandItem>
                <CommandItem
                  onSelect={() => handleSort('createdAt', 'asc')}
                  className="cursor-pointer flex justify-between"
                >
                  <span>Data dodania: najstarsze</span>
                  {search.sortField === 'createdAt' && search.sortOrder === 'asc' && selectedSortCheckmark}
                </CommandItem>

                <CommandItem
                  onSelect={() => handleSort('releaseYear', 'desc')}
                  className="cursor-pointer flex justify-between"
                >
                  <span>Rok wydania: najnowsze</span>
                  {search.sortField === 'releaseYear' && search.sortOrder === 'desc' && selectedSortCheckmark}
                </CommandItem>
                <CommandItem
                  onSelect={() => handleSort('releaseYear', 'asc')}
                  className="cursor-pointer flex justify-between"
                >
                  <span>Rok wydania: najstarsze</span>
                  {search.sortField === 'releaseYear' && search.sortOrder === 'asc' && selectedSortCheckmark}
                </CommandItem>

                <CommandItem
                  onSelect={() => handleSort('rating', 'desc')}
                  className="cursor-pointer flex justify-between"
                >
                  <span>Oceny: najwyższe</span>
                  {search.sortField === 'rating' && search.sortOrder === 'desc' && selectedSortCheckmark}
                </CommandItem>
                <CommandItem
                  onSelect={() => handleSort('rating', 'asc')}
                  className="cursor-pointer flex justify-between"
                >
                  <span>Oceny: najniższe</span>
                  {search.sortField === 'rating' && search.sortOrder === 'asc' && selectedSortCheckmark}
                </CommandItem>

                <CommandItem
                  onSelect={() => handleSort('readingDate', 'desc')}
                  className="cursor-pointer flex justify-between"
                >
                  <span>Data przeczytania: najnowsze</span>
                  {search.sortField === 'readingDate' && search.sortOrder === 'desc' && selectedSortCheckmark}
                </CommandItem>
                <CommandItem
                  onSelect={() => handleSort('readingDate', 'asc')}
                  className="cursor-pointer flex justify-between"
                >
                  <span>Data przeczytania: najstarsze</span>
                  {search.sortField === 'readingDate' && search.sortOrder === 'asc' && selectedSortCheckmark}
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
