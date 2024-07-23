import React, { ReactNode, useMemo, useState } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../pagination/pagination';

export interface PaginatorProps {
  pagesCount: number;
  pageIndex: number;
  onPageChange: (currentPage: number) => void | Promise<void>;
  includePageNumber?: boolean;
  includeArrows?: boolean;
  pageNumberSlot?: ReactNode;
  rootClassName?: string;
  contentClassName?: string;
}

export const Paginator = ({
  pagesCount,
  pageIndex,
  onPageChange,
  includePageNumber = true,
  includeArrows = true,
  pageNumberSlot,
  rootClassName,
  contentClassName,
}: PaginatorProps): React.ReactNode => {
  const [currentPage, setCurrentPage] = useState<number>(pageIndex);

  if (pageIndex !== currentPage) {
    setCurrentPage(pageIndex);
  }

  const previousPage = useMemo(() => {
    if (currentPage === 1) {
      return undefined;
    }

    return currentPage - 1;
  }, [currentPage]);

  const nextPage = useMemo(() => {
    if (currentPage === pagesCount) {
      return undefined;
    }

    if (currentPage === 1 && pagesCount > 2) {
      return currentPage + 2;
    } else if (currentPage === 1 && pagesCount <= 2) {
      return currentPage;
    }

    return currentPage + 1;
  }, [currentPage, pagesCount]);

  const goToPreviousPage = async (): Promise<void> => {
    if (previousPage) {
      setCurrentPage(previousPage);

      await onPageChange(previousPage);
    }
  };

  const goToNextPage = async (): Promise<void> => {
    if (currentPage + 1 <= pagesCount) {
      setCurrentPage(currentPage + 1);

      await onPageChange(currentPage + 1);
    }
  };

  return (
    <Pagination className={rootClassName}>
      <PaginationContent className={contentClassName}>
        {includeArrows ? (
          <PaginationItem>
            <PaginationPrevious
              hasPrevious={currentPage !== 1}
              onClick={goToPreviousPage}
            />
          </PaginationItem>
        ) : (
          <></>
        )}
        {pageNumberSlot ? (
          pageNumberSlot
        ) : includePageNumber ? (
          <>
            <PaginationItem
              className={previousPage === undefined ? 'pointer-events-none hover:text-none hover:bg-none' : ''}
            >
              <PaginationLink
                className={previousPage === undefined ? 'pointer-events-none hover:text-none hover:bg-[unset]' : ''}
                onClick={async () => {
                  if (previousPage === undefined) {
                    return;
                  }

                  if (previousPage - 1 === -1) {
                    return;
                  }

                  if (currentPage === pagesCount && pagesCount === 2) {
                    onPageChange(currentPage - 1);

                    setCurrentPage(currentPage - 1);

                    return;
                  }

                  if (currentPage === pagesCount) {
                    onPageChange(currentPage - 2);

                    setCurrentPage(currentPage - 2);

                    return;
                  }

                  onPageChange(previousPage);

                  setCurrentPage(previousPage);
                }}
                isActive={previousPage === undefined}
              >
                {previousPage !== undefined && currentPage === pagesCount && pagesCount > 2
                  ? currentPage - 2
                  : previousPage !== undefined
                    ? previousPage
                    : currentPage}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                isActive={
                  (currentPage !== 1 && currentPage !== pagesCount) || (pagesCount === 2 && currentPage === pagesCount)
                }
                onClick={async () => {
                  if (currentPage === 1) {
                    await onPageChange(currentPage + 1);

                    return setCurrentPage(currentPage + 1);
                  } else if (currentPage === pagesCount) {
                    await onPageChange(currentPage - 1);

                    return setCurrentPage(pagesCount - 1);
                  }
                }}
              >
                {currentPage !== 1
                  ? currentPage === pagesCount && pagesCount > 2
                    ? pagesCount - 1
                    : currentPage
                  : currentPage + 1}
              </PaginationLink>
            </PaginationItem>
            {pagesCount > 2 ? (
              <PaginationItem>
                <PaginationLink
                  isActive={nextPage === undefined && currentPage !== 1 && currentPage === pagesCount && pagesCount > 2}
                  className={nextPage === undefined ? 'pointer-events-none hover:text-none hover:bg-none' : ''}
                  onClick={async () => {
                    if (nextPage) {
                      onPageChange(nextPage);
                      setCurrentPage(nextPage);
                    }
                  }}
                >
                  {nextPage === undefined ? pagesCount : nextPage}
                </PaginationLink>
              </PaginationItem>
            ) : (
              <> </>
            )}
          </>
        ) : (
          <></>
        )}
        {includeArrows ? (
          <PaginationItem className={nextPage === undefined ? 'pointer-events-none hover:text-none hover:bg-none' : ''}>
            <PaginationNext
              hasNext={currentPage !== pagesCount}
              className={nextPage === undefined ? 'pointer-events-none hover:text-none hover:bg-[unset]' : ''}
              onClick={goToNextPage}
            />
          </PaginationItem>
        ) : (
          <></>
        )}
      </PaginationContent>{' '}
    </Pagination>
  );
};
