import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa6';

interface QuotationTextProps {
  content: string;
  index: number;
  pageIndex: number;
}

export const QuotationText: FC<QuotationTextProps> = ({
  content,
  index,
  pageIndex,
}) => {
  const [isTruncated, setIsTruncated] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const parentRef = useRef<HTMLParagraphElement>(null);
  const elementId = useMemo(() => {
    return `element${index}-${pageIndex}`;
  }, [index, pageIndex]);

  useEffect(() => {
    if (!parentRef) {
      return;
    }

    const clone = parentRef.current?.cloneNode(true) as HTMLParagraphElement;
    clone.id = '';
    clone.classList.remove('custom-truncate');
    clone.classList.add('custom-inline');

    const root = document.querySelector('body');
    root?.append(clone);

    const originalWidth = parentRef.current?.getBoundingClientRect()
      .width as number;

    const cloneWidth = clone.getBoundingClientRect().width;

    if (originalWidth < cloneWidth) {
      setIsTruncated(true);
    } else {
      setIsTruncated(false);
    }

    clone.remove();
  }, [content]);

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
      {!isTruncated && <div className='show-more-placeholder h-5'> </div>}
    </div>
  );
};
