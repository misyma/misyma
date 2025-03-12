import { useNavigate, useSearch } from '@tanstack/react-router';
import { Check } from 'lucide-react';
import { type FC, useState } from 'react';
import { HiBarsArrowDown } from 'react-icons/hi2';

import { SortOrder } from '@common/contracts';

import { Button } from '../../../common/components/button/button';
import { Command, CommandItem, CommandList } from '../../../common/components/command/command';
import { Popover, PopoverContent, PopoverTrigger } from '../../../common/components/popover/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../common/components/tooltip/tooltip';

interface Props {
  from: '/shelves/bookshelf/book/$bookId' | '/quotes';
}
export const QuotationsTabSortingButton: FC<Props> = ({ from }) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const navigate = useNavigate({ from });

  const search = useSearch({ strict: false });

  const handleSort = (sortField: string, sortOrder: string) => {
    setPopoverOpen(false);

    navigate({
      search: {
        ...search,
        [sortField]: sortOrder,
      },
    });
    setTimeout(() => {
      setTooltipOpen(false);
    }, 100);
  };

  const selectedSortCheckmark = <Check className="h-4 w-4" />;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip
        open={tooltipOpen}
        onOpenChange={setTooltipOpen}
      >
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
            onCloseAutoFocus={(e) => e.preventDefault()}
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
