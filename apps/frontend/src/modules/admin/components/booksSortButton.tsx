import { Command } from 'cmdk';
import { Button } from '../../common/components/button/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../common/components/tooltip/tooltip';
import { HiBarsArrowDown } from 'react-icons/hi2';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../common/components/popover/popover';
import {
  CommandItem,
  CommandList,
} from '../../common/components/command/command';
import { useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

export const BooksSortButton = () => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  const handleSort = (sortValue: 'date-asc' | 'date-desc' | '') => {
    setPopoverOpen(false);
    navigate({
      search: {
        ...search,
        sort: sortValue,
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
                <CommandItem
                  onSelect={() => handleSort('')}
                  className="cursor-pointer"
                >
                  <span>Bez sortowania</span>
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
