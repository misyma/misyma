import { type Meta, type StoryObj } from '@storybook/react';

import { Checkbox, type CheckboxProps } from './checkbox';

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  decorators: (Story) => (
    <div className="flex">
      <Story></Story>
    </div>
  ),
};

export default meta;

type Story = StoryObj<CheckboxProps>;

export const Default: Story = {
  args: {
    size: 'base',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['base', 'lg', 'xl'],
    },
  },
};
