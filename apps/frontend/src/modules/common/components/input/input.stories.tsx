import { Meta, StoryObj } from '@storybook/react';
import { Input, InputProps } from './input';
import * as HiIcons from 'react-icons/hi';
import { useArgs } from '@storybook/preview-api';

const meta: Meta<typeof Input> = {
  component: Input,
};

export default meta;

type Story = StoryObj<
  InputProps & {
    iconColor: string;
  }
>;

const allHiIconNames = Object.values(HiIcons).map((iconType) => iconType.name);

export const Playground: Story = {
  args: {
    includeQuill: true,
    otherIcon: '',
    iconColor: '',
    iSize: 'xl',
  },
  argTypes: {
    includeQuill: {
      control: 'boolean',
    },
    otherIcon: {
      control: 'select',
      options: allHiIconNames,
    },
    iconColor: {
      control: 'color',
    },
    iSize: {
      control: 'select',
      options: ['sm', 'base', 'lg', 'xl'],
    },
  },
  render: function Render(args) {
    const [{ otherIcon, iconColor, iSize }] = useArgs();

    const renderFunc = HiIcons[otherIcon as keyof typeof HiIcons];

    return (
      <Input
        {...args}
        iSize={iSize}
        otherIcon={
          renderFunc ? (
            renderFunc({
              className: 'text-primary',
              style: {
                fontSize: '1.875rem' /* 30px */,
                lineHeight: '2.25rem' /* 36px */,
                color: iconColor,
              },
            })
          ) : (
            <></>
          )
        }
      />
    );
  },
};
