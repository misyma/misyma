import { type FC, useMemo } from 'react';

import { Separator } from '../../../../common/components/separator/separator';
import { Skeleton } from '../../../../common/components/skeleton/skeleton';
import { BookFormat } from '../../../../common/constants/bookFormat';
import { ReversedLanguages } from '../../../../common/constants/languages';
import { useErrorHandledQuery } from '../../../../common/hooks/useErrorHandledQuery';
import { BookTitle } from '../../../../quotes/components/atoms/bookTitle/bookTitle';
import { FindUserBookByIdQueryOptions } from '../../../api/user/queries/findUserBook/findUserBookByIdQueryOptions';
import { CurrentRatingStar } from '../../atoms/currentRatingStar/currentRatingStar';
import { BookshelfChoiceDropdown } from '../../molecules/bookshelfChoiceDropdown/bookshelfChoiceDropdown';
import { StatusChooserCards } from '../../molecules/statusChooser/statusChooserCards';
import { Bookmark, BookOpen, Calendar, FileText, Globe, Hash, User } from 'lucide-react';
import { Card } from '../../../../common/components/card';

interface BasicDataMainBodyProps {
  bookId: string;
}

export const BasicDataMainBody: FC<BasicDataMainBodyProps> = ({ bookId }) => {
  const queryOptions = useMemo(
    () =>
      FindUserBookByIdQueryOptions({
        userBookId: bookId,
      }),
    [bookId],
  );

  const { data, isLoading } = useErrorHandledQuery(queryOptions);

  const bookDetails = useMemo(
    () => ({
      language: data?.book.language ? ReversedLanguages[data.book.language]?.toLowerCase() : '',
      format: data?.book.format ? BookFormat[data.book.format] : '',
      title: data?.book.title,
      releaseYear: data?.book.releaseYear,
      pages: data?.book.pages,
      authors: data?.book.authors ?? [],
      genre: data?.book.genreName,
      translator: data?.book.translator,
    }),
    [
      data?.book.language,
      data?.book.format,
      data?.book.title,
      data?.book.releaseYear,
      data?.book.pages,
      data?.book.authors,
      data?.book.genreName,
      data?.book.translator,
    ],
  );

  return (
    <>
      <Card className="p-6 bg-background border-primary/10 shadow-md">
        <div className="flex flex-col gap-6">
          <div className="flex flex-shrink-0 justify-between items-center">
            {!isLoading ? <BookTitle title={bookDetails.title ?? ''} /> : <Skeleton className="h-9 w-40" />}
            <CurrentRatingStar userBookId={bookId} />
          </div>

          <Separator className="h-[2px] bg-primary/20" />

          <div className="flex flex-col md:flex-row gap-8 w-full justify-between">
            <div className="flex flex-shrink-0 flex-col gap-4 flex-1">
              <h3 className="text-lg font-medium text-foreground/80">Informacje o książce</h3>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <span className="font-medium">
                    {!isLoading && (bookDetails.authors.length > 1 ? 'Autorzy: ' : 'Autor: ')}
                  </span>
                  {bookDetails.authors.slice(0, 3).map((author, index) => (
                    <span
                      key={index}
                      className="text-foreground/80"
                    >
                      {author.name}
                      {index < Math.min(bookDetails.authors.length, 3) - 1 && ', '}
                    </span>
                  ))}
                  {bookDetails.authors.length > 3 && (
                    <span className="text-foreground/70">{` i ${bookDetails.authors.length - 3} więcej`}</span>
                  )}
                </div>
              </div>

              {data?.book.isbn && (
                <div className="flex items-start gap-3">
                  <Hash className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <span className="font-medium">ISBN: </span>
                    <span className="text-foreground/80">{data.book.isbn}</span>
                  </div>
                </div>
              )}

              {data?.book.releaseYear && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <span className="font-medium">Rok wydania: </span>
                    <span className="text-foreground/80">{bookDetails.releaseYear}</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <span className="font-medium">Język: </span>
                  <span className="text-foreground/80">{bookDetails.language}</span>
                </div>
              </div>

              {data?.book.translator && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <span className="font-medium">Przekład: </span>
                    <span className="text-foreground/80">{bookDetails.translator}</span>
                  </div>
                </div>
              )}

              {data?.book.format && (
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <span className="font-medium">Format: </span>
                    <span className="text-foreground/80">{bookDetails.format}</span>
                  </div>
                </div>
              )}

              {data?.book.pages && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <span className="font-medium">Liczba stron: </span>
                    <span className="text-foreground/80">{bookDetails.pages}</span>
                  </div>
                </div>
              )}

              {data?.book.genreName && (
                <div className="flex items-start gap-3">
                  <Bookmark className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <span className="font-medium">Kategoria: </span>
                    <span className="text-foreground/80">{bookDetails.genre}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-shrink-0 flex-col gap-8 md:items-end md:min-w-[240px]">
              <BookshelfChoiceDropdown
                currentBookshelfId={data?.bookshelfId ?? ''}
                bookId={bookId}
              />

              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-medium text-foreground/80 md:text-right">Status czytania</h3>
                <StatusChooserCards
                  bookshelfId={data?.bookshelfId ?? ''}
                  bookId={data?.id ?? ''}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};
