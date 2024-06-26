import { ControllerRenderProps } from 'react-hook-form';
import {
  BookCreationActionType,
  useBookCreationDispatch,
} from '../../../bookshelf/context/bookCreationContext/bookCreationContext';
import { FC, memo, useState } from 'react';
import { Languages } from '../../../common/constants/languages';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../common/components/ui/select';
import { FormControl } from '../../../common/components/ui/form';
import { Language } from '@common/contracts';

interface Props {
  setLanguageSelectOpen: (bool: boolean) => void | undefined;
}

const LanguagesList: FC<Props> = ({ setLanguageSelectOpen }) => {
  return Object.entries(Languages).map(([key, language]) => (
    <SelectItem
      // todo: potentially fix :)
      // eslint-disable-next-line
      // @ts-ignore
      value={Language[key]}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          setLanguageSelectOpen(false);
        }
      }}
    >
      {language}
    </SelectItem>
  ));
};

const MemoizedLanguagesList = memo(LanguagesList);

const LanguageSelect: FC<ControllerRenderProps> = (field) => {
  const dispatch = useBookCreationDispatch();

  const [languageSelectOpen, setLanguageSelectOpen] = useState(false);

  return (
    <Select
      open={languageSelectOpen}
      onOpenChange={setLanguageSelectOpen}
      onValueChange={(val) => {
        dispatch({
          type: BookCreationActionType.setLanguage,
          language: val as Languages,
        });

        field.onChange(val);
      }}
      defaultValue={field.value}
    >
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder={<span className="text-muted-foreground">Język</span>} />
          <SelectContent>{<MemoizedLanguagesList setLanguageSelectOpen={setLanguageSelectOpen} />}</SelectContent>
        </SelectTrigger>
      </FormControl>
    </Select>
  );
};

export default memo(LanguageSelect);
