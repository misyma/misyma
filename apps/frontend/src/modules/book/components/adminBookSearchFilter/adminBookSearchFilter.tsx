import { FC, useMemo, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../common/components/popover/popover';
import { HiOutlineSearchCircle, HiX } from 'react-icons/hi';
import { Button } from '../../../common/components/button/button';
import { DynamicFilter } from '../../../common/components/dynamicFilter/dynamicFilter';
import { FilterProvider } from '../../../common/contexts/filterContext';
import { ReversedLanguages } from '../../../common/constants/languages';
import { FilterOpts } from '../../../common/types/filter';

export const AdminBookSearchFilter: FC = () => {
  const filterOptions = useMemo(
    (): FilterOpts[] => [
      {
        id: 'author-ids-filter',
        key: 'authorIds',
        label: 'Autor',
        type: 'text',
      },
      {
        id: 'isbn-filter',
        key: 'isbn',
        label: 'Isbn',
        type: 'text',
      },
      {
        id: 'language-filter',
        key: 'language',
        label: 'Język',
        type: 'select',
        options: Object.values(ReversedLanguages),
      },
      {
        id: 'is-approved-filter',
        key: 'isApproved',
        label: 'Zaakceptowana',
        type: 'checkbox',
      },
      {
        id: 'release-year-before-filter',
        key: 'releaseYearBefore',
        label: 'Wydana przed',
        type: 'date',
        dateRangeSiblingId: 'release-year-after-filter',
        isAfterFilter: false,
        isBeforeFilter: true,
      },
      {
        id: 'release-year-after-filter',
        key: 'releaseYearAfter',
        label: 'Wydana po',
        type: 'date',
        dateRangeSiblingId: 'release-year-before-filter',
        isAfterFilter: true,
        isBeforeFilter: false,
      },
      {
        id: 'title-filter',
        key: 'title',
        label: 'Tytuł',
        type: 'text',
      },
    ],
    []
  );
  const filtersOrder = useMemo(
    () => ['releaseYearAfter', 'releaseYearBefore'],
    []
  );

  const [open, setOpen] = useState(false);
  return (
    <FilterProvider filterOptions={filterOptions} filtersOrder={filtersOrder}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div>
            <Button variant="default" size="big-icon">
              <HiOutlineSearchCircle className="w-8 h-8"></HiOutlineSearchCircle>
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
