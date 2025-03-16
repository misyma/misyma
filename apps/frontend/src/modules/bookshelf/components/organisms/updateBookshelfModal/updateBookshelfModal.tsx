import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, type FC } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '../../../../common/components/button/button';
import { Dialog, DialogContent } from '../../../../common/components/dialog/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../../common/components/form/form';
import { FileInput, Input } from '../../../../common/components/input/input';
import { LoadingSpinner } from '../../../../common/components/spinner/loading-spinner';
import { useToast } from '../../../../common/components/toast/use-toast';
import useDebounce from '../../../../common/hooks/useDebounce';
import { useFileUpload } from '../../../../common/hooks/useFileUpload';
import { useUpdateBookshelfMutation } from '../../../api/mutations/updateBookshelfMutation/updateBookshelfMutation';
import { useUploadBookshelfImageMutation } from '../../../api/mutations/uploadBookshelfImageMutation/uploadBookshelfImageMutation';

const updateBookshelfFormSchema = z.object({
  image: z.object({}).or(z.undefined()),
  name: z.string().max(64, 'Nazwa jest zbyt długa.').optional(),
});

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
    resolver: zodResolver(updateBookshelfFormSchema),
    defaultValues: {
      image: file,
      name: '',
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  const { mutateAsync: updateBookshelf, isPending: isUpdatePending } = useUpdateBookshelfMutation({});
  const { mutateAsync: uploadBookshelfImage, isPending: isImagePending } = useUploadBookshelfImageMutation({});

  const isProcessingBase = isUpdatePending || isImagePending;
  const isProcessing = useDebounce(isProcessingBase, 300);

  const { toast } = useToast();

  const onSubmit = async (props: z.infer<typeof updateBookshelfFormSchema>) => {
    if (props.name && props.name.length > 0) {
      try {
        await updateBookshelf({
          name: props.name,
          bookshelfId,
        });
      } catch (error) {
        return;
      }
    }

    if (file) {
      try {
        await uploadBookshelfImage({
          bookshelfId,
          file,
          errorHandling: {
            title: 'Coś poszło nie tak z wysyłaniem obrazka półki.',
          },
        });
      } catch (error) {
        return;
      }
    }

    onCloseModal();

    toast({
      title: `Półka: ${props.name || bookshelfName} została zaktualizowana :)`,
      variant: 'success',
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
