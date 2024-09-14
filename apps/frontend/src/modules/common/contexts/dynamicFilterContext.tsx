import { createContext, FC, ReactNode, useContext, useState } from 'react';
import { FilterOpts } from '../types/filter';

type DynamicFilterValues = {
  [filterId: string]: string | boolean | Date | undefined;
};
type DynamicFilterContextType = {
  filters: FilterOpts[];
  filterValues: DynamicFilterValues;
  addFilter: (filter: FilterOpts) => void;
  removeFilter: (id: string) => void;
  updateFilterValue: (
    id: string,
    value: string | boolean | Date | undefined
  ) => void;
  filterOptions: FilterOpts[];
  filtersOrder?: string[];
};

const FilterContext = createContext<DynamicFilterContextType | undefined>(undefined);

interface DynamicFilterProviderProps {
  children: ReactNode;
  filterOptions: FilterOpts[];
  filtersOrder?: string[];
}

export const DynamicFilterProvider: FC<DynamicFilterProviderProps> = ({
  children,
  filtersOrder,
  filterOptions,
}) => {
  const [filters, setFilters] = useState<FilterOpts[]>([]);
  const [filterValues, setFilterValues] = useState<DynamicFilterValues>({});

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

export const useDynamicFilterContext = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error(
      'useDynamicFilterContext must be used within a DynamicFilterProvider'
    );
  }
  return context;
};
