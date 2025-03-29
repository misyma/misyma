import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { type FC, type HTMLAttributes, useMemo, useState } from 'react';
import { HiDotsVertical, HiBookOpen } from 'react-icons/hi';

import { BookshelfType } from '@common/contracts';

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from '../../../../common/components/menubar/menubar';
import { useToast } from '../../../../common/components/toast/use-toast';
import { TruncatedTextTooltip } from '../../../../common/components/truncatedTextTooltip/truncatedTextTooltip';
import { DeleteBookshelfModal } from '../deleteBookshelfModal/deleteBookshelfModal';
import { UpdateBookshelfModal } from '../updateBookshelfModal/updateBookshelfModal';
import { UpdateNonStandardBookshelfModal } from '../updateNonStandardBookshelfModal/updateNonStandardBookshelfModal';

interface BookshelfCardProps {
  bookshelf: {
    id: string;
    name: string;
    type: BookshelfType;
    createdAt: string;
    imageUrl?: string;
    bookCount: number;
  };
  className?: string;
  style?: HTMLAttributes<HTMLDivElement>['style'];
  onClick?: () => void;
}

interface BookshelfCardMenuBarProps {
  onDeleteClick: () => void;
  onEditClick: () => void;
  bookshelfType: BookshelfType;
}

export const BookshelfCardMenuBar: FC<BookshelfCardMenuBarProps> = ({ onDeleteClick, onEditClick, bookshelfType }) => {
  return (
    <Menubar className="absolute top-2 right-2 p-0 rounded-none space-x-0 border-none data-[state=open]:!bg-none">
      <MenubarMenu>
        <MenubarTrigger
          omitOpenBg
          className={'text-black font-semibold text-md p-0'}
          asChild
        >
          <button
            className="absolute top-2 right-2 p-1 cursor-pointer bg-white bg-opacity-70 !rounded-full transition-colors duration-300 hover:bg-opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              // Handle menu click
            }}
          >
            <HiDotsVertical className="w-5 h-5 text-gray-600" />
          </button>
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem
            onClick={(e) => {
              onEditClick();
              e.stopPropagation();
            }}
            className="pt-2 hover:text-primary"
          >
            Edytuj
          </MenubarItem>
          {bookshelfType === BookshelfType.standard && (
            <>
              <MenubarSeparator />
              <MenubarItem
                onClick={(e) => {
                  onDeleteClick();
                  e.stopPropagation();
                }}
                className="py-2 hover:text-primary"
              >
                Usuń
              </MenubarItem>
            </>
          )}
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};

export const BookshelfCard: FC<BookshelfCardProps> = ({ bookshelf, style, onClick }) => {
  const navigate = useNavigate();

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const formattedDate = useMemo(
    () =>
      new Date(bookshelf.createdAt).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    [bookshelf.createdAt],
  );

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleClick = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    onClick?.() || navigate({ to: `/shelves/bookshelf/${bookshelf.id}` });
  };

  const UpdateBookshelfComponent =
    bookshelf.type === BookshelfType.standard ? UpdateBookshelfModal : UpdateNonStandardBookshelfModal;

  return (
    <>
      <UpdateBookshelfComponent
        bookshelfId={bookshelf.id}
        bookshelfName={bookshelf.name}
        open={editModalOpen}
        onCloseModal={() => setEditModalOpen(false)}
      />
      <DeleteBookshelfModal
        bookshelfId={bookshelf.id}
        bookshelfName={bookshelf.name}
        deletedHandler={async () => {
          toast({
            title: `Usunięto półkę`,
            description: `${bookshelf.name}`,
            variant: 'success',
          });

          await queryClient.invalidateQueries({
            predicate: (query) => query.queryKey[0] === 'findUserBookshelfs',
          });
        }}
        open={deleteModalOpen}
        onCloseModal={() => setDeleteModalOpen(false)}
      />
      <div
        className="group cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
        style={style}
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
            <BookshelfCardMenuBar
              bookshelfType={bookshelf.type}
              onEditClick={() => {
                setEditModalOpen(true);
              }}
              onDeleteClick={() => {
                setDeleteModalOpen(true);
              }}
            />
          </div>
          <div className="p-4 flex flex-col flex-grow">
            <TruncatedTextTooltip text={bookshelf.name}>
              <h3 className="font-bold text-lg line-clamp-2 mb-2">{bookshelf.name}</h3>
            </TruncatedTextTooltip>
            <div className="mt-auto flex justify-between items-center text-sm text-gray-600">
              <span className="flex items-center">
                <HiBookOpen className="w-4 h-4 mr-1" />
                {bookshelf.bookCount}
              </span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
