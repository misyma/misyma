import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '../../../common/components/input/input';
import { Button } from '../../../common/components/button/button';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence, Variant } from 'framer-motion';
import { Skeleton } from '../../../common/components/skeleton/skeleton';
import { Book } from '@common/contracts';
import { useQuery } from '@tanstack/react-query';
import { FindUserBooksByQueryOptions } from '../../api/user/queries/findUserBookBy/findUserBooksByQueryOptions';
import { BookImageMiniature } from '../molecules/bookImageMiniature/bookImageMiniature';
import { ReversedLanguages } from '../../../common/constants/languages';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { SearchResultSearch } from './schemas/searchResultPageSchema';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '../../../common/lib/utils';
import useDebounce from '../../../common/hooks/useDebounce';
import { useBookNavigationSource } from '../../hooks/useBookNavigationSource/useBookNavigationSource';
import { determineSearchBy } from '../../utils/determineSearchBy';
import { useInfiniteBookSearch } from '../../hooks/useInfiniteBookSearch/useInfiniteBookSearch';
import { BookNavigationFromEnum } from '../../constants';
import { useSearchBookContextDispatch } from '../../../bookshelf/context/searchCreateBookContext/searchCreateBookContext';

interface BookRowProps {
  book: Book;
  onSelect: () => void;
  isSelected: boolean;
}
const BookRow: FC<BookRowProps> = ({ book, onSelect, isSelected }) => {
  const { data, isLoading } = useQuery(
    FindUserBooksByQueryOptions({
      isbn: book.isbn as string,
    }),
  );

  const loadingPredicate =
    (!isLoading && !!data?.metadata.total && data?.metadata.total === 0) || data?.data[0]?.book?.isbn === undefined;

  const isSelectable = loadingPredicate;

  return (
    <div
      className={cn(
        'grid grid-cols-9 gap-x-4 p-4 rounded-lg transition-colors duration-200 cursor-pointer',
        isSelected ? 'bg-secondary/60 shadow-md' : isSelectable && 'hover:bg-secondary/40',
        !isSelectable && 'bg-gray-500/30 cursor-default',
      )}
      onClick={() => {
        if (isSelectable) {
          onSelect();
        }
      }}
    >
      <BookImageMiniature
        bookImageSrc={book.imageUrl ?? ''}
        key={`${book.id}-image`}
        className="w-20 h-28 object-cover rounded shadow-sm"
      />
      <div className="col-span-2 font-medium line-clamp-3">{book.title}</div>
      <div className="line-clamp-2 text-muted-foreground">{book.authors?.[0]?.name}</div>
      <div className="text-sm">{book.format}</div>
      <div className="text-sm">{book.releaseYear}</div>
      <div className="line-clamp-2 text-sm text-muted-foreground">{book.publisher}</div>
      <div className="text-sm capitalize">{ReversedLanguages[book.language].toLowerCase()}</div>
      <div className="line-clamp-2 text-sm text-muted-foreground">{book.translator ?? '‐'}</div>
    </div>
  );
};

interface FoundBooksListProps {
  onBookSelect: (book: Book | undefined) => void;
}

