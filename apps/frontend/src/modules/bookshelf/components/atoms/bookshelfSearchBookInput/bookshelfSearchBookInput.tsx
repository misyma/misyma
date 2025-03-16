import { useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Input } from '../../../../common/components/input/input';
import useDebounce from '../../../../common/hooks/useDebounce';
import { type BookshelfBooksSearchParams } from '../../organisms/bookshelfBooksFiltersBar/bookshelfBooksFiltersBar';

export const BookshelfSearchButtonInput = () => {
  const { title } = useSearch({ from: '/shelves/bookshelf/$bookshelfId' }) as BookshelfBooksSearchParams;
  const [value, setValue] = useState(title);

  const navigate = useNavigate();

  const debouncedValue = useDebounce(value, 300);

  useEffect(() => {
    navigate({
      to: '',
      search: {
        title: debouncedValue,
      },
    });
  }, [debouncedValue, navigate]);

  return (
    <Input
      containerClassName="p-0 h-10"
      iSize="lg"
      placeholder="Wyszukaj książkę"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-full h-10"
    />
  );
};
