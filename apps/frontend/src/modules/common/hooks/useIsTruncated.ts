import { useEffect, useState } from 'react';

interface UseIsTruncatedProps {
  parentRef: HTMLElement | null;
  text: string;
}
export const useIsTruncated = ({ parentRef, text }: UseIsTruncatedProps) => {
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const parent = parentRef;
    if (!parent) {
      return;
    }

    const checkSize = () => {
      const clone = parent.cloneNode(true) as HTMLParagraphElement;
      clone.id = '';

      clone.classList.remove('custom-truncate');
      clone.classList.add('custom-inline');

      document?.body?.append(clone);

      const originalWidth = parent.getBoundingClientRect().width;
      const cloneWidth = clone.getBoundingClientRect().width;
      setIsTruncated(originalWidth < cloneWidth);

      clone.remove();
    };

    const observer = new ResizeObserver(() => {
      checkSize();
    });

    observer.observe(parent);

    checkSize();

    return () => observer.disconnect();
  }, [text, parentRef]);

  return {
    isTruncated,
  };
};
