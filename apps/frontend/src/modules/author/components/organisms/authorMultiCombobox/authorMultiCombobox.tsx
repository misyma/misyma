import { useVirtualizer } from '@tanstack/react-virtual';
import { type VariantProps } from 'class-variance-authority';
import { CheckIcon, XCircle, ChevronDown, XIcon, WandSparkles } from 'lucide-react';
import { forwardRef, Fragment, useEffect, useMemo, useRef, useState } from 'react';

import { AuthorBadge } from './authorBadge';
import { type AuthorMultiComboboxOption } from './authorMultiComboboxOption';
import { multiSelectVariants } from './authorMultiComboboxVariants';
import { TruncatedAuthorsTooltip } from './truncatedAuthorsTooltip';
import { Badge } from '../../../../common/components/badge';
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
import { Popover, PopoverContent, PopoverTrigger } from '../../../../common/components/popover/popover';
import { Separator } from '../../../../common/components/separator/separator';
import { LoadingSpinner } from '../../../../common/components/spinner/loading-spinner';
import useDebounce from '../../../../common/hooks/useDebounce';
import { cn } from '../../../../common/lib/utils';
import { useCreateAuthorDraftMutation } from '../../../api/user/mutations/createAuthorDraftMutation/createAuthorDraftMutation';
import {
  useFindAuthorsInfiniteQuery,
  useFindAuthorsQuery,
} from '../../../api/user/queries/findAuthorsQuery/findAuthorsQuery';
import { CreateAuthorDraftForm } from '../createAuthorDraftForm';

interface MultiSelectProps extends VariantProps<typeof multiSelectVariants> {
  /**
   * Callback function triggered when the selected values change.
   * Receives an array of the new selected values.
   */
  onValueChange: (value: AuthorMultiComboboxOption[]) => void;

  /** The default selected values when the component mounts. */
  defaultValue?: string[];

  /**
   * Placeholder text to be displayed when no values are selected.
   * Optional, defaults to "Select options".
   */
  placeholder?: string;

  /**
   * Animation duration in seconds for the visual effects (e.g., bouncing badges).
   * Optional, defaults to 0 (no animation).
   */
  animation?: number;

  /**
   * Maximum number of items to display. Extra selected items will be summarized.
   * Optional, defaults to 3.
   */
  maxCount?: number;

  /**
   * The modality of the popover. When set to true, interaction with outside elements
   * will be disabled and only popover content will be visible to screen readers.
   * Optional, defaults to false.
   */
  modalPopover?: boolean;

  /**
   * If true, renders the multi-select component as a child of another component.
   * Optional, defaults to false.
   */
  asChild?: boolean;

  /**
   * Additional class names to apply custom styles to the multi-select component.
   * Optional, can be used to add custom styles.
   */
  className?: string;
  createAuthorDialogVisible: boolean;
  setAuthorSelectOpen: (val: boolean) => void;
}

