import { type FC, useMemo, useRef, useState } from 'react';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa6';

import { useIsTruncated } from '../../../common/hooks/useIsTruncated';

interface QuotationTextProps {
  content: string;
  index: number;
  pageIndex: number;
}

export const QuotationText: FC<QuotationTextProps> = ({ content, index, pageIndex }) => {
  const parentRef = useRef<HTMLParagraphElement>(null);

  const [showMore, setShowMore] = useState(false);

  const { isTruncated } = useIsTruncated({
    parentRef: parentRef.current,
    text: content,
  });

  const elementId = useMemo(() => {
    return `element${index}-${pageIndex}`;
  }, [index, pageIndex]);

  const onShowMore = (showMore: boolean) => {
    const element = document.querySelector(`#${elementId}`);

    setShowMore(showMore);

    element?.classList.add('truncate', 'text-wrap');

    if (!showMore) {
      return element?.classList.remove('text-wrap');
    }
  };

  return (
    <div className="w-full">
      <p
        ref={parentRef}
        id={elementId}
        className="font-semibold break-words text-lg truncate w-[90%]"
      >
        "{content}"
      </p>
      {isTruncated && (
        <div
          onClick={() => {
            onShowMore(!showMore);
          }}
          className="cursor-pointer flex items-center"
        >
          {!showMore ? (
            <>
              <p>więcej</p>
              <FaAngleDown />
            </>
          ) : (
            <>
              <p>mniej</p>
              <FaAngleUp />
            </>
          )}
        </div>
      )}
      {!isTruncated && <div className="show-more-placeholder h-5"> </div>}
    </div>
  );
};
