import { createContext, FC, ReactNode, useContext, useState } from 'react';
import { FilterOpts, FilterTypes } from '../types/filter';

type FilterValues = {
  [filterId: string]: string | boolean;
};
type FilterContextType = {
  filters: FilterOpts[];
  filterValues: FilterValues;
  addFilter: (filter: FilterOpts) => void;
  removeFilter: (id: string) => void;
  updateFilterValue: (id: string, value: string | boolean) => void;
  allowedValues: FilterOptions[];
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

interface BaseFilterOptions {
  key: PropertyKey;
  label: string;
  type: FilterTypes;
}

interface TextFilterOptions extends BaseFilterOptions {
  type: 'text';
}

interface CheckboxFilterOptions extends BaseFilterOptions {
  type: 'checkbox';
}

interface SelectFilterOptions extends BaseFilterOptions {
  key: PropertyKey;
  label: string;
  type: 'select';
  options: string[];
  multiSelect?: boolean;
}

export type FilterOptions = TextFilterOptions | CheckboxFilterOptions | SelectFilterOptions;

interface FilterProviderProps {
  children: ReactNode;
  filterOptions: FilterOptions[];
}

export const FilterProvider: FC<FilterProviderProps> = ({
  children,
  filterOptions: allowedValues,
}) => {
  const [filters, setFilters] = useState<FilterOpts[]>([]);
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  const addFilter = (filter: FilterOpts) => {
    setFilters((prev) => [...prev, filter]);
  };
  const removeFilter = (id: string) => {
    setFilters((prev) => prev.filter((filter) => filter.id !== id));
  };
  const updateFilterValue = (id: string, value: string | boolean) => {
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
        allowedValues,
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
