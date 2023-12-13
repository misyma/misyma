import { useTranslation } from 'react-i18next';
import { Provider } from 'react-redux';

import './App.css';

import { Test } from './Test';
import { store } from './stores/store';

function App() {
  const applicationVersion = APPLICATION_VERSION || '1.0.0';

  const { t } = useTranslation();

  return (
    <Provider store={store}>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <p>Version: {applicationVersion}</p>
      <button className="btn btn-primary">Button</button>
      <p>{t('Welcome to React')}</p>
      <Test />
    </Provider>
  );
}

export default App;
