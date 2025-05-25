import { useNavigate, useSearch } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { type QuotePageSearch } from '../../../../../routes/quotes';
import { AuthorSearchFilter } from '../../../../common/components/filter/AuthorSearchFilter';
import { BookSearchFilter } from '../../../../common/components/filter/bookSearchFilter';
import { CheckboxFilter } from '../../../../common/components/filter/filter';
import FiltersDrawer from '../../../../common/components/filtersDrawer/filtersDrawer';
import { quoteStateSelectors } from '../../../../core/store/states/quotesFilterState/quoteFilterStateSlice';

export const QuotesPageFilterBar = () => {
  const navigate = useNavigate();

  const isFilterVisible = useSelector(quoteStateSelectors.getFilterVisibility);

  const search = useSearch({
    from: '/quotes/',
  }) as QuotePageSearch;

  const updateSearch = (updates: Partial<typeof search>) => {
    navigate({
      to: '',
      search: (current) => ({
        ...current,
        ...updates,
      }),
    });
  };

  const onClearAll = () => {
    navigate({
      to: '',
      search: ({ sortDate, content }) => ({
        sortDate,
        content,
      }),
    });
  };

  const hasAnyFilter = useMemo(
    () =>
      Object.entries(search).filter(([key, val]) => val !== undefined && !['sortDate', 'content'].includes(key))
        .length > 0,
    [search],
  );

  return (
    <FiltersDrawer
      omitApplyButton
      showClearButton={hasAnyFilter}
      className="grid grid-cols-3"
      onClearAll={onClearAll}
      open={isFilterVisible}
      onApplyFilters={() => {}}
    >
      <AuthorSearchFilter
        setFilterAction={(val) => updateSearch({ authorId: val })}
        onRemoveFilter={() => updateSearch({ authorId: undefined })}
        initialValue={search.authorId}
        filter={{
          id: 'author-ids-filter',
          key: 'authorIds',
          label: 'Autor',
          type: 'text',
        }}
      />
      <BookSearchFilter
        initialValue={search.userBookId}
        filter={{
          id: 'book-id-filter',
          key: 'bookId',
          label: 'Książka',
          type: 'text',
        }}
        onRemoveFilter={() => updateSearch({ userBookId: undefined })}
        setFilterAction={(val) => updateSearch({ userBookId: val })}
      />
      <CheckboxFilter
        initialValue={(search.isFavorite as unknown as string) === '' ? false : search.isFavorite}
        onRemoveFilter={() => updateSearch({ isFavorite: undefined })}
        setFilterAction={(val) => updateSearch({ isFavorite: val })}
        filter={{
          id: 'is-favorite-filter',
          key: 'isFavorite',
          label: 'Ulubiona',
          type: 'three-state-checkbox',
        }}
      />
    </FiltersDrawer>
  );
};
