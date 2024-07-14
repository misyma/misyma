import { Meta } from '@storybook/react';

import { AutoselectedInput } from './autoselectedInput.js';
import { ReactNode } from 'react';

const meta: Meta<typeof AutoselectedInput> = {
  component: AutoselectedInput,
};

export default meta;

export const Default = (): ReactNode => <AutoselectedInput></AutoselectedInput>
