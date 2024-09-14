import { FC, useCallback, useMemo, useState } from 'react';
import {
  Popover,
  PopoverTrigger,
} from '../../../common/components/popover/popover';
import { Button } from '../../../common/components/button/button';
import {
  DynamicFilterProvider,
  useDynamicFilterContext,
} from '../../../common/contexts/dynamicFilterContext';
import { ReversedLanguages } from '../../../common/constants/languages';
import { FilterComponentProps, FilterOpts } from '../../../common/types/filter';
import { AuthorSearchSelector } from '../../../auth/components/authorSearchSelector/authorSearchSelector';
import { cn } from '../../../common/lib/utils';
import { ChevronsUpDown } from 'lucide-react';
import { useFindAuthorsQuery } from '../../../author/api/user/queries/findAuthorsQuery/findAuthorsQuery';
import { LoadingSpinner } from '../../../common/components/spinner/loading-spinner';
import { FiltersDrawer } from '../../../common/components/filtersDrawer/filtersDrawer';
import { useFilterContext } from '../../../common/contexts/filterContext';
import { FilterContainer } from '../../../common/components/filter/filterContainer';

const CustomAuthorSearchFilter: FC<FilterComponentProps> = ({ filter }) => {
  const { updateFilterValue, filterValues } = useDynamicFilterContext();
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
                'w-48 sm:w-48'
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
      }
    ></FilterContainer>
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
        id: 'release-year-after-filter',
        key: 'releaseYearAfter',
        label: 'Wydana po',
        type: 'date',
        dateRangeSiblingId: 'release-year-before-filter',
        isAfterFilter: true,
        isBeforeFilter: false,
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
  const { isFilterVisible } = useFilterContext();

  return (
    <DynamicFilterProvider
      filterOptions={filterOptions}
      filtersOrder={filtersOrder}
    >
      <FiltersDrawer className={isFilterVisible ? '' : 'hidden'} />
    </DynamicFilterProvider>
  );
};
