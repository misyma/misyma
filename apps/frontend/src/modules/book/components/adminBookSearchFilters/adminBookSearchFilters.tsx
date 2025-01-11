import { type FC, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';

import { AuthorSearchFilter } from '../../../common/components/filter/AuthorSearchFilter';
import { SelectFilter, TextFilter, YearFilter } from '../../../common/components/filter/filter';
import { FiltersDrawer } from '../../../common/components/filtersDrawer/filtersDrawer';
import { SearchLanguageSelect } from '../../../common/components/searchLanguageSelect/SearchLanguageSelect';
import { type DynamicFilterValues } from '../../../common/contexts/dynamicFilterContext';
import { cn } from '../../../common/lib/utils';
import { isbnSchema } from '../../../common/schemas/isbnSchema';
import { adminBookFilterStateSelectors } from '../../../core/store/states/adminBookFilterState/adminBookFilterStateSlice';

interface AdminBookSearchFilterProps {
  onApplyFilters: (filterValues: DynamicFilterValues) => void;
  onClearAll: () => void;
  initialValues: DynamicFilterValues;
}

export const AdminBookSearchFilter: FC<AdminBookSearchFilterProps> = ({
  initialValues,
  onClearAll,
  onApplyFilters,
}) => {
  const [filters, setFilters] = useState(initialValues);

  const isFilterVisible = useSelector(adminBookFilterStateSelectors.getFilterVisible);

  const onApplyFiltersInternal = () => {
    const endFilters = filters;

    if (endFilters['isbn']) {
      const validationResult = isbnSchema.safeParse(endFilters['isbn']);

      if (validationResult.error) {
        delete endFilters['isbn'];
      }
    }

    onApplyFilters(filters);
  };

  const onClearAllInternal = () => {
    onClearAll();

    setFilters({});
  };

  const onClearFilter = useCallback(
    (filterKey: keyof typeof filters) => {
      setFilters({
        ...filters,
        [filterKey]: undefined,
      });
    },
    [filters],
  );

  return (
    <FiltersDrawer
      onApplyFilters={onApplyFiltersInternal}
      onClearAll={onClearAllInternal}
      className={cn('sm:col-span-4 md:col-span-5 lg:col-span-6 grid grid-cols-3 px-2', isFilterVisible ? '' : 'hidden')}
      actionButtonClassName={isFilterVisible ? '' : 'hidden'}
      open={!!isFilterVisible}
    >
      <AuthorSearchFilter
        setFilterAction={(val) => {
          setFilters({
            ...filters,
            authorIds: val,
          });
        }}
        onRemoveFilter={() => onClearFilter('authorIds')}
        initialValue={filters['authorIds'] as string}
        filter={{
          id: 'author-ids-filter',
          key: 'authorIds',
          label: 'Autor',
          type: 'text',
        }}
      />
      <TextFilter
        setFilterAction={(val) => {
          setFilters({
            ...filters,
            isbn: val,
          });
        }}
        onRemoveFilter={() => onClearFilter('isbn')}
        skipValidation={true}
        initialValue={filters['isbn'] as string}
        filter={{
          id: 'isbn-filter',
          key: 'isbn',
          label: 'Isbn',
          type: 'text',
        }}
      />
      <SearchLanguageSelect
        key={`${filters['language']}`}
        setFilterAction={(val) => {
          setFilters({
            ...filters,
            language: val,
          });
        }}
        initialValue={filters['language'] as string}
        onRemoveFilter={() => onClearFilter('language')}
        filter={{
          id: 'language-filter',
          key: 'language',
          label: 'Język',
          type: 'text',
        }}
      />
      <YearFilter
        setFilterAction={(val) => {
          setFilters({
            ...filters,
            releaseYearAfter: val,
          });
        }}
        onRemoveFilter={() => onClearFilter('releaseYearAfter')}
        initialValue={filters['releaseYearAfter'] as string}
        filter={{
          id: 'release-year-after-filter',
          key: 'releaseYearAfter',
          label: 'Wydana po',
          type: 'date',
          dateRangeSiblingId: 'release-year-before-filter',
          isAfterFilter: true,
          isBeforeFilter: false,
        }}
      />
      <SelectFilter
        setFilterAction={(val) => {
          setFilters({
            ...filters,
            isApproved: val,
          });
        }}
        onRemoveFilter={() => onClearFilter('isApproved')}
        initialValue={filters['isApproved'] as string}
        filter={{
          id: 'is-approved-filter',
          key: 'isApproved',
          label: 'Zaakceptowana',
          type: 'select',
          options: ['Zaakceptowana', 'Niezaakceptowana'],
        }}
      />
    </FiltersDrawer>
  );
};
