import { FC, useState } from 'react';
import { cn } from '../../../common/lib/utils';
import { FiltersDrawer } from '../../../common/components/filtersDrawer/filtersDrawer';
import { isbnSchema } from '../../../common/schemas/isbnSchema';
import { SearchLanguageSelect } from '../../../common/components/searchLanguageSelect/SearchLanguageSelect';
import {
  SelectFilter,
  TextFilter,
  YearFilter,
} from '../../../common/components/filter/filter';
import { useSelector } from 'react-redux';
import { adminBookFilterStateSelectors } from '../../../core/store/states/adminBookFilterState/adminBookFilterStateSlice';
import { DynamicFilterValues } from '../../../common/contexts/dynamicFilterContext';
import { AuthorSearchFilter } from '../../../common/components/filter/AuthorSearchFilter';

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

  const isFilterVisible = useSelector(
    adminBookFilterStateSelectors.getFilterVisible
  );

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

  return (
    <FiltersDrawer
      onApplyFilters={onApplyFiltersInternal}
      onClearAll={onClearAllInternal}
      className={cn(
        'sm:col-span-4 md:col-span-5 lg:col-span-6 grid grid-cols-3 px-2',
        isFilterVisible ? '' : 'hidden'
      )}
      actionButtonClassName={isFilterVisible ? '' : 'hidden'}
    >
      <TextFilter
        setFilterAction={(val) => {
          setFilters({
            ...filters,
            title: val,
          });
        }}
        initialValue={filters['title'] as string}
        filter={{
          id: 'title-filter',
          key: 'title',
          label: 'Tytuł',
          type: 'text',
          setFilterAction: (val) => {
            setFilters({
              ...filters,
              title: val,
            });
          },
        }}
      />
      <AuthorSearchFilter
        setFilterAction={(val) => {
          setFilters({
            ...filters,
            authorIds: val,
          });
        }}
        initialValue={filters['authorIds'] as string}
        filter={{
          id: 'author-ids-filter',
          key: 'authorIds',
          label: 'Autor',
          type: 'text',
          setFilterAction: (val) => {
            setFilters({
              ...filters,
              authorIds: val,
            });
          },
        }}
      />
      <TextFilter
        setFilterAction={(val) => {
          setFilters({
            ...filters,
            isbn: val,
          });
        }}
        skipValidation={true}
        initialValue={filters['isbn'] as string}
        filter={{
          id: 'isbn-filter',
          key: 'isbn',
          label: 'Isbn',
          type: 'text',
          setFilterAction: (val) => {
            setFilters({
              ...filters,
              isbn: val,
            });
          },
        }}
      />
      <SearchLanguageSelect
        key={`${initialValues['language']}`}
        setFilterAction={(val) => {
          setFilters({
            ...filters,
            language: val,
          });
        }}
        filter={{
          id: 'language-filter',
          key: 'language',
          label: 'Język',
          type: 'text',
          setFilterAction: (val) => {
            setFilters({
              ...filters,
              language: val,
            });
          },
        }}
      />
      <YearFilter
        setFilterAction={(val) => {
          setFilters({
            ...filters,
            releaseYearAfter: val,
          });
        }}
        initialValue={filters['releaseYearAfter'] as string}
        filter={{
          id: 'release-year-after-filter',
          key: 'releaseYearAfter',
          label: 'Wydana po',
          type: 'date',
          dateRangeSiblingId: 'release-year-before-filter',
          isAfterFilter: true,
          isBeforeFilter: false,
          setFilterAction: (val) => {
            setFilters({
              ...filters,
              releaseYearAfter: val,
            });
          },
        }}
      />
      <SelectFilter
        setFilterAction={(val) => {
          setFilters({
            ...filters,
            isApproved: val,
          });
        }}
        initialValue={filters['isApproved'] as string}
        filter={{
          id: 'is-approved-filter',
          key: 'isApproved',
          label: 'Zaakceptowana',
          type: 'select',
          options: ['Zaakceptowana', 'Niezaakceptowana'],
          setFilterAction: (val) => {
            setFilters({
              ...filters,
              isApproved: val,
            });
          },
        }}
      />
    </FiltersDrawer>
  );
};
