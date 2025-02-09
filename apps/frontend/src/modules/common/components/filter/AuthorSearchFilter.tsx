import { ChevronDown } from 'lucide-react';
import { type FC, useCallback, useEffect, useState } from 'react';

import { FilterContainer } from './filterContainer';
import { AuthorSearchSelector } from '../../../auth/components/authorSearchSelector/authorSearchSelector';
import { useFindAuthorsQuery } from '../../../author/api/user/queries/findAuthorsQuery/findAuthorsQuery';
import { cn } from '../../lib/utils';
import { type FilterComponentProps } from '../../types/filter';
import { Button } from '../button/button';
import { Popover, PopoverTrigger } from '../popover/popover';
import { LoadingSpinner } from '../spinner/loading-spinner';

export const AuthorSearchFilter: FC<FilterComponentProps> = ({
  filter,
  initialValue,
  setFilterAction,
  onRemoveFilter,
}) => {
  const [selectedAuthorName, setSelectedAuthorName] = useState('');

  const handleChange = (value: string | boolean | Date | undefined, authorName: string) => {
    console.log(value);
    setSelectedAuthorName(authorName);

    setFilterAction(value);
  };

  const [open, setOpen] = useState(false);

  const { data: currentAuthor, isFetching: isFetchingCurrentAuthor } = useFindAuthorsQuery({
    ids: initialValue ? [initialValue as string] : [],
  });

  const getAuthorName = useCallback(() => {
    if (currentAuthor) {
      if (selectedAuthorName === '') {
        setSelectedAuthorName(currentAuthor.data[0].name);
      }
      return currentAuthor.data[0].name;
    }

    if (selectedAuthorName) {
      return selectedAuthorName;
    }

    return 'Wyszukaj autora';
  }, [currentAuthor, selectedAuthorName]);

  const onRemoveFilterInternal = () => {
    if (onRemoveFilter) {
      onRemoveFilter();
    }

    setSelectedAuthorName('');
  };

  useEffect(() => {
    if (!initialValue && selectedAuthorName) {
      setSelectedAuthorName('');
    }
  }, [initialValue, selectedAuthorName]);

  return (
    <FilterContainer
      filter={filter}
      hasValue={!!selectedAuthorName}
      onRemoveFilter={onRemoveFilter ? onRemoveFilterInternal : undefined}
      slot={
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="link"
              role="combobox"
              size="custom"
              className={cn(
                'justify-between bg-[#D1D5DB]/20',
                !initialValue && 'text-muted-foreground',
                'border h-12',
                'w-full sm:w-full truncate',
              )}
            >
              <div className="flex-1 min-w-0 max-w-full">
                {' '}
                <div className="flex items-center w-full overflow-hidden">
                  {!initialValue && <span className="px-3 text-muted-foreground text-sm">Wyszukaj autora</span>}
                  {initialValue && isFetchingCurrentAuthor && (
                    <div className="px-2">
                      <LoadingSpinner size={20} />
                    </div>
                  )}
                  {initialValue && !isFetchingCurrentAuthor && (
                    <span className="block truncate px-3 text-sm font-normal text-foreground">{getAuthorName()}</span>
                  )}
                </div>
              </div>{' '}
              <div className="pr-3">
                <ChevronDown className="h-8 w-8 text-primary" />
              </div>
            </Button>
          </PopoverTrigger>
          <AuthorSearchSelector
            className="w-96 sm:w-96"
            onCreateAuthorDraft={() => {}}
            includeAuthorCreation={false}
            onSelect={handleChange}
            createAuthorDialogVisible={open}
            setAuthorSelectOpen={setOpen}
          />
        </Popover>
      }
    ></FilterContainer>
  );
};
