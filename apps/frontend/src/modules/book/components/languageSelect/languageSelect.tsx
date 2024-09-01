import { ControllerRenderProps } from 'react-hook-form';
import { FC, memo, useState } from 'react';
import { Languages } from '../../../common/constants/languages';
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
