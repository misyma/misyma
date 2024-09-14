import { ControllerRenderProps } from 'react-hook-form';
import { FC, memo, useState } from 'react';
import {
  Languages,
  LanguagesValues,
  ReversedLanguages,
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

interface BaseLanguageSelectProps {
  onValueChange?: (val: string) => void;
  dialog?: boolean;
  selectorValue?: string;
  type?: 'form' | 'free';

  className?: string;
}

interface FormLanguageSelectProps
  extends ControllerRenderProps,
    BaseLanguageSelectProps {
  type: 'form';
}

type LanguageSelectProps = BaseLanguageSelectProps | FormLanguageSelectProps;

const LanguageSelect: FC<LanguageSelectProps> = ({
  onValueChange,
  dialog = false,
  type = 'form',
  selectorValue,
  className,
  ...field
}) => {
  const [languageSelectOpen, setLanguageSelectOpen] = useState(false);

  console.log('In ls: ', selectorValue);

  const selectContent = (
    <SelectTrigger className={className}>
      {ReversedLanguages[selectorValue as keyof typeof ReversedLanguages] ||
        ReversedLanguages[
          // eslint-disable-next-line
          (field as any)?.value as keyof typeof ReversedLanguages
        ]}
      <SelectValue
        asChild
        className={className}
        placeholder={<span className="text-muted-foreground">Język</span>}
      ></SelectValue>
      {!dialog && (
        <SelectContent className={className}>
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
  );

  return (
    <Select
      open={languageSelectOpen}
      onOpenChange={setLanguageSelectOpen}
      onValueChange={(val) => {
        if (onValueChange) {
          onValueChange(val);
        }

        if (field && 'onChange' in field) {
          field.onChange(val);
        }
      }}
      // todo: fix type later
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      defaultValue={type === 'form' ? (field as any).value : selectorValue}
      // todo: fix type later
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value={type === 'form' ? (field as any).value : selectorValue}
    >
      {type === 'form' ? (
        <FormControl>{selectContent}</FormControl>
      ) : (
        selectContent
      )}
    </Select>
  );
};

export default memo(LanguageSelect);
