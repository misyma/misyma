import { type FC } from 'react';

import { TruncatedTextTooltip } from '../../../book/components/truncatedTextTooltip/truncatedTextTooltip';

export const BookTitle: FC<{ title: string }> = ({ title }) => {
  return (
    <TruncatedTextTooltip
      className="sm:max-w-80"
      tooltipClassName="sm:max-w-80"
      text={title ?? ''}
    >
      <p className="font-semibold text-3xl min-w-0 sm:max-w-80 md:max-w-[25rem] lg:max-w-[60rem] flex-shrink w-full block truncate">
        {title}
      </p>
    </TruncatedTextTooltip>
  );
};
