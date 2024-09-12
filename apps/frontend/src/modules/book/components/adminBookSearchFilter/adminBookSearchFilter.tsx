import { FC, useCallback, useMemo, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../common/components/popover/popover';
import { HiOutlineSearchCircle, HiX } from 'react-icons/hi';
import { Button } from '../../../common/components/button/button';
import { DynamicFilter } from '../../../common/components/dynamicFilter/dynamicFilter';
import {
  FilterProvider,
  useFilterContext,
} from '../../../common/contexts/filterContext';
import { ReversedLanguages } from '../../../common/constants/languages';
import { FilterComponentProps, FilterOpts } from '../../../common/types/filter';
import { AuthorSearchSelector } from '../../../auth/components/authorSearchSelector/authorSearchSelector';
import { cn } from '../../../common/lib/utils';
import { ChevronsUpDown } from 'lucide-react';
import { useFindAuthorsQuery } from '../../../author/api/user/queries/findAuthorsQuery/findAuthorsQuery';
import { LoadingSpinner } from '../../../common/components/spinner/loading-spinner';
import { RemoveFilterButton } from '../../../common/components/filter/removeFilterButton';

const CustomAuthorSearchFilter: FC<FilterComponentProps> = ({ filter }) => {
  const { updateFilterValue, filterValues } = useFilterContext();
  const [selectedAuthorName, setSelectedAuthorName] = useState('');

  const handleChange = (
    value: string | boolean | Date | undefined,
    authorName: string
  ) => {
    updateFilterValue(filter.id, value);
    setSelectedAuthorName(authorName);
  };
  const [open, setOpen] = useState(false);

  const currentAuthorId = useMemo(
    () => filterValues[filter.id],
    [filterValues, filter.id]
  );

  const { data: currentAuthor, isFetching: isFetchingCurrentAuthor } =
    useFindAuthorsQuery({
      ids: currentAuthorId ? [currentAuthorId as string] : [],
    });

  const getAuthorName = useCallback(() => {
    if (currentAuthor) {
      return currentAuthor.data[0].name;
    }

    if (selectedAuthorName) {
      return selectedAuthorName;
    }

    return 'Wyszukaj autora';
  }, [currentAuthor, selectedAuthorName]);

  return (
    // todo: make a template with a slot for filter content :)
    <div className="flex items-center w-full justify-between space-x-4">
      <label>{filter.label}</label>
      <div className="flex gap-2 items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="link"
              role="combobox"
              size="custom"
              className={cn(
                'justify-between bg-[#D1D5DB]/20',
                !currentAuthorId && 'text-muted-foreground',
                'border h-12',
                'w-48 sm:w-72'
              )}
              style={{
                height: '3rem',
              }}
            >
              <p
                className={cn(
                  !currentAuthorId && 'text-muted-foreground',
                  'w-full text-start px-3 py-2'
                )}
              >
                {!currentAuthorId && 'Wyszukaj autora'}
                {currentAuthorId && isFetchingCurrentAuthor && (
                  <LoadingSpinner size={20} />
                )}
                {currentAuthorId && !isFetchingCurrentAuthor
                  ? getAuthorName()
                  : ''}
              </p>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <AuthorSearchSelector
            onCreateAuthorDraft={() => {}}
            includeAuthorCreation={false}
            onSelect={handleChange}
            createAuthorDialogVisible={open}
            setAuthorSelectOpen={setOpen}
          />
        </Popover>
        <RemoveFilterButton filterId={filter.id} />
      </div>
    </div>
  );
};

export const AdminBookSearchFilter: FC = () => {
  const filterOptions = useMemo(
    (): FilterOpts[] => [
      {
        id: 'author-ids-filter',
        key: 'authorIds',
        label: 'Autor',
        type: 'text',
        customSlot: CustomAuthorSearchFilter,
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
