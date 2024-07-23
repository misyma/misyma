import { Meta, StoryObj } from '@storybook/react';
import { Calendar, CalendarProps } from './calendar';
import { useState } from 'react';

const meta: Meta<typeof Calendar> = {
  component: Calendar,
};

export default meta;

type Story = StoryObj<CalendarProps>;

export const Default = {};

export const SingleChoiceSelect: Story = {
  render: function Render(args: CalendarProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedValue, useSelectedValue] = useState<any>();

    return (
      <Calendar
        mode="single"
        selected={selectedValue}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSelect={(val: any) => useSelectedValue(val)}
        {...args}
      />
    );
  },
};

export const DisabledSelectAfterToday: Story = {
  render: function Render(args: CalendarProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedValue, useSelectedValue] = useState<any>();

    return (
      <Calendar
        mode="single"
        selected={selectedValue}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSelect={(val: any) => useSelectedValue(val)}
        {...args}
        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
      />
    );
  },
};

export const MultipleChoiceSelect: Story = {
  render: function Render(args: CalendarProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedValue, useSelectedValue] = useState<any>();

    return (
      <Calendar
        mode="multiple"
        selected={selectedValue}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSelect={(val: any) => useSelectedValue(val)}
        {...args}
      />
    );
  },
};

export const RangeChoiceSelect: Story = {
  render: function Render(args: CalendarProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedValue, useSelectedValue] = useState<any>();

    return (
      <Calendar
        mode="range"
        selected={selectedValue}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSelect={(val: any) => useSelectedValue(val)}
        {...args}
      />
    );
  },
};
