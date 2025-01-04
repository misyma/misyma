import { useArgs } from '@storybook/preview-api';
import { type Meta, type StoryObj } from '@storybook/react';
import { type ReactNode } from 'react';
import * as HiIcons from 'react-icons/hi';
import * as HiIcons2 from 'react-icons/hi2';

import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from './breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  component: Breadcrumb,
};

export default meta;

export const Default = (): ReactNode => (
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>Testowy</BreadcrumbItem>
      <BreadcrumbSeparator></BreadcrumbSeparator>
      <BreadcrumbItem>Nah</BreadcrumbItem>
      <BreadcrumbSeparator></BreadcrumbSeparator>
      <BreadcrumbItem>Raz dwa trzy</BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
);

interface BreadcrumbItemProps {
  label: string;
  textColor: string;
}

interface StoryProps {
  gap: string;
  backgroundColor: string;
  items: BreadcrumbItemProps[];
  customListCss: Record<string, string>;
  customSeparator: string;
}

type Story = StoryObj<StoryProps>;

const allHiIconNames = Object.values(HiIcons)
  .concat(Object.values(HiIcons2))
  .map((iconType) => iconType.name);

export const Playground: Story = {
  args: {
    gap: '2',
    backgroundColor: '',
    customListCss: {},
    customSeparator: undefined,
    items: [
      {
        label: 'ALLAH',
        textColor: 'red',
      },
      {
        label: 'Test2',
        textColor: 'blue',
      },
      {
        label: 'My LIttle pony',
        textColor: 'green',
      },
    ],
  },
  argTypes: {
    gap: {
      control: 'select',
      options: ['0', '1', '1.5', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    },
    backgroundColor: {
      control: 'color',
    },
    customSeparator: {
      control: 'select',
      options: allHiIconNames,
    },
    items: {
      control: 'object',
    },
    customListCss: {
      control: 'object',
    },
  },
  render: function Render() {
    const [{ customSeparator, items, gap = '1.5', backgroundColor, customListCss }] = useArgs();

    const renderFunc = HiIcons[customSeparator as keyof typeof HiIcons];

    const gapStylesMap = {
      '0': 'gap-0 sm:gap-0',
      '1': 'gap-1 sm:gap-1.5',
      '1.5': 'gap-1.5 sm:gap-2.5',
      '2': 'gap-2 sm:gap-4',
      '3': 'gap-3 sm:gap-6',
      '4': 'gap-4 sm:gap-8',
      '5': 'gap-5 sm:gap-10',
      '6': 'gap-6 sm:gap-12',
      '7': 'gap-7 sm:gap-14',
      '8': 'gap-8 sm:gap-16',
      '9': 'gap-9 sm:gap-18',
      '10': 'gap-10 sm:gap-20',
    } as const;

    const getSeparator = (): ReactNode => {
      if (renderFunc) {
        return renderFunc({});
      }

      return <BreadcrumbSeparator></BreadcrumbSeparator>;
    };

    return (
      <Breadcrumb>
        <BreadcrumbList
          style={{
            background: backgroundColor,
            ...customListCss,
          }}
          className={gapStylesMap[gap as keyof typeof gapStylesMap]}
        >
          {items.map((item: BreadcrumbItemProps, index: number) => (
            <>
              <BreadcrumbItem
                style={{
                  color: `${item.textColor}`,
                }}
              >
                {item.label}
              </BreadcrumbItem>
              {index !== items.length - 1 && getSeparator()}
            </>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    );
  },
};
