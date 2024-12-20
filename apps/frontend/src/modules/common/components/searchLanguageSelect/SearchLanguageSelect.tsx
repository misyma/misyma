import { FC, useState } from 'react';
import { FilterComponentProps } from '../../types/filter';
import { FilterContainer } from '../filter/filterContainer';
import LanguageSelect from '../../../book/components/languageSelect/languageSelect';

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
      slot={
        <LanguageSelect
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
