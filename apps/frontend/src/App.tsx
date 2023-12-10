import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import './App.css';

import { Test } from './Test';

const queryClient = new QueryClient();

function App() {
  const applicationVersion = APPLICATION_VERSION || '1.0.0';

  const { t } = useTranslation();

  return (
    <QueryClientProvider client={queryClient}>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <p>Version: {applicationVersion}</p>
      <button className="btn btn-primary">Button</button>
      <p>{t('Welcome to React')}</p>
      <Test />
    </QueryClientProvider>
  );
}

export default App;
