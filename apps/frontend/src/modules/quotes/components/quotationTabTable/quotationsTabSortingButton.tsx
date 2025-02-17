import { useNavigate, useSearch } from '@tanstack/react-router';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { HiBarsArrowDown } from 'react-icons/hi2';

import { SortOrder } from '@common/contracts';

import { Button } from '../../../common/components/button/button';
import { Command, CommandItem, CommandList } from '../../../common/components/command/command';
import { Popover, PopoverContent, PopoverTrigger } from '../../../common/components/popover/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../common/components/tooltip/tooltip';

export const QuotationsTabSortingButton = () => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const navigate = useNavigate({ from: '/shelves/bookshelf/book/tabs/quotationsTab/' });

  const search = useSearch({ strict: false });

  const handleSort = (sortField: string, sortOrder: string) => {
    setPopoverOpen(false);

    navigate({
      search: {
        ...search,
        [sortField]: sortOrder,
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
                  onSelect={() => handleSort('sortDate', SortOrder.desc)}
                  className="cursor-pointer flex justify-between"
                >
                  <span>Data dodania: najnowsze</span>
                  {search.sortDate === SortOrder.desc && selectedSortCheckmark}
                </CommandItem>
                <CommandItem
                  onSelect={() => handleSort('sortDate', SortOrder.asc)}
                  className="cursor-pointer flex justify-between"
                >
                  <span>Data dodania: najstarsze</span>
                  {search.sortDate === SortOrder.asc && selectedSortCheckmark}
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