export const AuthorMultiCombobox = forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      onValueChange,
      variant,
      defaultValue = [],
      placeholder = 'Wybierz autorów',
      animation = 0,
      maxCount = 1,
      modalPopover = false,
      asChild = false,
      className,
      createAuthorDialogVisible,
      setAuthorSelectOpen,
      ...props
    },
    ref,
  ) => {
    const { data: initialAuthors, isLoading: isLoadingInitialAuthors } = useFindAuthorsQuery({
      ids: defaultValue ?? [],
    });

    const [searchedName, setSearchedName] = useState('');
    const [selectedValues, setSelectedValues] = useState<AuthorMultiComboboxOption[]>(
      initialAuthors?.data.map((x) => ({
        label: x.name,
        value: x.id,
      })) ?? [],
    );

    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const debouncedSearchedName = useDebounce(searchedName, 300);

    useEffect(() => {
      if (initialAuthors?.data && initialAuthors?.data.length > 0) {
        setSelectedValues(
          initialAuthors.data.map((x) => ({
            label: x.name,
            value: x.id,
          })),
        );
      }
    }, [initialAuthors]);

    const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        setIsPopoverOpen(true);
      } else if (event.key === 'Backspace' && !event.currentTarget.value) {
        const newSelectedValues = [...selectedValues];
        newSelectedValues.pop();
        setSelectedValues(newSelectedValues);
        onValueChange(newSelectedValues);
      }
    };

    const toggleOption = (option: AuthorMultiComboboxOption) => {
      const newSelectedValues = selectedValues.includes(option)
        ? selectedValues.filter((value) => value.value !== option.value)
        : [...selectedValues, option];
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    const handleClear = () => {
      setSelectedValues([]);
      onValueChange([]);
    };

    const handleTogglePopover = () => {
      setIsPopoverOpen(!isPopoverOpen);
    };

    const clearExtraOptions = () => {
      const newSelectedValues = selectedValues.slice(0, maxCount);
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    const { isFetching } = useFindAuthorsInfiniteQuery({
      pageSize: 50,
      all: true,
      name: searchedName,
    });

    return (
      <Popover
        open={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
        modal={modalPopover}
      >
        <PopoverTrigger asChild={asChild}>
          <Button
            data-testid="author-multi-combobox-trigger-button"
            ref={ref}
            {...props}
            variant="none"
            size="custom"
            onClick={handleTogglePopover}
            disabled={isLoadingInitialAuthors && defaultValue.length > 0}
            className={cn(
              'flex w-60 sm:w-96 p-1 bg-[#D1D5DB]/20 rounded-md border min-h-10 h-auto items-center justify-between [&_svg]:pointer-events-auto py-2',
              className,
            )}
          >
            {selectedValues.length === 0 && defaultValue.length > 0 && isLoadingInitialAuthors && (
              <LoadingSpinner size={24} />
            )}
            {selectedValues.length > 0 ? (
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center">
                  {selectedValues.slice(0, maxCount).map((value) => (
                    <AuthorBadge
                      animation={animation}
                      isAnimating={isAnimating}
                      toggleOption={toggleOption}
                      value={value}
                    />
                  ))}
                  {selectedValues.length > maxCount && (
                    <Badge
                      className={cn(
                        'bg-transparent text-foreground border-foreground/1 hover:bg-transparent font-normal text-xs',
                        isAnimating ? 'animate-bounce' : '',
                        multiSelectVariants({ variant }),
                      )}
                      style={{ animationDuration: `${animation}s` }}
                    >
                      <TruncatedAuthorsTooltip
                        animation={animation}
                        isAnimating={isAnimating}
                        values={selectedValues.slice(maxCount)}
                        onRemoveValue={toggleOption}
                        variant={variant}
                      >
                        <p data-testid="author-multi-combobox-more-authors-hover-trigger">{`+ ${selectedValues.length - maxCount} więcej`}</p>
                      </TruncatedAuthorsTooltip>
                      <XCircle
                        className="ml-2 h-4 w-4 cursor-pointer"
                        onClick={(event) => {
                          event.stopPropagation();
                          clearExtraOptions();
                        }}
                      />
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <XIcon
                    className="h-6 w-6 mx-2 cursor-pointer text-muted-foreground"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleClear();
                    }}
                  />
                  <Separator
                    orientation="vertical"
                    className="flex min-h-6 h-full"
                  />
                  <ChevronDown className="h-8 w-8 text-primary" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full mx-auto">
                <span className="text-sm text-muted-foreground mx-3">{placeholder}</span>
                <ChevronDown className="h-8 w-8 text-primary" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          onWheel={(e) => e.stopPropagation()}
          className="w-60 sm:w-96 p-0"
          align="start"
          onEscapeKeyDown={() => setIsPopoverOpen(false)}
        >
          <Command shouldFilter={false}>
            <div className="relative w-full">
              <CommandInput
                placeholder="Search..."
                onKeyDown={handleInputKeyDown}
                onValueChange={(val) => setSearchedName(val)}
              />
              {isFetching && searchedName.length > 3 && (
                <LoadingSpinner
                  className="absolute top-2 right-2"
                  size={24}
                />
              )}
            </div>
            <CommandList>
              <AuthorMultiSelectCommandGroup
                searchedName={debouncedSearchedName}
                selectedValues={selectedValues}
                createAuthorDialogVisible={createAuthorDialogVisible}
                setAuthorSelectOpen={setAuthorSelectOpen}
                toggleOption={toggleOption}
              />
            </CommandList>
          </Command>
        </PopoverContent>
        {animation > 0 && selectedValues.length > 0 && (
          <WandSparkles
            className={cn(
              'cursor-pointer my-2 text-foreground bg-background w-3 h-3',
              isAnimating ? '' : 'text-muted-foreground',
            )}
            onClick={() => setIsAnimating(!isAnimating)}
          />
        )}
      </Popover>
    );
  },
);

const AuthorMultiSelectCommandGroup = ({
  selectedValues,
  searchedName,
  createAuthorDialogVisible,
  setAuthorSelectOpen,
  toggleOption,
}: {
  selectedValues: AuthorMultiComboboxOption[];
  searchedName: string;
  toggleOption: (option: AuthorMultiComboboxOption) => void;
  createAuthorDialogVisible: boolean;
  setAuthorSelectOpen: (val: boolean) => void;
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const {
    data: authors,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useFindAuthorsInfiniteQuery({
    pageSize: 25,
    all: true,
    name: searchedName,
  });

  const { mutateAsync } = useCreateAuthorDraftMutation({
    onSuccess: () => setAuthorSelectOpen(false),
  });

  const options = useMemo(() => {
    return (
      authors?.pages.flatMap((p) =>
        p.data.map((a) => ({
          label: a.name,
          value: a.id,
        })),
      ) ?? []
    );
  }, [authors?.pages]);

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? options.length + 1 : options.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40, // Adjusted for card height
    overscan: 2,
  });

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (lastItem.index >= options.length - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
    // oh shush
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasNextPage, fetchNextPage, options.length, isFetchingNextPage, rowVirtualizer.getVirtualItems()]);

  useEffect(() => {
    rowVirtualizer.scrollToIndex(0, { align: 'start' });
  }, [rowVirtualizer]);

  const onCreateAuthorDraft = async (payload: { name: string }) => {
    const result = await mutateAsync({
      name: payload.name,
    });

    toggleOption({
      label: result.name,
      value: result.id,
    });
  };

  return (
    <Fragment>
      {isLoading && (
        <div className="w-full py-4 flex items-center justify-center">
          <LoadingSpinner size={36} />
        </div>
      )}
      {!isLoading && options.length === 0 && (
        <CommandEmpty>
          <Dialog
            open={createAuthorDialogVisible}
            onOpenChange={(val) => {
              setAuthorSelectOpen(val);
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
        </CommandEmpty>
      )}
      {!isLoading && options.length > 0 && (
        <div
          ref={parentRef}
          className="h-[300px] overflow-auto"
        >
          <div
            className="w-full"
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: 'relative',
            }}
          >
            {!isLoading &&
              rowVirtualizer.getVirtualItems().map((virtualRow) => {
                //   const isLoaderRow = virtualRow.index >= options.length;
                const startIndex = virtualRow.index;
                const author = options[startIndex];
                const isSelected = selectedValues.includes(author);

                return (
                  <CommandItem
                    data-testid={`author-multi-combobox-option-${author.value}`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: `${virtualRow.size}px`,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    key={author?.value}
                    onSelect={() => toggleOption(author)}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible',
                      )}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </div>
                    <span>{author?.label}</span>
                  </CommandItem>
                );
              })}
          </div>
        </div>
      )}
    </Fragment>
  );
};

AuthorMultiCombobox.displayName = 'AuthorMultiCombobox';
