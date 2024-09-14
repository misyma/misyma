import { FC } from 'react';
import { useDynamicFilterContext } from '../../contexts/dynamicFilterContext';
import { Button } from '../button/button';
import { HiTrash } from 'react-icons/hi2';

export const RemoveFilterButton: FC<{ filterId: string }> = ({ filterId }) => {
  const { removeFilter } = useDynamicFilterContext();

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
