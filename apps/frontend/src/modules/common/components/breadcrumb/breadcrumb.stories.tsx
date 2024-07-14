import { Meta } from '@storybook/react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from './breadcrumb';
import { ReactNode } from 'react';

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
      <BreadcrumbItem>Shit</BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
);
