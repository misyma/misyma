import React, { cloneElement, type FC, Fragment, type PropsWithChildren, useCallback, useState } from 'react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../common/components/tooltip/tooltip';
import { useIsTruncated } from '../../../common/hooks/useIsTruncated';
import { cn } from '../../../common/lib/utils';

export const TruncatedTextTooltip: FC<
  PropsWithChildren<{
    text: string;
    className?: string;
    tooltipClassName?: string;
  }>
> = ({ text, children, className, tooltipClassName }) => {
  const [node, setNode] = useState<HTMLElement | null>(null);

  const setRef = useCallback((element: HTMLElement | null) => {
    setNode(element);
  }, []);

  const childElement = React.Children.only(children);
  const elementWithRef = cloneElement(childElement as React.ReactElement, { ref: setRef });

  const { isTruncated } = useIsTruncated({
    parentRef: node,
    text,
  });

  return (
    <Fragment>
      {isTruncated ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{elementWithRef}</TooltipTrigger>
            <TooltipContent className={cn('max-w-xs sm:max-w-[80px] md:max-w-md lg:max-w-lg xl:max-w-xl', className)}>
              <p className={cn('whitespace-normal sm:max-w-40 break-words', tooltipClassName)}>{text}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        elementWithRef
      )}
    </Fragment>
  );
};
