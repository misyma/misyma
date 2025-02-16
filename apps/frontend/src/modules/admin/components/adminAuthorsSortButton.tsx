import { useNavigate, useSearch } from '@tanstack/react-router';
import { Command } from 'cmdk';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { HiBarsArrowDown } from 'react-icons/hi2';

import { Button } from '../../common/components/button/button.js';
import { CommandItem, CommandList } from '../../common/components/command/command.js';
import { Popover, PopoverContent, PopoverTrigger } from '../../common/components/popover/popover.js';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../common/components/tooltip/tooltip.js';

export const AdminAuthorsSortButton = () => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const navigate = useNavigate({ from: '/admin/tabs/authors' });

  // TODO: fix, for some reason it takes types from /admin/tabs/books
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
                  onSelect={() => handleSort('name', 'asc')}
                  className="cursor-pointer flex justify-between"
                >
                  <span>Imię: od A do Z</span>
                  {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    //@ts-ignore
                    search.sortField === 'name' && search.sortOrder === 'asc' && selectedSortCheckmark
                  }
                </CommandItem>
                <CommandItem
                  onSelect={() => handleSort('name', 'desc')}
                  className="cursor-pointer flex justify-between"
                >
                  <span>Imię: od Z do A</span>
                  {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    //@ts-ignore
                    search.sortField === 'name' && search.sortOrder === 'desc' && selectedSortCheckmark
                  }
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
