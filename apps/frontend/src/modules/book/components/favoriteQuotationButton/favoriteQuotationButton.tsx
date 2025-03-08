import { useQueryClient } from '@tanstack/react-query';
import { type FC, useState } from 'react';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { useSelector } from 'react-redux';

import { type Quote } from '@common/contracts';

import { cn } from '../../../common/lib/utils.js';
import { userStateSelectors } from '../../../core/store/states/userState/userStateSlice.js';
import { useUpdateQuoteMutation } from '../../../quotes/api/mutations/updateQuoteMutation/updateQuoteMutation.js';
import {
  invalidateInfiniteQuotesPredicate,
  invalidateQuotesPredicate,
} from '../../../quotes/api/queries/getQuotes/getQuotes.js';

interface Props {
  quote: Quote;
}

export const FavoriteQuotationButton: FC<Props> = ({ quote }) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const [isFavorite, setIsFavorite] = useState(quote?.isFavorite);
  const [isAnimating, setIsAnimating] = useState(false);

  const queryClient = useQueryClient();

  const { mutateAsync: updateQuotation } = useUpdateQuoteMutation({});

  const onIsFavoriteChange = async (): Promise<void> => {
    if (quote) {
      setIsAnimating(true);

      try {
        await updateQuotation({
          accessToken: accessToken as string,
          quoteId: quote.id,
          isFavorite: !isFavorite,
        });

        setIsFavorite(!isFavorite);

        await queryClient.invalidateQueries({
          predicate: ({ queryKey }) =>
            invalidateQuotesPredicate(queryKey, quote.userBookId) || invalidateInfiniteQuotesPredicate(queryKey),
        });
      } finally {
        setTimeout(() => setIsAnimating(false), 300);
      }
    }
  };

  return (
    <div className="inline-block h-7 w-7 relative">
      <HiOutlineHeart
        className={cn('h-7 w-7 cursor-pointer text-primary', {
          'animate-pulse': isAnimating,
        })}
        onClick={onIsFavoriteChange}
      />
      <HiHeart
        className={cn('h-7 w-7 cursor-pointer text-primary absolute inset-0 transition-opacity duration-300', {
          'opacity-100': isFavorite && !isAnimating,
          'opacity-0': !isFavorite || isAnimating,
        })}
        onClick={onIsFavoriteChange}
      />
    </div>
  );
};
