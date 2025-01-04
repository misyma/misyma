import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { z } from 'zod';

import { type FindUserResponseBody } from '@common/contracts';

import { AuthenticatedLayout } from '../../modules/auth/layouts/authenticated/authenticatedLayout';
import { Button } from '../../modules/common/components/button/button';
import { Form, FormField, FormItem, FormMessage } from '../../modules/common/components/form/form';
import { PasswordEyeIcon } from '../../modules/common/components/icons/passwordEyeIcon/passwordEyeIcon';
import { Input } from '../../modules/common/components/input/input';
import { Label } from '../../modules/common/components/label/label';
import { LoadingSpinner } from '../../modules/common/components/spinner/loading-spinner';
import { useToast } from '../../modules/common/components/toast/use-toast';
import { RequireAuthComponent } from '../../modules/core/components/requireAuth/requireAuthComponent';
import { userStateSelectors } from '../../modules/core/store/states/userState/userStateSlice';
import { useChangeUserPasswordMutation } from '../../modules/user/api/mutations/changeUserPassword/changeUserPasswordMutation';
import { useUpdateUserMutation } from '../../modules/user/api/mutations/updateUser/updateUserMutation';
import { useFindUserQuery } from '../../modules/user/api/queries/findUserQuery/findUserQuery';
import { UserApiQueryKeys } from '../../modules/user/api/queries/userApiQueryKeys';

const changeUserDataFormSchema = z
  .object({
    name: z.union([
      z.string().min(2, 'Imię musi mieć minimum 2 znaki.').max(64, 'Imię może mieć maksymalnie 64 znaki.'),
      z.literal(''),
    ]),
    password: z.union([
      z
        .string({
          required_error: 'Wymagane.',
        })
        .min(8, 'Hasło musi mieć minimum 8 znaków.')
        .max(64, 'Hasło może mieć maksymalnie 64 znaki.'),
      z.literal(''),
    ]),
  })
  .superRefine(({ password }, ctx) => {
    if (password) {
      if (!/[0-9]/.test(password)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Hasło musi mieć minimum jedną cyfrę',
          path: ['password'],
        });
      }

      if (!/[A-Z]/.test(password)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Hasło musi mieć minimum jedną dużą literę',
          path: ['password'],
        });
      }

      if (!/[a-z]/.test(password)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Hasło musi mieć minimum jedną małą literę',
          path: ['password'],
        });
      }
    }
  });

interface FormProps {
  userData: FindUserResponseBody;
}

const ChangeUserDataForm = ({ userData }: FormProps) => {
  const accessToken = useSelector(userStateSelectors.selectAccessToken);

  const queryClient = useQueryClient();

  const { toast } = useToast();

  const changeUserDataForm = useForm<z.infer<typeof changeUserDataFormSchema>>({
    resolver: zodResolver(changeUserDataFormSchema),
    values: {
      name: userData?.name,
      password: '',
    },
    reValidateMode: 'onChange',
  });

  const { isPending: isUserUpdatePending, mutateAsync: updateUser } = useUpdateUserMutation({});

  const { isPending: isChangeUserPasswordPending, mutateAsync: changePassword } = useChangeUserPasswordMutation({});

  const [passwordInputType, setPasswordInputType] = useState<'text' | 'password'>('password');

  const onSubmit = async (values: z.infer<typeof changeUserDataFormSchema>): Promise<void> => {
    if (values.name) {
      await updateUser({
        accessToken: accessToken as string,
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
        accessToken: accessToken as string,
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

  const parseResult = useMemo(
    () => changeUserDataFormSchema.safeParse(changeUserDataForm.getValues()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [changeUserDataForm.getValues()],
  );

  return (
    <Form {...changeUserDataForm}>
      <form
        className="space-y-2"
        onSubmit={changeUserDataForm.handleSubmit(onSubmit)}
      >
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <Label>Imię</Label>
              <Input
                placeholder="Imię"
                maxLength={64}
                includeQuill={false}
                {...field}
              />
              <FormMessage>
                {!parseResult.success
                  ? parseResult.error.errors.find((error) => error.path.includes('name'))?.message
                  : null}
              </FormMessage>
            </FormItem>
          )}
        />
        <FormField
          name="password"
          render={({ field }) => (
            <FormItem>
              <Label>Hasło</Label>
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
              <FormMessage>
                {!parseResult.success
                  ? parseResult.error.errors.find((error) => error.path.includes('password'))?.message
                  : null}
              </FormMessage>
            </FormItem>
          )}
        />
        <Button disabled={!changeUserDataForm.formState.isDirty || isUserUpdatePending || isChangeUserPasswordPending}>
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
        <div className="flex flex-col px-8 gap-4">
          <div className="font-bold text-primary">Dane profilu</div>
          <ChangeUserDataForm userData={userData as FindUserResponseBody} />
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
