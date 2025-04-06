import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, type FC } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '../../../../common/components/button/button';
import { Dialog, DialogContent } from '../../../../common/components/dialog/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../common/components/form/form';
import { FileInput, Input } from '../../../../common/components/input/input';
import { LoadingSpinner } from '../../../../common/components/spinner/loading-spinner';
import useDebounce from '../../../../common/hooks/useDebounce';
import { useFileUpload } from '../../../../common/hooks/useFileUpload';
import { updateBookshelfSchema } from '../../../api/mutations/updateBookshelfMutation/updateBookshelfMutation';
import { useUpdateBookshelf } from '../../../hooks/useUpdateBookshelf';

interface Props {
  bookshelfId: string;
  bookshelfName: string;
  onCloseModal: () => void;
  open: boolean;
}

export const UpdateBookshelfModal: FC<Props> = ({ bookshelfId, bookshelfName, open, onCloseModal }: Props) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { file, setFile } = useFileUpload({
    fileInputRef,
  });

  const form = useForm({
    resolver: zodResolver(updateBookshelfSchema),
    defaultValues: {
      image: file,
      name: '',
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  const { update, isProcessing: isProcessingBase } = useUpdateBookshelf({
    bookshelfName,
    onSuccess: () => onCloseModal(),
  });

  const isProcessing = useDebounce(isProcessingBase, 300);

  const onSubmit = async (props: z.infer<typeof updateBookshelfSchema>) => {
    await update({
      ...props,
      bookshelfId,
      image: file,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        onCloseModal();
        setFile(undefined);
        form.reset();
      }}
    >
      <DialogContent
        style={{
          borderRadius: '40px',
        }}
        className="max-w-sm sm:max-w-xl py-16 flex flex-col items-center gap-8"
        omitCloseButton={true}
      >
        <p className="font-bold text-lg">Edytuj półkę</p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nazwa"
                      type="text"
                      maxLength={64}
                      includeQuill={false}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>
                    <span>Obrazek</span>
                  </FormLabel>
                  <FormControl>
                    <FileInput
                      {...fieldProps}
                      type="file"
                      accept="image/jpeg"
                      fileName={(value as unknown as File)?.name}
                      onChange={(event) => {
                        onChange(event.target.files && event.target.files[0]);

                        setFile(event.target.files ? (event.target?.files[0] ?? undefined) : undefined);
                      }}
                      ref={fileInputRef}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex w-full gap-4 justify-end">
              <Button
                size="lg"
                variant={isProcessing ? 'ghost' : 'default'}
                disabled={!form.formState.isValid || isProcessing || !form.formState.isDirty}
                type="submit"
              >
                {isProcessing && <LoadingSpinner size={40} />}
                {!isProcessing && <>Edytuj półkę</>}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
