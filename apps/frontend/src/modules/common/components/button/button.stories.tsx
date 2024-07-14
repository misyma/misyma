import { Meta } from '@storybook/react';
import { Button, ButtonVariant } from './button';
import { FC, ReactNode } from 'react';

const meta: Meta<typeof Button> = {
  component: Button,
};

export default meta;

export const Default: FC<{ variant?: ButtonVariant }> = ({ variant = 'default' }) => {
  return (
    <div className="flex flex-col gap-2">
      <Button
        variant={variant}
        size="icon"
      >
        Click
      </Button>
      <Button
        variant={variant}
        size="sm"
      >
        Click
      </Button>
      <Button
        variant={variant}
        size="base"
      >
        Click
      </Button>
      <Button
        variant={variant}
        size="lg"
      >
        Click
      </Button>
    </div>
  );
};

export const Outline = (): ReactNode => {
  return <Default variant={'outline'} />;
};

export const Secondary = (): ReactNode => {
  return <Default variant="secondary" />;
};

export const Ghost = (): ReactNode => {
  return <Default variant="ghost" />;
};

export const Link = (): ReactNode => {
  return <Default variant="link" />;
};

export const Destructive = (): ReactNode => {
  return <Default variant="destructive" />;
};

export const All = (): ReactNode => {
  return (
    <div className="flex w-20 gap-4">
      <Default></Default>
      <Outline></Outline>
      <Secondary></Secondary>
      <Ghost></Ghost>
      <Link></Link>
      <Destructive></Destructive>
    </div>
  );
};
