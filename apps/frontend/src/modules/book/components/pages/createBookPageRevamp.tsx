import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '../../../common/components/input/input';
import { Button } from '../../../common/components/button/button';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence, Variant } from 'framer-motion';
import { Skeleton } from '../../../common/components/skeleton/skeleton';
import { Book } from '@common/contracts';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { FindUserBooksByQueryOptions } from '../../api/user/queries/findUserBookBy/findUserBooksByQueryOptions';
import { BookImageMiniature } from '../molecules/bookImageMiniature/bookImageMiniature';
import { ReversedLanguages } from '../../../common/constants/languages';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { SearchResultSearch } from './schemas/searchResultPageSchema';
import { FindBooksInfiniteQueryOptions } from '../../api/user/queries/findBooks/findBooksQueryOptions';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '../../../common/lib/utils';
import useDebounce from '../../../common/hooks/useDebounce';

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

interface FoundBookViewProps {
  onAddBook: (book?: Book) => Promise<void>;
  onCreateManually: () => void;
}

const ManyFoundBooksView: FC<FoundBookViewProps> = ({ onCreateManually, onAddBook }) => {
  // todo: search value stored in queryParam
  // searchValueType stored in queryParam
  // eh
  const searchParams = useSearch({ strict: false }) as SearchResultSearch;
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | undefined>(undefined);

  const parentRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, isFetchingNextPage, isLoading, hasNextPage } = useInfiniteQuery(
    FindBooksInfiniteQueryOptions({
      title: searchParams.title ? searchParams.title : undefined,
      isbn: searchParams.isbn ? searchParams.isbn : undefined,
      pageSize: 20,
    }),
  );

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
                        setSelectedRowIndex(undefined);
                      } else {
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
      <div className="w-full pt-4 flex gap-4 justify-center items-center">
        <Button
          variant="secondary"
          size="xl"
          onClick={onCreateManually}
        >
          <span className="text-lg">Wprowadź inne dane</span>
        </Button>
        <Button
          size="xl"
          onClick={() => {
            onAddBook(allItems && allItems[selectedRowIndex as number]);
          }}
          disabled={selectedRowIndex === undefined}
        >
          <span className="text-lg">Kontynuuj</span>
        </Button>
      </div>
    </div>
  );
};

export const CreateBookPageRevamp = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('/mybooks/search');
  const [hasSearched, setHasSearched] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const trimmedSearch = debouncedSearch.trim();

    const cleanedSearch = trimmedSearch.replace(/[-\s]/g, '').replace(/^ISBN/i, '');

    const isIsbn10 = /^\d{9}[\dX]$/.test(cleanedSearch);
    const isIsbn13 = /^\d{13}$/.test(cleanedSearch);

    navigate({
      // todo: figure out all those dumb type behaviors with navigation
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      search: (prev) => ({
        ...prev,
        searchBy: isIsbn10 || isIsbn13 ? 'isbn' : 'title',
        title: isIsbn10 || isIsbn13 ? '' : debouncedSearch,
        isbn: isIsbn10 || isIsbn13 ? debouncedSearch : '',
      }),
    });
  }, [debouncedSearch, navigate]);

  useEffect(() => {
    if (search.length > 0) {
      return setHasSearched(true);
    }
    setHasSearched(false);
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
    large: { width: '100%', maxWidth: '20rem', marginBottom: '0.5rem' },
    small: { width: '6rem', height: '6rem', marginBottom: '0.25rem' },
    hidden: {
      width: '0%',
      height: '0px',
      marginBottom: '0rem',
      opacity: 0,
      scale: 0.8,
    },
  };

  const imageVariants: Record<string, Variant> = {
    large: { maxWidth: '20rem' },
    small: { maxWidth: '6rem' },
    hidden: {
      opacity: 0,
      scale: 0.8,
      pointerEvents: 'none',
    },
  };

  //   const listItemVariants = {
  //     hidden: { opacity: 0, y: 10 },
  //     visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  //   };

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
          initial="large"
          animate={hasSearched ? 'hidden' : 'large'}
          variants={imageContainerVariants}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <motion.img
            src="/books.png"
            alt="Books image"
            className="object-contain"
            initial="large"
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
            otherIcon={<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            iconNonAbsolute
            placeholder="Wpisz numer isbn albo tytuł"
            className="w-[26.75rem] justify-items-start"
            containerClassName="w-full flex"
          />
        </motion.div>

        <AnimatePresence>
          {hasSearched && (
            <motion.div
              className="w-full mt-4 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ul className="space-y-2">
                <ManyFoundBooksView
                  onAddBook={() => Promise.resolve()}
                  onCreateManually={() => {}}
                />
                {/* {searchResults.map((book, index) => (
                  <motion.li
                    key={book.id}
                    className="p-4 border rounded-md bg-card shadow-sm hover:shadow-md transition-all cursor-pointer"
                    variants={listItemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{book.title}</span>
                      <span className="text-sm text-muted-foreground">{book.author}</span>
                      <span className="text-xs text-muted-foreground">ISBN: {book.isbn}</span>
                    </div>
                  </motion.li>
                ))} */}
                {/* {!atLeastOneBookFound && (
                  <motion.li
                    className="p-4 text-center text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    Nie znaleziono książek pasujących do zapytania
                  </motion.li>
                )} */}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {hasSearched && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t flex justify-end"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              variant="default"
              className="opacity-50 pointer-events-none"
            >
              Kontynuuj
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
