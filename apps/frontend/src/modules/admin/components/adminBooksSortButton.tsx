import { useNavigate, useSearch } from '@tanstack/react-router';
import { Command } from 'cmdk';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { HiBarsArrowDown } from 'react-icons/hi2';

import { Button } from '../../common/components/button/button';
import { CommandItem, CommandList } from '../../common/components/command/command';
import { Popover, PopoverContent, PopoverTrigger } from '../../common/components/popover/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../common/components/tooltip/tooltip';

export const AdminBooksSortButton = () => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const navigate = useNavigate({ from: '/admin/tabs/books' });

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
            className="w-40 p-0"
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
                  onSelect={() => handleSort('title', 'asc')}
                  className="cursor-pointer flex justify-between"
                >
                  <span>Tytuł: od A do Z</span>
                  {search.sortField === 'title' && search.sortOrder === 'asc' && selectedSortCheckmark}
                </CommandItem>
                <CommandItem
                  onSelect={() => handleSort('title', 'desc')}
                  className="cursor-pointer flex justify-between"
                >
                  <span>Tytuł: od Z do A</span>
                  {search.sortField === 'title' && search.sortOrder === 'desc' && selectedSortCheckmark}
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
