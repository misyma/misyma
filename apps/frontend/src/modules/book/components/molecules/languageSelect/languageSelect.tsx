import { type FC, memo, useState } from 'react';
import { type ControllerRenderProps } from 'react-hook-form';

import { languages } from '@common/contracts';

import { FormControl } from '../../../../common/components/form/form';
import {
  Select,
  SelectContent,
  SelectContentNoPortal,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../common/components/select/select';
import { Languages, LanguagesValues, ReversedLanguages } from '../../../../common/constants/languages';
import { cn } from '../../../../common/lib/utils';

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
    [LanguagesValues.Holenderski, Languages.Dutch],
    [LanguagesValues.Szwedzki, Languages.Swedish],
    [LanguagesValues.Rosyjski, Languages.Russian],
  ];

  const sortedLanguages = Object.entries(Languages).filter(([key]) => !customSortOrder.find(([lang]) => key === lang));

  return [...customSortOrder, ...sortedLanguages].map(([key, language]) => (
    <SelectItem
      key={`language-${key}-${language}`}
      value={languages[key as keyof typeof languages]}
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
  fullWidthAll?: boolean;
}

interface FormLanguageSelectProps extends ControllerRenderProps, BaseLanguageSelectProps {
  type: 'form';
}

type LanguageSelectProps = BaseLanguageSelectProps | FormLanguageSelectProps;

const LanguageSelect: FC<LanguageSelectProps> = ({
  onValueChange,
  dialog = false,
  type = 'form',
  selectorValue,
  className,
  fullWidthAll,

  ...field
}) => {
  const [languageSelectOpen, setLanguageSelectOpen] = useState(false);

  const selectContent = (
    <SelectTrigger className={cn(className, fullWidthAll ? 'w-full sm:w-full' : '')}>
      {ReversedLanguages[selectorValue as keyof typeof ReversedLanguages] ||
        ReversedLanguages[
          // eslint-disable-next-line
          (field as any)?.value as keyof typeof ReversedLanguages
        ]}
      {!selectorValue && !(field as ControllerRenderProps)?.value && (
        <span className="text-muted-foreground">Język</span>
      )}
      <SelectValue
        asChild
        className={className}
      ></SelectValue>
      {!dialog && (
        <SelectContent className={className}>
          {<MemoizedLanguagesList setLanguageSelectOpen={setLanguageSelectOpen} />}
        </SelectContent>
      )}
      {dialog && (
        <SelectContentNoPortal>
          {<MemoizedLanguagesList setLanguageSelectOpen={setLanguageSelectOpen} />}
        </SelectContentNoPortal>
      )}
    </SelectTrigger>
  );

  return (
    <Select
      className={fullWidthAll ? 'w-full sm:w-full' : ''}
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
      defaultValue={type === 'form' ? (field as ControllerRenderProps)?.value : selectorValue}
      value={type === 'form' ? (field as ControllerRenderProps)?.value : selectorValue}
    >
      {type === 'form' ? <FormControl>{selectContent}</FormControl> : selectContent}
    </Select>
  );
};

export default memo(LanguageSelect);
