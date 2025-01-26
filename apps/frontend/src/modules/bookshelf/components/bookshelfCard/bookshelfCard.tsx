import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';
import { type FC, useMemo } from 'react';
import { HiDotsVertical, HiBookOpen } from 'react-icons/hi';
import { useSelector } from 'react-redux';

import type { BookshelfType } from '@common/contracts';

import { FindBooksByBookshelfIdQueryOptions } from '../../../book/api/user/queries/findBooksByBookshelfId/findBooksByBookshelfIdQueryOptions';
import { TruncatedTextTooltip } from '../../../book/components/truncatedTextTooltip/truncatedTextTooltip';
import { LoadingSpinner } from '../../../common/components/spinner/loading-spinner';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice';
import { useFindUserQuery } from '../../../user/api/queries/findUserQuery/findUserQuery';

interface BookshelfCardProps {
  bookshelf: {
    id: string;
    name: string;
    type: BookshelfType;
    createdAt: string;
    imageUrl?: string;
    bookCount?: number;
  };
  onClick?: () => void;
}

export const BookshelfCard: FC<BookshelfCardProps> = ({ bookshelf, onClick }) => {
  const navigate = useNavigate();

  const formattedDate = useMemo(() => format(new Date(bookshelf.createdAt), 'dd MMM yyyy'), [bookshelf.createdAt]);

  const accessToken = useSelector(userStateSelectors.selectAccessToken);
  const { data: user } = useFindUserQuery();

  const { data: booksQuery, isLoading } = useQuery(
    FindBooksByBookshelfIdQueryOptions({
      accessToken: accessToken as string,
      bookshelfId: bookshelf.id,
      userId: user?.id as string,
    }),
  );

  const handleClick = () => {
    onClick?.() || navigate({ to: `/shelves/bookshelf/${bookshelf.id}` });
  };

  return (
    <div
      className="group cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
      onClick={handleClick}
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden h-80 flex flex-col">
        <div className="relative h-52 bg-gradient-to-br from-blue-100 to-purple-100">
          {bookshelf.imageUrl && (
            <img
              src={bookshelf.imageUrl || '/placeholder.svg'}
              alt={bookshelf.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-20 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
          <button
            className="absolute top-2 right-2 p-1 bg-white bg-opacity-70 rounded-full transition-colors duration-300 hover:bg-opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              // Handle menu click
            }}
          >
            <HiDotsVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <TruncatedTextTooltip text={bookshelf.name}>
            <h3 className="font-bold text-lg line-clamp-2 mb-2">{bookshelf.name}</h3>
          </TruncatedTextTooltip>
          <div className="mt-auto flex justify-between items-center text-sm text-gray-600">
            <span className="flex items-center">
              <HiBookOpen className="w-4 h-4 mr-1" />
              {!isLoading ? booksQuery?.metadata.total || 0 : ''}
              {isLoading && <LoadingSpinner size={12} />}
            </span>
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
