import { useNavigate, useSearch } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { z } from 'zod';

import { Language, languages, ReadingStatus, readingStatuses } from '@common/contracts';

import { AuthorSearchFilter } from '../../../../common/components/filter/AuthorSearchFilter';
import {
  CheckboxFilter,
  CategorySelectFilter,
  MyBooksStatusFilter,
  YearRangeFilter,
} from '../../../../common/components/filter/filter';
import FiltersDrawer from '../../../../common/components/filtersDrawer/filtersDrawer';
import { SearchLanguageSelect } from '../../../../common/components/searchLanguageSelect/SearchLanguageSelect';
import { myBooksStateSelectors } from '../../../../core/store/states/myBooksFilterState/myBooksFilterStateSlice';

export const myBooksSearchParamsSchema = z
  .object({
    title: z.string().min(3).catch('').optional(),
    language: z
      .nativeEnum(languages)
      .optional()
      .catch('' as Language),
    category: z.string().optional().catch(''),
    status: z
      .nativeEnum(readingStatuses)
      .optional()
      .catch('' as ReadingStatus),
    releaseYearBefore: z.number().int().min(1900).optional().catch(undefined),
    releaseYearAfter: z.number().int().min(1900).optional().catch(undefined),
    authorId: z.string().uuid().optional().catch(''),
    isFavorite: z.boolean().or(z.literal('')).optional().catch(''),
    sortField: z.enum(['createdAt', 'releaseYear', 'rating', 'readingDate', '']).optional().catch(''),
    sortOrder: z.enum(['asc', 'desc', '']).optional().catch(''),
  })
  .superRefine((args, ctx) => {
    if (args.releaseYearAfter && args.releaseYearBefore && args.releaseYearAfter > args.releaseYearBefore) {
      ctx.addIssue({
        code: 'custom',
        message: 'Lata wydania są niepoprawne',
        path: ['releaseYearAfter'],
      });
    }
  });

export type MyBookSearchParams = z.infer<typeof myBooksSearchParamsSchema>;

export const BookPageFiltersBar = () => {
  const navigate = useNavigate();
  const search = useSearch({
    from: '/mybooks/',
  }) as MyBookSearchParams;

  const isFilterVisible = useSelector(myBooksStateSelectors.getFilterVisibility);

  const updateSearch = (updates: Partial<typeof search>) => {
    navigate({
      to: '',
      search: (current: Record<string, string>) => ({
        ...current,
        ...updates,
      }),
    });
  };

  const onClearAll = () => {
    navigate({
      to: '',
      search: ({ title, sortField, sortOrder }: Record<string, string>) => ({
        title,
        sortField,
        sortOrder,
      }),
    });
  };

  const hasAnyFilter = useMemo(() => Object.values(search).filter((val) => val !== undefined).length > 0, [search]);

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
      <SearchLanguageSelect
        key={search.language}
        onRemoveFilter={() => updateSearch({ language: undefined })}
        initialValue={search.language}
        setFilterAction={(val) => updateSearch({ language: val })}
        filter={{
          id: 'language-filter',
          key: 'language',
          label: 'Język',
          type: 'text',
        }}
      />
      <CategorySelectFilter
        initialValue={search.category}
        onRemoveFilter={() => updateSearch({ category: undefined })}
        setFilterAction={(val) => updateSearch({ category: val })}
        filter={{
          id: 'category-filter',
          key: 'categoryFilter',
          label: 'Kategoria',
          type: 'text',
        }}
      />
      <MyBooksStatusFilter
        initialValue={search.status}
        onRemoveFilter={() => updateSearch({ status: undefined })}
        setFilterAction={(val) => updateSearch({ status: val })}
        filter={{
          id: 'status-filter',
          type: 'text',
          label: 'Status',
          key: 'statusFilter',
        }}
      />
      <YearRangeFilter
        filter={{
          label: 'Wydana między',
        }}
        onRemoveFilter={() =>
          updateSearch({
            releaseYearBefore: undefined,
            releaseYearAfter: undefined,
          })
        }
        setFilterAction={([after, before]) =>
          updateSearch({
            releaseYearAfter: after ?? undefined,
            releaseYearBefore: before ?? undefined,
          })
        }
        initialValue={
          search.releaseYearAfter ? [search.releaseYearAfter, search.releaseYearBefore ?? null] : [null, null]
        }
      />
      <CheckboxFilter
        initialValue={search.isFavorite === '' ? false : search.isFavorite}
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
