import { type FC } from 'react';
import { HiOutlineInformationCircle } from 'react-icons/hi2';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../common/components/tooltip/tooltip';

interface AuthorFieldTooltipProps {
  side?: 'bottom' | 'left' | 'right' | 'top';
}
export const AuthorFieldTooltip: FC<AuthorFieldTooltipProps> = ({ side = 'top' }) => {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <HiOutlineInformationCircle
              aria-label="author information tooltip trigger"
              data-testid="authorInformationTooltipTrigger"
              className="h-5 w-5"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side={side}>
          <p aria-label="author information tooltip content">
            Imię i nazwisko autora musi mieć minimum 3 znaki
            <br></br> i zawierać spację oddzielającą imię i nazwisko.{' '}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
