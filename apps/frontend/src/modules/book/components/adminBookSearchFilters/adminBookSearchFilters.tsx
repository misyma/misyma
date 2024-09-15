import { FC, useCallback, useMemo, useState } from 'react';
import {
  Popover,
  PopoverTrigger,
} from '../../../common/components/popover/popover';
import { Button } from '../../../common/components/button/button';
import {
  DynamicFilterProvider,
  DynamicFilterValues,
  useDynamicFilterContext,
} from '../../../common/contexts/dynamicFilterContext';
import { FilterComponentProps, FilterOpts } from '../../../common/types/filter';
import { AuthorSearchSelector } from '../../../auth/components/authorSearchSelector/authorSearchSelector';
import { cn } from '../../../common/lib/utils';
import { ChevronsUpDown } from 'lucide-react';
import { useFindAuthorsQuery } from '../../../author/api/user/queries/findAuthorsQuery/findAuthorsQuery';
import { LoadingSpinner } from '../../../common/components/spinner/loading-spinner';
import { FiltersDrawer } from '../../../common/components/filtersDrawer/filtersDrawer';
import { useFilterContext } from '../../../common/contexts/filterContext';
import { FilterContainer } from '../../../common/components/filter/filterContainer';
import LanguageSelect from '../languageSelect/languageSelect';
import { isbnSchema } from '../../../common/schemas/isbnSchema';

const CustomAuthorSearchFilter: FC<FilterComponentProps> = ({ filter }) => {
  const { updateFilterValue, filterValues } = useDynamicFilterContext();
  const [selectedAuthorName, setSelectedAuthorName] = useState('');

  const handleChange = (
    value: string | boolean | Date | undefined,
    authorName: string
  ) => {
    updateFilterValue(filter.key, value);
    setSelectedAuthorName(authorName);
  };
  const [open, setOpen] = useState(false);

  const currentAuthorId = filterValues[filter.key as string];

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
    <FilterContainer
      filter={filter}
      slot={
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
                'w-full truncate'
              )}
            >
              <div className="flex-1 min-w-0 max-w-full">
                {' '}
                <div className="flex items-center w-full overflow-hidden">
                  {!currentAuthorId && (
                    <span className="text-muted-foreground">
                      Wyszukaj autora
                    </span>
                  )}
                  {currentAuthorId && isFetchingCurrentAuthor && (
                    <LoadingSpinner size={20} />
                  )}
                  {currentAuthorId && !isFetchingCurrentAuthor && (
                    <span className="block truncate">{getAuthorName()}</span>
                  )}
                </div>
              </div>{' '}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <AuthorSearchSelector
            className="w-48 sm:w-48"
            onCreateAuthorDraft={() => {}}
            includeAuthorCreation={false}
            onSelect={handleChange}
            createAuthorDialogVisible={open}
            setAuthorSelectOpen={setOpen}
          />
        </Popover>
      }
    ></FilterContainer>
  );
};

const SearchLanguageSelect: FC<FilterComponentProps> = ({ filter }) => {
  const { updateFilterValue, filterValues } = useDynamicFilterContext();

  const handleChange = (value: string | boolean | Date | undefined) => {
    updateFilterValue(filter.key, value);
  };

  const filterValue = filterValues[filter.key as string];

  return (
    <FilterContainer
      filter={filter}
      slot={
        <LanguageSelect
          className="w-full sm:w-full"
          type="free"
          selectorValue={filterValue as string}
          onValueChange={handleChange}
        />
      }
    ></FilterContainer>
  );
};

interface AdminBookSearchFilterProps {
  onApplyFilters: (filterValues: DynamicFilterValues) => void;
  initialValues: DynamicFilterValues;
}

export const AdminBookSearchFilter: FC<AdminBookSearchFilterProps> = ({
  initialValues,
  onApplyFilters,
}) => {
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
        schema: isbnSchema,
      },
      {
        id: 'language-filter',
        key: 'language',
        label: 'Język',
        type: 'text',
        customSlot: SearchLanguageSelect,
      },
      {
        id: 'is-approved-filter',
        key: 'isApproved',
        label: 'Zaakceptowana',
        type: 'three-state-checkbox',
      },
      {
        id: 'release-year-after-filter',
        key: 'releaseYearAfter',
        label: 'Wydana po',
        type: 'year',
        dateRangeSiblingId: 'release-year-before-filter',
        isAfterFilter: true,
        isBeforeFilter: false,
      },
      {
        id: 'release-year-before-filter',
        key: 'releaseYearBefore',
        label: 'Wydana przed',
        type: 'year',
        dateRangeSiblingId: 'release-year-after-filter',
        isAfterFilter: false,
        isBeforeFilter: true,
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
  const { isFilterVisible } = useFilterContext();

  return (
    <DynamicFilterProvider
      initialValues={initialValues}
      filterOptions={filterOptions}
    >
      <FiltersDrawer
        onApplyFilters={onApplyFilters}
        className={isFilterVisible ? '' : 'hidden'}
      />
    </DynamicFilterProvider>
  );
};
