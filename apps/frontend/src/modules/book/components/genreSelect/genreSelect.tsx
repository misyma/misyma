import { FC, memo, useState } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectContentNoPortal,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../common/components/select/select';
import { FormControl } from '../../../common/components/form/form';
import { Genre } from '@common/contracts';

interface GenreSelectProps extends ControllerRenderProps {
  onValueChange: (val: string) => void;
  genres: Genre[];
  dialog?: boolean;
}

const GenreSelect: FC<GenreSelectProps> = ({
  onValueChange,
  genres,
  dialog = false,
  ...field
}) => {
  const [genreSelectOpen, setGenreSelectOpen] = useState(false);

  return (
    <Select
      open={genreSelectOpen}
      onOpenChange={setGenreSelectOpen}
      onValueChange={(val) => {
        onValueChange(val);

        field.onChange(val);
      }}
      defaultValue={field.value}
    >
      <FormControl>
        <SelectTrigger>
          <SelectValue
            placeholder={
              <span className="text-muted-foreground">Kategoria</span>
            }
          />
          {dialog && (
            <SelectContentNoPortal>
              {Object.values(genres ?? []).map((genre) => (
                <SelectItem
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      setGenreSelectOpen(false);
                    }
                  }}
                  value={genre.id}
                >
                  {genre.name}
                </SelectItem>
              ))}
            </SelectContentNoPortal>
          )}
          {!dialog && (
            <SelectContent>
              {Object.values(genres ?? []).map((genre) => (
                <SelectItem
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      setGenreSelectOpen(false);
                    }
                  }}
                  value={genre.id}
                >
                  {genre.name}
                </SelectItem>
              ))}
            </SelectContent>
          )}
        </SelectTrigger>
      </FormControl>
    </Select>
  );
};

export default memo(GenreSelect);
