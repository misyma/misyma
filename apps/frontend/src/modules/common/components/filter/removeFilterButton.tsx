import { FC } from 'react';
import { useDynamicFilterContext } from '../../contexts/dynamicFilterContext';
import { Button } from '../button/button';
import { HiTrash } from 'react-icons/hi2';

export const RemoveFilterButton: FC<{ filterKey: PropertyKey }> = ({
  filterKey,
}) => {
  const { removeFilter } = useDynamicFilterContext();

  return (
    <Button
      size="big-icon"
      variant="outline"
      onClick={() => removeFilter(filterKey)}
    >
      <HiTrash className="w-8 h-8"></HiTrash>
    </Button>
  );
};
