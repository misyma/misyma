import { useSearch, useNavigate } from '@tanstack/react-router';
import { type FC } from 'react';
import { useSelector } from 'react-redux';
import { type z } from 'zod';

import { type AdminRouteSearchSchema } from '../../../../routes/admin/tabs/books';
import { AuthorSearchFilter } from '../../../common/components/filter/AuthorSearchFilter';
import { SelectFilter, TextFilter, YearFilter } from '../../../common/components/filter/filter';
import { FiltersDrawer } from '../../../common/components/filtersDrawer/filtersDrawer';
import { SearchLanguageSelect } from '../../../common/components/searchLanguageSelect/SearchLanguageSelect';
import { type DynamicFilterValues } from '../../../common/contexts/dynamicFilterContext';
import { cn } from '../../../common/lib/utils';
import { adminBookFilterStateSelectors } from '../../../core/store/states/adminBookFilterState/adminBookFilterStateSlice';

interface AdminBookSearchFilterProps {
  onApplyFilters: (filterValues: DynamicFilterValues) => void;
  onClearAll: () => void;
}

export const AdminBookSearchFilter: FC<AdminBookSearchFilterProps> = ({ onClearAll }) => {
  const navigate = useNavigate({ from: '/admin/tabs/books/' });

  const isFilterVisible = useSelector(adminBookFilterStateSelectors.getFilterVisible);

  const search = useSearch({ from: '/admin/tabs/books/' }) as z.infer<typeof AdminRouteSearchSchema>;

  const updateSearch = (updates: Partial<typeof search>) => {
    navigate({
      to: '',
      search: (current: Record<string, string>) => ({
        ...current,
        ...updates,
        page: 1,
      }),
    });
  };

  const onClearAllInternal = () => {
    onClearAll();
  };

  const onClearFilter = (key: string) => {
    updateSearch({
      [key]: undefined,
      page: 1,
    });
  };

  return (
    <FiltersDrawer
      omitApplyButton
      onApplyFilters={() => {}}
      onClearAll={onClearAllInternal}
      className={cn('sm:col-span-4 md:col-span-5 lg:col-span-6 grid grid-cols-3 px-2', isFilterVisible ? '' : 'hidden')}
      actionButtonClassName={isFilterVisible ? '' : 'hidden'}
      open={!!isFilterVisible}
    >
      <AuthorSearchFilter
        setFilterAction={(val) => {
          updateSearch({
            authorIds: val,
          });
        }}
        onRemoveFilter={() => onClearFilter('authorIds')}
        initialValue={search.authorIds as string}
        filter={{
          id: 'author-ids-filter',
          key: 'authorIds',
          label: 'Autor',
          type: 'text',
        }}
      />
      <TextFilter
        setFilterAction={(val) => {
          updateSearch({
            isbn: val,
          });
        }}
        onRemoveFilter={() => onClearFilter('isbn')}
        skipValidation={true}
        initialValue={search.isbn as string}
        filter={{
          id: 'isbn-filter',
          key: 'isbn',
          label: 'Isbn',
          type: 'text',
        }}
      />
      <SearchLanguageSelect
        key={`${search.language}`}
        setFilterAction={(val) => {
          updateSearch({
            language: val,
          });
        }}
        initialValue={search.language as string}
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
          updateSearch({
            releaseYearAfter: val,
          });
        }}
        onRemoveFilter={() => onClearFilter('releaseYearAfter')}
        initialValue={`${search?.releaseYearAfter}` as string}
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
          updateSearch({
            isApproved: val === 'Zaakceptowana' ? true : val === 'Niezaakceptowana' ? false : undefined,
          });
        }}
        onRemoveFilter={() => onClearFilter('isApproved')}
        initialValue={
          search.isApproved === true ? 'Zaakceptowana' : search.isApproved === false ? 'Niezaakceptowana' : ''
        }
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
