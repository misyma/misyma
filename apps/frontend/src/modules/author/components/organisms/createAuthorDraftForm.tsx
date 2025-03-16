import { zodResolver } from '@hookform/resolvers/zod';
import { type FC } from 'react';
import { useForm } from 'react-hook-form';
import { type z } from 'zod';

import { AuthorFieldTooltip } from './authorFieldTooltip';
import { Button } from '../../../common/components/button/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../common/components/form/form';
import { Input } from '../../../common/components/input/input';
import { createAuthorDraftSchema } from '../../schemas/createAuthorDraftSchema';

interface CreateAuthorDraftFormProps {
  onCreateAuthorDraft: (payload: z.infer<typeof createAuthorDraftSchema>) => void;
  initialName?: string;
}
export const CreateAuthorDraftForm: FC<CreateAuthorDraftFormProps> = ({ onCreateAuthorDraft, initialName }) => {
  const createAuthorDraftForm = useForm({
    resolver: zodResolver(createAuthorDraftSchema),
    values: {
      name: initialName || '',
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  return (
    <Form {...createAuthorDraftForm}>
      <form
        className="flex flex-col gap-8 py-4"
        onSubmit={createAuthorDraftForm.handleSubmit(onCreateAuthorDraft)}
      >
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <div className="flex gap-2 items-center pb-1">
                <FormLabel>Imię i nazwisko</FormLabel>
                <AuthorFieldTooltip side="bottom" />
              </div>
              <FormControl>
                <Input
                  min={1}
                  max={128}
                  type="text"
                  {...field}
                />
              </FormControl>
              <FormMessage></FormMessage>
            </FormItem>
          )}
        />
        <Button
          disabled={!createAuthorDraftForm.formState.isValid}
          type="button"
          onClick={() => onCreateAuthorDraft(createAuthorDraftForm.getValues())}
        >
          Stwórz
        </Button>
      </form>
    </Form>
  );
};
