import { createContext, FC, ReactNode, useContext, useState } from 'react';

interface BookTableContext {
  loading: boolean;
  setLoading: (val: boolean) => void;
}

const BookTableContext = createContext<BookTableContext | undefined>(undefined);

export const useBookTableContext = () => {
  const context = useContext(BookTableContext);
  if (context === undefined) {
    throw new Error(
      'useBookTableContext must be used within a BookTableProvider'
    );
  }
  return context;
};

export const BookTableProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState(false);

  return (
    <BookTableContext.Provider value={{ loading, setLoading }}>
      {children}
    </BookTableContext.Provider>
  );
};
