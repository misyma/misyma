import React, {
  cloneElement,
  type FC,
  Fragment,
  isValidElement,
  type PropsWithChildren,
  type RefObject,
  useRef,
} from 'react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../common/components/tooltip/tooltip';
import { useIsTruncated } from '../../../common/hooks/useIsTruncated';

export const TruncatedTextTooltip: FC<
  PropsWithChildren<{
    text: string;
  }>
> = ({ text, children }) => {
  const parentRef = useRef<HTMLElement>(null);

  const { isTruncated } = useIsTruncated({
    parentRef,
    text,
  });

  const childElement = React.Children.only(children);

  if (!isValidElement(childElement)) {
    return childElement;
  }

  const elementWithRef = cloneElement(childElement, {
    ...childElement.props,
    ref: parentRef as RefObject<HTMLElement>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as React.DetailedReactHTMLElement<any, HTMLElement>);

  return (
    <Fragment>
      {isTruncated ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{elementWithRef}</TooltipTrigger>
            <TooltipContent className="max-w-xs sm:max-w-[80px] md:max-w-md lg:max-w-lg xl:max-w-xl">
              <p className="whitespace-normal max-w-none sm:max-w-40 break-words">{text}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        elementWithRef
      )}
    </Fragment>
  );
};
