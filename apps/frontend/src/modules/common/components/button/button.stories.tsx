import { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';
import { Button, ButtonProps, ButtonSize, ButtonVariant } from './button';
import { FC, ReactNode } from 'react';
import { cn } from '../../lib/utils';
const meta: Meta<typeof Button> = {
  component: Button,
};

export default meta;

type FontSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

export const Playground: StoryObj<
  ButtonProps & {
    backgroundColor?: string;
    fontSize: FontSize;
    italic: boolean;
    bold: boolean;
    borderWidth: number;
    borderColor: string;
  }
> = {
  args: {
    size: 'base',
    variant: 'default',
    label: 'Test',
    style: {},
    textColor: '',
    backgroundColor: '',
    fontSize: 'xl',
    italic: false,
    bold: false,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['base', 'icon', 'lg', 'sm', 'xl'] as ButtonSize[],
    },
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'ghost', 'link', 'outline', 'secondary'] as ButtonVariant[],
    },
    asChild: {
      control: 'boolean',
    },
    textColor: {
      control: 'color',
    },
    backgroundColor: {
      control: 'color',
    },
    fontSize: {
      control: 'select',
      options: ['Bardzo mały', 'Mały', 'Średni', 'Duży', 'Bardzo duży', '2XL', '3XL', '4XL'],
      mapping: {
        'Bardzo mały': 'xs',
        Mały: 'sm',
        Średni: 'base',
        Duży: 'lg',
        'Bardzo duży': 'xl',
        '2XL': '2xl',
        '3XL': '3xl',
        '4XL': '4xl',
      },
    },
    italic: {
      control: 'boolean',
    },
    bold: {
      control: 'boolean',
    },
    borderColor: {
      control: 'color',
    },
    borderWidth: {
      control: 'number',
    },
  },
  render: function Render(args) {
    const [{ textColor, backgroundColor, fontSize, italic, bold, borderColor, borderWidth }] = useArgs();

    const sizesMap = {
      xs: '!text-xs',
      sm: '!text-sm',
      base: '!text-base',
      lg: '!text-lg',
      xl: '!text-xl',
      '2xl': '!text-2xl',
      '3xl': '!text-3xl',
      '4xl': '!text-4xl',
    } as const;

    return (
      <Button
        {...args}
        style={{
          ...args.style,
          color: textColor,
          background: backgroundColor,
          borderColor,
          borderWidth: `${borderWidth}px`,
        }}
        className={cn(sizesMap[fontSize as keyof typeof sizesMap], {
          ['italic']: italic,
          ['!font-bold']: bold,
        })}
      ></Button>
    );
  },
};

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
