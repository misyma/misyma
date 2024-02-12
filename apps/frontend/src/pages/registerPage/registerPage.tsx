import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useNavigate } from 'react-router-dom';

const formSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8).max(50),
    repeatedPassword: z.string().min(8).max(50),
  })
  .superRefine(({ repeatedPassword, password }, context) => {
    if (repeatedPassword !== password) {
      context.addIssue({
        code: 'custom',
        message: 'The passwords do not match.',
        path: ['repeatedPassword'],
      });
    }
  });

export const RegisterPage: FC = () => {
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      repeatedPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);

    const registerUserResponse = await fetch('https://api.misyma.com/api/users/register', {
      body: JSON.stringify({
        email: values.email,
        password: values.password,
        firstName: 'To remove',
        lastName: 'To remove',
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (registerUserResponse.status === 201) {
      navigate('/login');
    }
  };

  return (
    <>
      <div className="flex items-center justify-center h-screen">
        <div className="flex gap-16 w-[1000px]">
          <div className="flex-1 p-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Email"
                          className="w-80"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Haslo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Haslo"
                          type="password"
                          className="w-80"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="repeatedPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Powtorz haslo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Haslo"
                          type="password"
                          className="w-80"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-80 border-black border border-black hover:bg-white bg-white text-primary"
                >
                  Zarejestruj sie
                </Button>
              </form>
            </Form>
          </div>
          <div className="flex-1 flex justify-center">
            <img
              src="https://source.unsplash.com/1600x900/?nature,water"
              alt="Nature"
              className="w-70 h-96 object-cover"
            />
          </div>
        </div>
      </div>
    </>
  );
};
