import { useEffect, useState } from 'react';
import { Input } from '../../../common/components/input/input';
import { Button } from '../../../common/components/button/button';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence, Variant } from 'framer-motion';

const mockBooks = [
  { id: 1, title: 'Harry Potter i Kamień Filozoficzny', author: 'J.K. Rowling', isbn: '9788380082113' },
  { id: 2, title: 'Władca Pierścieni', author: 'J.R.R. Tolkien', isbn: '9788324404322' },
  { id: 3, title: 'Zbrodnia i kara', author: 'Fiodor Dostojewski', isbn: '9788375068825' },
  { id: 4, title: 'Duma i uprzedzenie', author: 'Jane Austen', isbn: '9788375068771' },
  { id: 5, title: 'Mały Książę', author: 'Antoine de Saint-Exupéry', isbn: '9788372271532' },
  { id: 6, title: 'Mały Książę', author: 'Antoine de Saint-Exupéry', isbn: '9788372271532' },
  { id: 7, title: 'Mały Książę', author: 'Antoine de Saint-Exupéry', isbn: '9788372271532' },
  { id: 8, title: 'Mały Książę', author: 'Antoine de Saint-Exupéry', isbn: '9788372271532' },
  { id: 9, title: 'Mały Książę', author: 'Antoine de Saint-Exupéry', isbn: '9788372271532' },
  { id: 10, title: 'Mały Książę', author: 'Antoine de Saint-Exupéry', isbn: '9788372271532' },
];

export const CreateBookPageRevamp = () => {
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof mockBooks | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (search.trim().length > 0) {
      const debounceTimeout = setTimeout(() => {
        setIsLoading(true);

        setTimeout(() => {
          const filteredBooks = mockBooks.filter(
            (book) => book.title.toLowerCase().includes(search.toLowerCase()) || book.isbn.includes(search),
          );
          setSearchResults(filteredBooks.length > 0 ? filteredBooks : []);
          setIsLoading(false);
          setHasSearched(true);
        }, 1500);
      }, 500);

      return () => clearTimeout(debounceTimeout);
    } else {
      setSearchResults(null);
      setHasSearched(false);
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

  const listItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-72px)]">
      <motion.div
        className="flex flex-col gap-8 w-full"
        initial="centered"
        animate={hasSearched && searchResults && searchResults.length > 0 ? 'top' : 'centered'}
        variants={containerVariants}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
      >
        <motion.div
          className="flex items-center justify-center"
          initial="large"
          animate={hasSearched && searchResults && searchResults.length > 0 ? 'hidden' : 'large'}
          variants={imageContainerVariants}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <motion.img
            src="/books.png"
            alt="Books image"
            className="object-contain"
            initial="large"
            animate={hasSearched && searchResults && searchResults.length > 0 ? 'hidden' : 'large'}
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
          {hasSearched && searchResults && (
            <motion.div
              className="w-full max-w-xl mt-4 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ul className="space-y-2">
                {searchResults.map((book, index) => (
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
                ))}
                {searchResults.length === 0 && (
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

      <AnimatePresence>
        {hasSearched && searchResults && (
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
