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
  readonly navigationPath: '/admin/tabs/books' | '/mybooks';
}

export const BooksSortButton = ({ navigationPath }: BooksSortButtonProps) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const navigate = useNavigate({ from: navigationPath });

  const search = useSearch({ strict: false });

  const handleSort = (sortValue: 'created-at-asc' | 'created-at-desc' | '') => {
    setPopoverOpen(false);

    navigate({
      search: {
        ...search,
        sort: sortValue,
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
                  onSelect={() => handleSort('created-at-desc')}
                  className="cursor-pointer flex justify-between"
                >
                  <span>Data dodania: najnowsze</span>
                  {search.sort === 'created-at-desc' && selectedSortCheckmark}
                </CommandItem>
                <CommandItem
                  onSelect={() => handleSort('created-at-asc')}
                  className="cursor-pointer flex justify-between"
                >
                  <span>Data dodania: najstarsze</span>
                  {search.sort === 'created-at-asc' && selectedSortCheckmark}
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
