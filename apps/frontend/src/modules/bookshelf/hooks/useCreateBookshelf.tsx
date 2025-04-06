import { z } from 'zod';
import { useToast } from '../../common/components/toast/use-toast';
import {
  createBookshelfSchema,
  useCreateBookshelfMutation,
} from '../api/mutations/createBookshelfMutation/createBookshelfMutation';
import { useUploadBookshelfImageMutation } from '../api/mutations/uploadBookshelfImageMutation/uploadBookshelfImageMutation';

export const createBookshelfWithImageSchema = createBookshelfSchema.extend({
  // todo: Add some Zod type for Files
  image: z.object({}).or(z.undefined()),
});

export type CreateBookshelfWithImageSchema = z.infer<typeof createBookshelfWithImageSchema>;

interface CreateBookshelfProps {
  onSuccess: () => void;
}
export const useCreateBookshelf = ({ onSuccess }: CreateBookshelfProps) => {
  const { toast } = useToast();

  const { mutateAsync: createBookshelf, isPending: isCreationPending } = useCreateBookshelfMutation({});

  const { mutateAsync: uploadBookshelfImage, isPending: isImagePending } = useUploadBookshelfImageMutation({});

  const isProcessing = isCreationPending || isImagePending;

  const create = async (props: CreateBookshelfWithImageSchema) => {
    let bookshelfId = '';
    try {
      const res = await createBookshelf({
        name: props.name,
      });
      bookshelfId = res.id;

      toast({
        title: `Półka: ${props.name} została stworzona :)`,
        variant: 'success',
      });
    } catch {
      return;
    }

    if (props.image && bookshelfId) {
      try {
        await uploadBookshelfImage({
          bookshelfId,
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
  };

  return {
    create,
    isProcessing,
  };
};
