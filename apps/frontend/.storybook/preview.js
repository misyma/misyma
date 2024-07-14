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
};

// .storybook/preview.js

import '../src/index.css'; // replace with the name of your tailwind css file

export default preview;
