import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa6';

interface QuotationTextProps {
  content: string;
  index: number;
  pageIndex: number;
}

export const QuotationText: FC<QuotationTextProps> = ({ content, index, pageIndex }) => {
  const [isTruncated, setIsTruncated] = useState(false);

  const [showMore, setShowMore] = useState(false);

  const elementId = useMemo(() => {
    return `element${index}-${pageIndex}`;
  }, [index, pageIndex]);

  const parentRef = useRef<HTMLParagraphElement>(null);

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

    const originalWidth = parentRef.current?.getBoundingClientRect().width as number;

    const cloneWidth = clone.getBoundingClientRect().width;

    if (originalWidth < cloneWidth) {
      setIsTruncated(true);
    } else {
      setIsTruncated(false);
    }

    clone.remove();
  }, [index, pageIndex]);

  const onShowMore = (showMore: boolean) => {
    const element = document.querySelector(`#${elementId}`);
    setShowMore(showMore);

    if (showMore) {
      return element?.classList.remove('truncate');
    }

    element?.classList.add('truncate');
  };

  return (
    <div>
      <p
        ref={parentRef}
        id={elementId}
        className="font-semibold break-words text-lg truncate sm:max-w-3xl md:max-w-4xl"
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
    </div>
  );
};
