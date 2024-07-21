import { initialize, mswLoader } from 'msw-storybook-addon';

initialize();

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  loaders: [mswLoader],
};

// .storybook/preview.js

import '../src/index.css'; // replace with the name of your tailwind css file

export default preview;
