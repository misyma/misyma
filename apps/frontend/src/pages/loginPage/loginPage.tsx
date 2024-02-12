import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useStoreDispatch } from '../../core/store/hooks/useStoreDispatch';
import { userStateActions } from '../../core/store/states/userState/userStateSlice';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(50),
});

export const LoginPage: FC = () => {
  const storeDispatch = useStoreDispatch();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);

    const loginUserResponse = await fetch('https://api.misyma.com/api/users/login', {
      body: JSON.stringify({
        email: values.email,
        password: values.password,
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const loginUserResponseBody = await loginUserResponse.json();

    const { refreshToken, accessToken } = loginUserResponseBody;

    const getUserResponse = await fetch('https://api.misyma.com/api/users/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const getUserResponseBody = await getUserResponse.json();

    const { id, email } = getUserResponseBody;

    storeDispatch(
      userStateActions.setCurrentUser({
        refreshToken,
        accessToken,
        user: {
          id,
          email,
        },
      }),
    );
  };

  return (
    <>
      <div className="flex items-center justify-center h-screen">
        <div className="flex gap-16 w-[1000px]">
          <div className="flex-1 p-8">
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
                <Button
                  type="submit"
                  className="w-80 border-black border border-black hover:bg-white bg-white text-primary"
                >
                  Zaloguj sie
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
