import { createContext, FC, ReactNode, useContext, useState } from 'react';
import { FilterOpts } from '../types/filter';

type FilterValues = {
  [filterId: string]: string | boolean | Date | undefined;
};
type FilterContextType = {
  filters: FilterOpts[];
  filterValues: FilterValues;
  addFilter: (filter: FilterOpts) => void;
  removeFilter: (id: string) => void;
  updateFilterValue: (
    id: string,
    value: string | boolean | Date | undefined
  ) => void;
  filterOptions: FilterOpts[];
  filtersOrder?: string[];
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

interface FilterProviderProps {
  children: ReactNode;
  filterOptions: FilterOpts[];
  filtersOrder?: string[];
}

export const FilterProvider: FC<FilterProviderProps> = ({
  children,
  filtersOrder,
  filterOptions,
}) => {
  const [filters, setFilters] = useState<FilterOpts[]>([]);
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  const addFilter = (filter: FilterOpts) => {
    setFilters((prev) => [...prev, filter]);
  };
  const removeFilter = (id: string) => {
    setFilters((prev) => prev.filter((filter) => filter.id !== id));
    setFilterValues((prev) => {
      delete prev[id];
      return prev;
    });
  };
  const updateFilterValue = (
    id: string,
    value: string | boolean | Date | undefined
  ) => {
    setFilterValues((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        filterValues,
        addFilter,
        removeFilter,
        updateFilterValue,
        filterOptions,
        filtersOrder,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilterContext = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilterContext must be used within a FilterProvider');
  }
  return context;
};
