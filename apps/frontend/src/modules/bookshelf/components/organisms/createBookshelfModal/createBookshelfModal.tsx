import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState, type FC } from 'react';
import { useForm } from 'react-hook-form';
import { HiPlus } from 'react-icons/hi2';

import { Button } from '../../../../common/components/button/button';
import { Dialog, DialogContent, DialogTrigger } from '../../../../common/components/dialog/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../../common/components/form/form';
import { ImageFileInput, Input } from '../../../../common/components/input/input';
import { LoadingSpinner } from '../../../../common/components/spinner/loading-spinner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../../common/components/tooltip/tooltip';
import useDebounce from '../../../../common/hooks/useDebounce';
import { useFileUpload } from '../../../../common/hooks/useFileUpload';
import { cn } from '../../../../common/lib/utils';
import {
  CreateBookshelfWithImageSchema,
  createBookshelfWithImageSchema,
  useCreateBookshelf,
} from '../../../hooks/useCreateBookshelf';

export const CreateBookshelfModal: FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { file, setFile } = useFileUpload({
    fileInputRef,
  });

  const form = useForm({
    resolver: zodResolver(createBookshelfWithImageSchema),
    defaultValues: {
      image: file,
      name: '',
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  const { create, isProcessing: isProcessingBase } = useCreateBookshelf({
    onSuccess: () => {
      setIsOpen(false);
      form.reset();
    },
  });

  const isProcessing = useDebounce(isProcessingBase, 300);

  const onSubmit = async (props: CreateBookshelfWithImageSchema) => {
    await create({
      ...props,
      image: file,
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        setIsOpen(val);
        setFile(undefined);
        form.reset();
      }}
    >
      <DialogTrigger asChild>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsOpen(true)}
                size="big-icon"
              >
                <HiPlus className={cn('h-8 w-8 cursor-pointer')} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Stwórz półkę</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>
      <DialogContent
        style={{
          borderRadius: '40px',
        }}
        className="max-w-sm sm:max-w-xl py-16 flex flex-col items-center gap-8"
        omitCloseButton={true}
      >
        <p className="font-bold text-lg">Stwórz półkę</p>
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
                    <span>Obrazek</span> <span className="text-gray-500">(opcjonalne)</span>
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
                disabled={!form.formState.isValid || isProcessing}
                type="submit"
              >
                {isProcessing && <LoadingSpinner size={40} />}
                {!isProcessing && <>Dodaj półkę</>}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
