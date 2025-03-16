import { type FC, useState } from 'react';

import LanguageSelect from '../../../book/components/molecules/languageSelect/languageSelect';
import { type FilterComponentProps } from '../../types/filter';
import { FilterContainer } from '../filter/filterContainer';

export const SearchLanguageSelect: FC<FilterComponentProps> = ({
  filter,
  initialValue,
  onRemoveFilter,
  setFilterAction,
}) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (value: string) => {
    setValue(value);

    setFilterAction(value);
  };

  return (
    <FilterContainer
      filter={filter}
      hasValue={!!value}
      slot={
        <LanguageSelect
          fullWidthAll
          key={initialValue}
          type="free"
          selectorValue={value}
          onValueChange={handleChange}
        />
      }
      onRemoveFilter={onRemoveFilter}
    ></FilterContainer>
  );
};
