import { type FC } from 'react';
import { HiTrash } from 'react-icons/hi2';

import { useDynamicFilterContext } from '../../contexts/dynamicFilterContext';
import { Button } from '../button/button';

export const RemoveFilterButton: FC<{
  filterKey: PropertyKey;
  onRemoveFilter?: (name: string) => void;
}> = ({ filterKey, onRemoveFilter }) => {
  const { removeFilter } = useDynamicFilterContext();

  const onRemove = () => {
    removeFilter(filterKey);

    if (onRemoveFilter) {
      onRemoveFilter(filterKey as string);
    }
  };

  return (
    <Button
      size="big-icon"
      variant="outline"
      onClick={onRemove}
    >
      <HiTrash className="w-8 h-8"></HiTrash>
    </Button>
  );
};
