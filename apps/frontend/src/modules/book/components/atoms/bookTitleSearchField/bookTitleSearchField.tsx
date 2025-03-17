import { useNavigate, useSearch } from '@tanstack/react-router';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '../../../../common/components/button/button';
import { Input } from '../../../../common/components/input/input';
import useDebounce from '../../../../common/hooks/useDebounce';
import { type MyBookSearchParams } from '../../organisms/bookPageFiltersBar/bookPageFiltersBar';

export const TitleSearchField = () => {
  const search = useSearch({
    from: '/mybooks/',
  }) as MyBookSearchParams;

  const navigate = useNavigate();

  const [searchedName, setSearchedName] = useState<string | undefined>(search.title);

  const debouncedSearchedName = useDebounce(searchedName, 300);

  useEffect(() => {
    navigate({
      to: '',
      search: (prev) => ({ ...prev, title: debouncedSearchedName }),
    });
  }, [debouncedSearchedName, navigate]);

  const removeFiler = () => {
    setSearchedName(undefined);

    navigate({
      to: '',
      // Purposeful :)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      search: ({ title, ...rest }) => rest,
    });
  };

  return (
    <div className="relative pl-4 flex flex-col gap-2">
      <Input
        onChange={(e) => {
          setSearchedName(e.target.value);
        }}
        value={searchedName ?? ''}
        className=""
        placeholder="Wyszukaj po tytule..."
      />
      {debouncedSearchedName && (
        <Button
          variant="ghost"
          size="icon"
          className="w-6 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer hover:bg-transparent p-0 h-auto"
          onClick={removeFiler}
        >
          <X className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};
