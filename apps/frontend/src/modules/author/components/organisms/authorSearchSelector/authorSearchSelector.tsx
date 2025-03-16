import { zodResolver } from '@hookform/resolvers/zod';
import { CommandLoading } from 'cmdk';
import { Check } from 'lucide-react';
import { type FC, Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { type z } from 'zod';

import { Button } from '../../../../common/components/button/button';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../../../common/components/command/command';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../../common/components/dialog/dialog';
import { DialogPopoverContent, PopoverContent } from '../../../../common/components/popover/popover';
import useDebounce from '../../../../common/hooks/useDebounce';
import { cn } from '../../../../common/lib/utils';
import { useFindAuthorsQuery } from '../../../api/user/queries/findAuthorsQuery/findAuthorsQuery';
import { createAuthorDraftSchema } from '../../../schemas/createAuthorDraftSchema';
import { CreateAuthorDraftForm } from '../createAuthorDraftForm';

interface AuthorSearchSelectorProps {
  onSelect: (authorId: string, authorName: string) => void;
  className?: string;
  currentlySelectedAuthorId?: string;
  createAuthorDialogVisible: boolean;
  setAuthorSelectOpen: (val: boolean) => void;
  onCreateAuthorDraft: (payload: z.infer<typeof createAuthorDraftSchema>) => void;
  includeAuthorCreation: boolean;
  searchedName?: string;
  dialog?: boolean;
}

export const AuthorSearchSelector: FC<AuthorSearchSelectorProps> = ({
  className,
  onSelect,
  setAuthorSelectOpen,
  onCreateAuthorDraft,
  currentlySelectedAuthorId,
  createAuthorDialogVisible,
  includeAuthorCreation = true,
  searchedName: propSearchedName,
  dialog = false,
}) => {
  const [searchedName, setSearchedName] = useState<string | undefined>(propSearchedName);

  const debouncedSearchedName = useDebounce(searchedName, 300);

  const {
    data: authors,
    isFetched,
    isLoading: loading,
  } = useFindAuthorsQuery({
    name: debouncedSearchedName,
  });

  const createAuthorDraftForm = useForm({
    resolver: zodResolver(createAuthorDraftSchema),
    values: {
      name: '',
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  const render = () => (
    <Command>
      <CommandInput
        placeholder="Wyszukaj autora..."
        onValueChange={setSearchedName}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            setAuthorSelectOpen(false);
          }
        }}
      />
      <CommandList>
        {isFetched && authors?.data.length === 0 && (
          <CommandEmpty className="flex flex-col px-4 py-4 gap-4">
            {!includeAuthorCreation && <p>Nie znaleziono autora - {searchedName} </p>}
            {includeAuthorCreation && (
              <>
                <Dialog
                  open={createAuthorDialogVisible}
                  onOpenChange={(val) => {
                    setAuthorSelectOpen(val);

                    createAuthorDraftForm.setValue('name', searchedName ?? '');
                  }}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-slate-100 text-black hover:bg-slate-300">Dodaj</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Stwórz autora</DialogTitle>
                    </DialogHeader>
                    <CreateAuthorDraftForm
                      onCreateAuthorDraft={onCreateAuthorDraft}
                      initialName={searchedName}
                    />
                  </DialogContent>
                </Dialog>
              </>
            )}
          </CommandEmpty>
        )}
        {loading && (
          <CommandLoading className="p-2">
            <span>Wyszukuję autorów</span>
          </CommandLoading>
        )}
        {authors?.data.map((author) => (
          <CommandItem
            key={`author-${author.id}`}
            value={author.name}
            onSelect={() => onSelect(author.id, author.name)}
          >
            <Check
              className={cn('mr-2 h-4 w-4', author.id === currentlySelectedAuthorId ? 'opacity-100' : 'opacity-0')}
            />
            {author.name}
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  );

  return (
    <Fragment>
      {!dialog && <PopoverContent className={cn('w-60 sm:w-96 p-0', className)}>{render()}</PopoverContent>}
      {dialog && <DialogPopoverContent className={cn('w-60 sm:w-96 p-0', className)}>{render()}</DialogPopoverContent>}
    </Fragment>
  );
};
