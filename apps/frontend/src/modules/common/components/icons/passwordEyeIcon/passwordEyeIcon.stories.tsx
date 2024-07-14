import { Meta } from '@storybook/react';
import { PasswordEyeIcon } from './passwordEyeIcon';
import { ReactNode, useState } from 'react';

const meta: Meta<typeof PasswordEyeIcon> = {
  component: PasswordEyeIcon,
};

export default meta;

export const Hidden = (): ReactNode => (
  <PasswordEyeIcon
    onClick={() => {}}
    passwordType="password"
  ></PasswordEyeIcon>
);

export const Visible = (): ReactNode => (
  <PasswordEyeIcon
    onClick={() => {}}
    passwordType="text"
  ></PasswordEyeIcon>
);

export const Clickable = (): ReactNode => {
  const [passwordType, setPasswordType] = useState<'password' | 'text'>('password');

  const onClick = () => {
    if (passwordType === 'password') {
      setPasswordType('text');
    } else {
      setPasswordType('password');
    }
  };

  return (
    <PasswordEyeIcon
      passwordType={passwordType}
      onClick={onClick}
    ></PasswordEyeIcon>
  );
};
