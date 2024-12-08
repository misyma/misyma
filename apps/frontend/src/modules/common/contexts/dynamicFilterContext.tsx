import { createContext, FC, ReactNode, useContext, useState } from 'react';
import { FilterOpts } from '../types/filter';

export type DynamicFilterValues = {
  [filterKey: string]: string | number | boolean | Date | undefined;
};
type DynamicFilterContextType = {
  filters: FilterOpts[];
  filterValues: DynamicFilterValues;
  addFilter: (filter: FilterOpts) => void;
  removeFilter: (key: PropertyKey) => void;
  removeAllFilters: () => void;
  updateFilterValue: (
    id: PropertyKey,
    value: string | boolean | number | Date | undefined
  ) => void;
  filterOptions: FilterOpts[];
  filtersOrder?: string[];
};

const FilterContext = createContext<DynamicFilterContextType | undefined>(
  undefined
);

interface DynamicFilterProviderProps {
  children: ReactNode;
  filterOptions: FilterOpts[];
  initialValues: DynamicFilterValues;
  filtersOrder?: string[];
}

export const DynamicFilterProvider: FC<DynamicFilterProviderProps> = ({
  children,
  filtersOrder,
  filterOptions,
  initialValues,
}) => {
  const [filters, setFilters] = useState<FilterOpts[]>([]);
  const [filterValues, setFilterValues] =
    useState<DynamicFilterValues>(initialValues);

  const addFilter = (filter: FilterOpts) => {
    setFilters((prev) => [...prev, filter]);
  };
  const removeFilter = (key: PropertyKey) => {
    setFilters((prev) => prev.filter((filter) => filter.key !== key));
    setFilterValues((prev) => {
      if (typeof prev[key as string] === 'string') {
        prev[key as string] = '';
        return prev;
      }

      delete prev[key as string];
      return prev;
    });
  };
  const removeAllFilters = () => {
    setFilterValues({});
  };
  const updateFilterValue = (
    key: PropertyKey,
    value: string | boolean | number | Date | undefined
  ) => {
    if (value === undefined) {
      setFilterValues((prev) => {
        delete prev[key as string];
        return prev;
      });
      return;
    }

    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        filterValues,
        addFilter,
        removeFilter,
        removeAllFilters,
        updateFilterValue,
        filterOptions,
        filtersOrder,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useDynamicFilterContext = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error(
      'useDynamicFilterContext must be used within a DynamicFilterProvider'
    );
  }
  return context;
};
