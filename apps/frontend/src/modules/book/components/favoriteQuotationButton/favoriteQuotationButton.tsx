import { FC, useMemo } from 'react';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { cn } from '../../../common/lib/utils.js';
import { Quote } from '@common/contracts';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice.js';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateQuoteMutation } from '../../../quotes/api/mutations/updateQuoteMutation/updateQuoteMutation.js';

interface Props {
  quote: Quote;
}

export const FavoriteQuotationButton: FC<Props> = ({ quote }) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const queryClient = useQueryClient();

  const isFavorite = useMemo(() => {
    return quote.isFavorite;
  }, [quote.isFavorite]);

  const { mutateAsync: updateQuotation } = useUpdateQuoteMutation({});

  const onIsFavoriteChange = async (): Promise<void> => {
    if (quote) {
      await updateQuotation({
        accessToken: accessToken as string,
        quoteId: quote.id,
        userBookId: quote.userBookId,
        isFavorite: !isFavorite,
      });

      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === `findQuotes` && query.queryKey[1] === quote.userBookId,
      });
    }
  };

  return (
    <>
      {!quote.isFavorite ? (
        <HiOutlineHeart
          className={cn('h-6 w-6 cursor-pointer', 'text-primary')}
          onClick={onIsFavoriteChange}
        />
      ) : (
        <HiHeart
          className={cn('h-6 w-6 cursor-pointer', 'text-primary')}
          onClick={onIsFavoriteChange}
        />
      )}
    </>
  );
};
