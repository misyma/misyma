import { z } from 'zod';
import {
  updateBookshelfSchema,
  useUpdateBookshelfMutation,
} from '../api/mutations/updateBookshelfMutation/updateBookshelfMutation';
import { useUploadBookshelfImageMutation } from '../api/mutations/uploadBookshelfImageMutation/uploadBookshelfImageMutation';
import { useToast } from '../../common/components/toast/use-toast';

export const updateBookshelfWithImageSchema = updateBookshelfSchema.extend({
  image: z.object({}).or(z.undefined()),
});

export type UpdateBookshelfWithImageSchema = z.infer<typeof updateBookshelfWithImageSchema>;

export type UpdatePayload = UpdateBookshelfWithImageSchema & { bookshelfId: string };

interface UseUpdateBookshelfProps {
  bookshelfName: string;
  onSuccess: () => void;
}
export const useUpdateBookshelf = ({ bookshelfName, onSuccess }: UseUpdateBookshelfProps) => {
  const { toast } = useToast();

  const { mutateAsync: updateBookshelf, isPending: isUpdatePending } = useUpdateBookshelfMutation({});
  const { mutateAsync: uploadBookshelfImage, isPending: isImagePending } = useUploadBookshelfImageMutation({});

  const isProcessing = isUpdatePending || isImagePending;

  const update = async (props: UpdatePayload) => {
    if (props.name && props.name.length > 0) {
      try {
        await updateBookshelf({
          name: props.name,
          bookshelfId: props.bookshelfId,
        });
      } catch {
        return;
      }
    }

    if (props.image) {
      try {
        await uploadBookshelfImage({
          bookshelfId: props.bookshelfId,
          file: props.image as File,
          errorHandling: {
            title: 'Coś poszło nie tak z dodawaniem obrazka półki.',
          },
        });
      } catch {
        return;
      }
    }

    onSuccess();

    if (!props.name && !props.image) {
      return;
    }

    toast({
      title: `Półka: ${props.name || bookshelfName} została zaktualizowana :)`,
      variant: 'success',
    });
  };

  return {
    update,
    isProcessing,
  };
};
