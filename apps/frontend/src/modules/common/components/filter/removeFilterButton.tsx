import { FC } from 'react';
import { useFilterContext } from '../../contexts/filterContext';
import { Button } from '../button/button';
import { HiTrash } from 'react-icons/hi2';

export const RemoveFilterButton: FC<{ filterId: string }> = ({ filterId }) => {
  const { removeFilter } = useFilterContext();

  return (
    <Button
      size="big-icon"
      variant="outline"
      onClick={() => removeFilter(filterId)}
    >
      <HiTrash className="w-8 h-8"></HiTrash>
    </Button>
  );
};
