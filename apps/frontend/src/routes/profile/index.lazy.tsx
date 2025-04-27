import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { type FindUserResponseBody } from '@common/contracts';

import { AuthenticatedLayout } from '../../modules/auth/layouts/authenticated/authenticatedLayout';
import { Button } from '../../modules/common/components/button/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../modules/common/components/form/form';
import { PasswordEyeIcon } from '../../modules/common/components/icons/passwordEyeIcon/passwordEyeIcon';
import { Input } from '../../modules/common/components/input/input';
import { LoadingSpinner } from '../../modules/common/components/spinner/loading-spinner';
import { useToast } from '../../modules/common/components/toast/use-toast';
import { RequireAuthComponent } from '../../modules/core/components/requireAuth/requireAuthComponent';
import { useChangeUserPasswordMutation } from '../../modules/user/api/mutations/changeUserPassword/changeUserPasswordMutation';
import { useUpdateUserMutation } from '../../modules/user/api/mutations/updateUser/updateUserMutation';
import { useFindUserQuery } from '../../modules/user/api/queries/findUserQuery/findUserQuery';
import { UserApiQueryKeys } from '../../modules/user/api/queries/userApiQueryKeys';
import {
  nameSchema,
  nameSuperRefine,
  passwordSchema,
  passwordSuperRefine,
} from '../../modules/common/schemas/userSchemas';

const changeUserDataFormSchema = z
  .object({
    name: z.union([nameSchema, z.literal('')]),
    password: z.union([passwordSchema, z.literal('')]),
  })
  .superRefine((args, ctx) => {
    if (args.password === '') return;

    passwordSuperRefine(args, ctx);
  })
  .superRefine(nameSuperRefine);

interface FormProps {
  userData: FindUserResponseBody;
}

const ChangeUserDataForm = ({ userData }: FormProps) => {
  const queryClient = useQueryClient();

  const { toast } = useToast();

  const changeUserDataForm = useForm<z.infer<typeof changeUserDataFormSchema>>({
    resolver: zodResolver(changeUserDataFormSchema),
    defaultValues: {
      name: userData?.name,
      password: '',
    },
    reValidateMode: 'onChange',
    mode: 'onTouched',
  });

  const { isPending: isUserUpdatePending, mutateAsync: updateUser } = useUpdateUserMutation({});
  const { isPending: isChangeUserPasswordPending, mutateAsync: changePassword } = useChangeUserPasswordMutation({});

  const [passwordInputType, setPasswordInputType] = useState<'text' | 'password'>('password');

  const onSubmit = async (values: z.infer<typeof changeUserDataFormSchema>): Promise<void> => {
    if (values.name) {
      await updateUser({
        name: values.name,
        userId: userData.id,
      });

      if (!values.password) {
        await queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === UserApiQueryKeys.findUser,
        });

        changeUserDataForm.reset();

        toast({
          title: 'Twoje imię zostało zmienione :).',
          variant: 'success',
        });

        return;
      }
    }

    if (values.password) {
      await changePassword({
        password: values.password,
      });

      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === UserApiQueryKeys.findUser,
      });

      changeUserDataForm.reset();

      if (!values.name) {
        toast({
          title: 'Twoje hasło zostało zmienione :).',
          variant: 'success',
        });
      } else {
        toast({
          title: 'Twoje hasło oraz imię zostały zmienione :).',
          variant: 'success',
        });
      }
    }
  };

  return (
    <Form {...changeUserDataForm}>
      <form
        className="space-y-2"
        onSubmit={changeUserDataForm.handleSubmit(onSubmit)}
      >
        <FormField
          name="name"
          control={changeUserDataForm.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imię</FormLabel>
              <FormControl>
                <Input
                  placeholder="Imię"
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
          control={changeUserDataForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hasło</FormLabel>
              <FormControl>
                <Input
                  placeholder="Hasło"
                  maxLength={64}
                  type={passwordInputType}
                  includeQuill={false}
                  otherIcon={
                    <PasswordEyeIcon
                      onClick={() => setPasswordInputType(passwordInputType === 'password' ? 'text' : 'password')}
                      passwordType={passwordInputType}
                    />
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          disabled={
            !changeUserDataForm.formState.isDirty ||
            !changeUserDataForm.formState.isValid ||
            isUserUpdatePending ||
            isChangeUserPasswordPending
          }
        >
          {!isUserUpdatePending && !isChangeUserPasswordPending && <>Zapisz</>}
          {(isUserUpdatePending || isChangeUserPasswordPending) && <LoadingSpinner size={40} />}
        </Button>
      </form>
    </Form>
  );
};

export const ProfilePage = () => {
  const { data: userData, isFetched: isUserDataFetched } = useFindUserQuery();

  if (!isUserDataFetched) {
    return (
      <AuthenticatedLayout>
        <LoadingSpinner />
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="flex items-center justify-center w-full px-8 gap-4">
        <div className="grid gap-4 items-center justify-items-center w-full">
          <div className="flex flex-col px-8 gap-4">
            <div className="font-bold text-primary">Dane profilu</div>
            <ChangeUserDataForm userData={userData as FindUserResponseBody} />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export const Route = createFileRoute('/profile/')({
  component: () => {
    return (
      <RequireAuthComponent>
        <ProfilePage />
      </RequireAuthComponent>
    );
  },
});
