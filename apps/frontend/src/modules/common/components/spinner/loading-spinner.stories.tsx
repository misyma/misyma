import { Meta, StoryObj } from '@storybook/react';
import { ISVGProps, LoadingSpinner } from './loading-spinner';
import { useArgs } from '@storybook/preview-api';

const meta: Meta<typeof LoadingSpinner> = {
  component: LoadingSpinner,
};

export default meta;

type Story = StoryObj<ISVGProps>;

export const Default = {};

export const Custom: Story = {
  args: {
    size: 80,
    stroke: 'red',
    strokeWidth: '5',
  },
  argTypes: {
    size: {
      control: 'number',
    },
    stroke: {
      control: 'color',
    },
    strokeWidth: {
      control: 'number',
    },
  },
  render: function Render(args) {
    const [{ stroke }] = useArgs();

    return (
      <LoadingSpinner
        style={{
          stroke,
        }}
        {...args}
      />
    );
  },
};
