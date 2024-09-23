import { CommandLoading } from 'cmdk';
import { Button } from '../../../common/components/button/button';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../../common/components/command/command';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../common/components/dialog/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../common/components/form/form';
import { Input } from '../../../common/components/input/input';
import {
  DialogPopoverContent,
  PopoverContent,
} from '../../../common/components/popover/popover';
import { FC, Fragment, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../../common/lib/utils';
import { useFindAuthorsQuery } from '../../../author/api/user/queries/findAuthorsQuery/findAuthorsQuery';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createAuthorDraftSchema } from '../../../author/schemas/createAuthorDraftSchema';
import { AuthorFieldTooltip } from '../../../author/components/authorFieldTooltip';

interface AuthorSearchSelectorProps {
  onSelect: (authorId: string, authorName: string) => void;
  className?: string;
  currentlySelectedAuthorId?: string;
  createAuthorDialogVisible: boolean;
  setAuthorSelectOpen: (val: boolean) => void;
  onCreateAuthorDraft: (
    payload: z.infer<typeof createAuthorDraftSchema>
  ) => void;
  includeAuthorCreation: boolean;
  searchedName?: string;
  dialog?: boolean;
}

interface CreateAuthorDraftFormProps {
  onCreateAuthorDraft: (
    payload: z.infer<typeof createAuthorDraftSchema>
  ) => void;
  initialName?: string;
}

const CreateAuthorDraftForm: FC<CreateAuthorDraftFormProps> = ({
  onCreateAuthorDraft,
  initialName,
}) => {
  const createAuthorDraftForm = useForm({
    resolver: zodResolver(createAuthorDraftSchema),
    values: {
      name: initialName || '',
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  return (
    <Form {...createAuthorDraftForm}>
      <form
        className="flex flex-col gap-8 py-4"
        onSubmit={createAuthorDraftForm.handleSubmit(onCreateAuthorDraft)}
      >
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <div className="flex gap-2 items-center pb-1">
                <FormLabel>Imię i nazwisko</FormLabel>
                <AuthorFieldTooltip side='bottom' />
              </div>
              <FormControl>
                <Input min={1} max={128} type="text" {...field} />
              </FormControl>
              <FormMessage></FormMessage>
            </FormItem>
          )}
        />
        <Button
          disabled={!createAuthorDraftForm.formState.isValid}
          type="button"
          onClick={() => onCreateAuthorDraft(createAuthorDraftForm.getValues())}
        >
          Stwórz
        </Button>
      </form>
    </Form>
  );
};

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
  const [searchedName, setSearchedName] = useState<string | undefined>(
    propSearchedName
  );

  const {
    data: authors,
    isFetched,
    isLoading: loading,
  } = useFindAuthorsQuery({
    name: searchedName,
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
            {!includeAuthorCreation && (
              <p>Nie znaleziono autora - {searchedName} </p>
            )}
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
                    <Button className="bg-slate-100 text-black hover:bg-slate-300">
                      Dodaj
                    </Button>
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
        {loading && <CommandLoading>Wyszukuję autorów</CommandLoading>}
        {authors?.data.map((author) => (
          <CommandItem
            key={`author-${author.id}`}
            value={author.name}
            onSelect={() => onSelect(author.id, author.name)}
          >
            <Check
              className={cn(
                'mr-2 h-4 w-4',
                author.id === currentlySelectedAuthorId
                  ? 'opacity-100'
                  : 'opacity-0'
              )}
            />
            {author.name}
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  );

  return (
    <Fragment>
      {!dialog && (
        <PopoverContent className={cn('w-60 sm:w-96 p-0', className)}>
          {render()}
        </PopoverContent>
      )}
      {dialog && (
        <DialogPopoverContent className={cn('w-60 sm:w-96 p-0', className)}>
          {render()}
        </DialogPopoverContent>
      )}
    </Fragment>
  );
};
