import { FC } from 'react';
import { Dialog, DialogContent, DialogHeader } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../../components/ui/form';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { AddReadingSchemaValues, addReadingSchema } from './schema/addReadingSchema';

interface Props {
  open: boolean;
  setOpenChange: (open: boolean) => void;
  onSubmit: (values: AddReadingSchemaValues) => void | Promise<void>;
}

export const AddReadingModal: FC<Props> = ({ open, setOpenChange, onSubmit }: Props) => {
  const form = useForm<AddReadingSchemaValues>({
    resolver: zodResolver(addReadingSchema),
    defaultValues: {
      comment: '',
      endedAt: new Date().toISOString(),
    },
    mode: 'onTouched',
  });

  // TODO: Replace input: date with a DatePicker Component for more granular control

  return (
    <Dialog
      open={open}
      onOpenChange={(open: boolean) => {
        form.reset();

        setOpenChange(open)
      }}
    >
      <DialogContent className="rounded-md w-11/12 sm:w-full">
        <DialogHeader>
          <h1 className="font-logo-bold text-2xl">Dodaj ocenę książki</h1>
        </DialogHeader>
        <div className="p-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-2"
            >
              <FormField
                control={form.control}
                name="startedAt"
                render={({ field }) => (
                  <FormItem className="h-[5.5rem]">
                    <FormLabel>Czytanie rozpoczęte dnia...</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
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
                name="endedAt"
                render={({ field }) => (
                  <FormItem className="h-[5.5rem]">
                    <FormLabel>Czytanie zakończone dnia...</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
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
                name="rating"
                render={({ field }) => (
                  <FormItem className="h-[5.5rem]">
                    <FormLabel>Ocena</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={10}
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
                name="comment"
                render={({ field }) => (
                  <FormItem className="h-[5.5rem]">
                    <FormLabel>Komentarz</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us a little bit about yourself"
                        className="resize-none bg-[#D1D5DB]/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="py-4 justify-self-end w-full grid">
                <Button
                  className="w-full justify-self-end sm:w-32 sm:h-12 border-primary border"
                  type="submit"
                  disabled={!form.formState.isValid}
                >
                  Add
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
