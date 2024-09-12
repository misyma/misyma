import { FC, useMemo, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../common/components/popover/popover';
import { HiOutlineSearchCircle, HiX } from 'react-icons/hi';
import { Button } from '../../../common/components/button/button';
import { DynamicFilter } from '../../../common/components/dynamicFilter/dynamicFilter';
import {
  FilterOptions,
  FilterProvider,
} from '../../../common/contexts/filterContext';
import { ReversedLanguages } from '../../../common/constants/languages';

export const AdminBookSearchFilter: FC = () => {
  const filterOptions = useMemo(
    (): FilterOptions[] => [
      {
        key: 'authorIds',
        label: 'Autor',
        type: 'text',
      },
      {
        key: 'isbn',
        label: 'Isbn',
        type: 'text',
      },
      {
        key: 'language',
        label: 'Język',
        type: 'select',
        options: Object.values(ReversedLanguages),
      },
      {
        key: 'isApproved',
        label: 'Zaakceptowana',
        type: 'checkbox',
      },
      {
        key: 'releaseYearBefore',
        label: 'Wydana przed',
        type: 'text',
      },
      {
        key: 'releaseYearAfter',
        label: 'Wydana po',
        type: 'text',
      },
      {
        key: 'title',
        label: 'Tytuł',
        type: 'text',
      },
    ],
    []
  );

  const [open, setOpen] = useState(false);
  return (
    <FilterProvider filterOptions={filterOptions}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div>
            <Button variant="outline" size="icon">
              <HiOutlineSearchCircle></HiOutlineSearchCircle>
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[40rem]"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div className="p-2 flex flex-col gap-4">
            <div className="flex w-full items-center justify-end">
              <HiX
                onClick={() => setOpen(false)}
                className="cursor-pointer h-6 w-6"
              ></HiX>
            </div>
            <div>
              <DynamicFilter></DynamicFilter>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </FilterProvider>
  );
};
