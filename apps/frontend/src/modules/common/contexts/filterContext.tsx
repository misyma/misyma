import React, { createContext, useState, useContext, ReactNode } from 'react';

interface FilterContextType {
  isFilterVisible: boolean;
  toggleFilterVisibility: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const useFilterContext = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilterContext must be used within a FilterProvider');
  }
  return context;
};

export const FilterProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const toggleFilterVisibility = () => {
    setIsFilterVisible((prev) => !prev);
  };

  return (
    <FilterContext.Provider value={{ isFilterVisible, toggleFilterVisibility }}>
      {children}
    </FilterContext.Provider>
  );
};