const FoundBooksList: FC<FoundBooksListProps> = ({ onBookSelect }) => {
  const searchParams = useSearch({ strict: false }) as SearchResultSearch;
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | undefined>(undefined);

  const parentRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteBookSearch({
    search: searchParams.title !== '' ? searchParams.title : searchParams.isbn,
    searchBy: searchParams.searchBy,
  });

  const allItems = useMemo(
    () =>
      data?.pages
        ?.flat(1)
        .map((page) => page.data)
        .flat(1),
    [data],
  );

  const rowVirtualizer = useVirtualizer({
    count: data?.pages?.[0]?.metadata?.total ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 146,
    overscan: 5,
  });

  useEffect(() => {
    setSelectedRowIndex(undefined);
  }, [searchParams]);

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (lastItem.index >= (allItems?.length ?? 1) - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasNextPage, fetchNextPage, allItems, isFetchingNextPage, rowVirtualizer.getVirtualItems()]);

  return (
    <div>
      <div
        ref={parentRef}
        className="w-full h-[700px] 4xl:h-[1068px] overflow-auto no-scrollbar"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          <div className="sticky w-full top-0 z-10 bg-background pb-4">
            <div className="grid grid-cols-9 gap-x-2">
              Obrazek
              <div className="col-span-2 line-clamp-3">Tytuł</div>
              <div className="line-clamp-2">Autorzy</div>
              <div>Format</div>
              <div>Rok wydania</div>
              <div className="line-clamp-2">Wydawnictwo</div>
              <div>Język</div>
              <div className="line-clamp-2">Przekład</div>
            </div>
          </div>
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const isLoaderRow = virtualItem.index >= (allItems?.length ?? 0);

            const isFirstLoaderAttempt = isLoading && isLoaderRow;

            const isSubsequentLoader = !isLoading && isLoaderRow && hasNextPage;

            return (
              <div
                key={virtualItem.index}
                style={{
                  height: `${virtualItem.size}px`,
                  width: '100%',
                  position: 'absolute',
                  top: '40px',
                  left: 0,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {isFirstLoaderAttempt && <Skeleton className="w-40 h-[144px]" />}
                {isSubsequentLoader && <Skeleton className="w-full h-[144px]" />}
                {!isSubsequentLoader && allItems && (
                  <BookRow
                    book={allItems[virtualItem.index]}
                    key={allItems[virtualItem.index].id}
                    onSelect={() => {
                      if (selectedRowIndex === virtualItem.index) {
                        onBookSelect(undefined);
                        setSelectedRowIndex(undefined);
                      } else {
                        onBookSelect(allItems[virtualItem.index]);
                        setSelectedRowIndex(virtualItem.index);
                      }
                    }}
                    isSelected={virtualItem.index === selectedRowIndex}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const CreateBookPageRevamp = () => {
  const searchParams = useSearch({ strict: false }) as SearchResultSearch;

  const { from, url } = useBookNavigationSource({
    urlMapping: {
      books: '/mybooks/search',
      shelves: '/shelves/bookshelf/search',
    } as const,
  });

  const addBookUrl =
    from === BookNavigationFromEnum.shelves
      ? `/shelves/bookshelf/search/create/${searchParams.bookshelfId}`
      : `/mybooks/search/create/${searchParams.bookshelfId}`;

  const createManuallyUrl =
    from === BookNavigationFromEnum.shelves ? '/shelves/bookshelf/createBook/' : '/mybooks/search/createBook';

  const navigate = useNavigate({
    from: url,
  });

  const searchCreationDispatch = useSearchBookContextDispatch();

  const [selectedBook, setSelectedBook] = useState<Book | undefined>(undefined);
  const [search, setSearch] = useState(searchParams.title ?? searchParams.isbn);
  const [hasSearched, setHasSearched] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const searchBy = determineSearchBy(debouncedSearch);
    setSelectedBook(undefined);

    navigate({
      search: (prev) => ({
        ...prev,
        searchBy: searchBy,
        title: searchBy === 'title' ? debouncedSearch : '',
        isbn: searchBy === 'isbn' ? debouncedSearch : '',
      }),
    });
  }, [debouncedSearch, navigate]);

  useEffect(() => {
    if (search.length > 0) {
      return setHasSearched(true);
    }
  }, [search]);

  const containerVariants = {
    centered: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh-72px)',
    },
    top: {
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
  };

  const imageContainerVariants = {
    large: {
      width: '100%',
      height: 'auto',
      opacity: 1,
      maxWidth: '20rem',
      marginTop: '0.5rem',
      marginBottom: '0.5rem',
      transition: { type: 'spring', stiffness: 100, damping: 20 },
    },
    hidden: {
      width: 0,
      height: 0,
      opacity: 0,
      marginBottom: 0,
      transition: { duration: 0.4, ease: 'easeInOut' },
    },
  };

  const imageVariants: Record<string, Variant> = {
    large: {
      opacity: 1,
      scale: 1,
      maxWidth: '20rem',
      transition: { type: 'spring', stiffness: 100, damping: 20 },
    },
    hidden: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.4, ease: 'easeInOut' },
      pointerEvents: 'none',
    },
  };

  const { data, isLoading } = useInfiniteBookSearch({
    search: debouncedSearch,
    searchBy: searchParams.searchBy,
  });

  const atLeastOneBookFound = !isLoading && data?.pages && data?.pages.flatMap((x) => x.data).length > 0;

  const onAddBook = async (book?: Book): Promise<void> => {
    if (!book) {
      return;
    }

    searchCreationDispatch({
      bookId: book.id,
    });

    searchCreationDispatch({
      title: book.title,
    });

    searchCreationDispatch({
      step: 3,
    });

    navigate({
      to: addBookUrl,
      search: {
        ...searchParams,
      },
    });
  };

  const onCreateManually = () => {
    navigate({
      to: createManuallyUrl,
      search: {
        ...searchParams,
        bookshelfId: searchParams.bookshelfId,
      },
    });
  };

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-72px)]">
      <motion.div
        className="flex flex-col gap-8 w-full"
        initial="centered"
        animate={hasSearched ? 'top' : 'centered'}
        variants={containerVariants}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
      >
        <motion.div
          className="flex items-center justify-center"
          initial={search === '' ? 'large' : 'hidden'}
          animate={hasSearched ? 'hidden' : 'large'}
          variants={imageContainerVariants}
          transition={{ duration: 0.5, ease: 'backIn' }}
        >
          <motion.img
            src="/books.png"
            alt="Books image"
            className="object-contain"
            initial={search === '' ? 'large' : 'hidden'}
            animate={hasSearched ? 'hidden' : 'large'}
            variants={imageVariants}
            transition={{ duration: 0.5 }}
          />
        </motion.div>

        <motion.div
          className="w-full max-w-md"
          transition={{ duration: 0.5 }}
        >
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            iSize="custom"
            otherIcon={isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            iconNonAbsolute
            placeholder="Wpisz numer isbn albo tytuł"
            className="w-[26.75rem] justify-items-start"
            containerClassName="w-full flex"
          />
        </motion.div>

        <AnimatePresence>
          {hasSearched && !isLoading && (
            <motion.div
              className="w-full mt-4 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ul className="space-y-2">
                {atLeastOneBookFound && <FoundBooksList onBookSelect={setSelectedBook} />}
                {!atLeastOneBookFound && debouncedSearch.length > 0 && (
                  <motion.li
                    className="p-4 text-center text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    Nie znaleziono książek pasujących do zapytania
                  </motion.li>
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="flex gap-4 fixed bottom-0 -left-80 right-0 p-4 bg-background border-t justify-end">
        <Button
          variant="secondary"
          onClick={onCreateManually}
        >
          Dodaj ręcznie
        </Button>
        <Button
          variant="default"
          disabled={!selectedBook}
          onClick={() => onAddBook(selectedBook)}
        >
          Kontynuuj
        </Button>
      </div>
    </div>
  );
};
