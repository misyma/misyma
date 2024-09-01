import { ControllerRenderProps } from 'react-hook-form';
import { FC, memo, useState } from 'react';
import {
  Languages,
  LanguagesValues,
} from '../../../common/constants/languages';
import {
  Select,
  SelectContent,
  SelectContentNoPortal,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../common/components/select/select';
import { FormControl } from '../../../common/components/form/form';
import { Language } from '@common/contracts';

interface Props {
  setLanguageSelectOpen: (bool: boolean) => void | undefined;
}

const LanguagesList: FC<Props> = ({ setLanguageSelectOpen }) => {
  const customSortOrder: Array<[string, string]> = [
    [LanguagesValues.Polski, Languages.Polish],
    [LanguagesValues.Angielski, Languages.English],
    [LanguagesValues.Hiszpański, Languages.Spanish],
    [LanguagesValues.Niemiecki, Languages.German],
    [LanguagesValues.Włoski, Languages.Italian],
    [LanguagesValues.Duński, Languages.Dutch],
    [LanguagesValues.Szwedzki, Languages.Swedish],
    [LanguagesValues.Rosyjski, Languages.Russian],
  ];

  const sortedLanguages = Object.entries(Languages).filter(
    ([key]) => !customSortOrder.find(([lang]) => key === lang)
  );

  console.log(sortedLanguages);

  return [...customSortOrder, ...sortedLanguages].map(([key, language]) => (
    <SelectItem
      value={Language[key as keyof typeof Language]}
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

interface LanguageSelectProps extends ControllerRenderProps {
  onValueChange?: (val: string) => void;
  dialog?: boolean;
}

const LanguageSelect: FC<LanguageSelectProps> = ({
  onValueChange,
  dialog = false,
  ...field
}) => {
  const [languageSelectOpen, setLanguageSelectOpen] = useState(false);

  return (
    <Select
      open={languageSelectOpen}
      onOpenChange={setLanguageSelectOpen}
      onValueChange={(val) => {
        if (onValueChange) {
          onValueChange(val);
        }

        field.onChange(val);
      }}
      defaultValue={field.value}
    >
      <FormControl>
        <SelectTrigger>
          <SelectValue
            placeholder={<span className="text-muted-foreground">Język</span>}
          />
          {!dialog && (
            <SelectContent>
              {
                <MemoizedLanguagesList
                  setLanguageSelectOpen={setLanguageSelectOpen}
                />
              }
            </SelectContent>
          )}
          {dialog && (
            <SelectContentNoPortal>
              {
                <MemoizedLanguagesList
                  setLanguageSelectOpen={setLanguageSelectOpen}
                />
              }
            </SelectContentNoPortal>
          )}
        </SelectTrigger>
      </FormControl>
    </Select>
  );
};

export default memo(LanguageSelect);
