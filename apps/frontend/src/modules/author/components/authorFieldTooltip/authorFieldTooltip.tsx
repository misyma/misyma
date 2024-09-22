import { HiOutlineInformationCircle } from 'react-icons/hi2';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../common/components/tooltip/tooltip';
import { FC } from 'react';

interface AuthorFieldTooltipProps {
  side?: 'bottom' | 'left' | 'right' | 'top';
}
export const AuthorFieldTooltip: FC<AuthorFieldTooltipProps> = ({
  side = 'top',
}) => {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <HiOutlineInformationCircle className="h-5 w-5" />
          </div>
        </TooltipTrigger>
        <TooltipContent side={side}>
          <p>
            Imię i nazwisko autora musi mieć minimum 3 znaki
            <br></br> i zawierać spację oddzielającą imię i nazwisko.{' '}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
