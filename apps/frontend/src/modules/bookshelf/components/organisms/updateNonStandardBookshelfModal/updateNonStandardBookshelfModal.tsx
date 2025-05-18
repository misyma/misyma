import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRef, type FC } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '../../../../common/components/button/button.js';
import { Dialog, DialogContent } from '../../../../common/components/dialog/dialog.js';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../common/components/form/form.js';
import { ImageFileInput } from '../../../../common/components/input/input.js';
import { LoadingSpinner } from '../../../../common/components/spinner/loading-spinner.js';
import { useToast } from '../../../../common/components/toast/use-toast.js';
import useDebounce from '../../../../common/hooks/useDebounce.js';
import { useFileUpload } from '../../../../common/hooks/useFileUpload.js';
import { useUploadBookshelfImageMutation } from '../../../api/mutations/uploadBookshelfImageMutation/uploadBookshelfImageMutation.js';
import { BookshelvesApiQueryKeys } from '../../../api/queries/bookshelvesApiQueryKeys.js';

const updateNonStandardBookshelfFormSchema = z.object({
  image: z.object({}).or(z.undefined()),
});

interface Props {
  bookshelfId: string;
  bookshelfName: string;
  onCloseModal: () => void;
  open: boolean;
}

export const UpdateNonStandardBookshelfModal: FC<Props> = ({
  bookshelfId,
  bookshelfName,
  open,
  onCloseModal,
}: Props) => {
  const queryClient = useQueryClient();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { file, setFile } = useFileUpload({
    fileInputRef,
  });

  const form = useForm({
    resolver: zodResolver(updateNonStandardBookshelfFormSchema),
    defaultValues: {
      image: file,
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  const { mutateAsync: uploadBookshelfImage, isPending: isImagePending } = useUploadBookshelfImageMutation({});

  const isProcessing = useDebounce(isImagePending, 300);

  const { toast } = useToast();

  const onSubmit = async () => {
    if (file) {
      try {
        await uploadBookshelfImage({
          bookshelfId,
          file,
          errorHandling: {
            title: 'Coś poszło nie tak z wysyłaniem obrazka półki.',
          },
        });
      } catch {
        return;
      }
    }

    await queryClient.invalidateQueries({
      predicate: ({ queryKey }) => queryKey[0] === BookshelvesApiQueryKeys.findUserBookshelfs,
    });

    onCloseModal();

    toast({
      title: `Półka: ${bookshelfName} została zaktualizowana :)`,
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
              name="image"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>
                    <span>Obrazek</span>
                  </FormLabel>
                  <FormControl>
                    <ImageFileInput
                      {...fieldProps}
                      type="file"
                      fileName={(value as unknown as File)?.name}
                      onFileInput={(file) => {
                        onChange(file);
                        setFile(file ?? undefined);
                      }}
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
