import { useTranslation } from 'react-i18next';
import { Provider } from 'react-redux';

import './App.css';

import { Test } from './Test';
import { store } from './stores/store';

interface Modal {
  showModal(): void;
  close(): void;
}

function App() {
  const applicationVersion = APPLICATION_VERSION || '1.0.0';

  const { t } = useTranslation();
  const [title, setTitle] = useState('');

  function showModal() {
    const modalElement = document.getElementById('my_modal_1') as Modal | null;

    if(!modalElement) {
      console.error('Modal not found!');

      return;
    }

    modalElement.showModal();
  }

  function closeModal(e?: React.MouseEvent<HTMLLabelElement, MouseEvent>) {
    e?.preventDefault();

    const modalElement = document.getElementById('my_modal_1') as Modal | null;

    if(!modalElement) {
      console.error('Modal not found!');

      return;
    }

    modalElement.close();
  }

  async function addTodo(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();

    if(title === '') {
      return;
    }

    await ky.post('/api/todos', {
      json: {
        title
      }
    }).json();

    closeModal();
  }

  return (
    <Provider store={store}>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <p>Version: {applicationVersion}</p>
      <div className='grid py-3 px-5 gap-5'>

      <button className="btn" onClick={ () => showModal() }>Add a new TODO</button>
        <input type="checkbox" id="my_modal_6" className="modal-toggle" />
        <dialog id="my_modal_1" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Work, work, work...</h3>
            <p className="py-4">Creating a new todo</p>
                <form onSubmit={addTodo}>
                  <label htmlFor="title text-secondary" className='text px-6'>Title</label>
                  <input 
                    type="text"
                    placeholder="Type here"
                    className="input input-bordered w-full max-w-xs"
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <div className='flex justify-between'>
                    <div className="modal-action">
                      <label htmlFor="my_modal_6" className="btn" onClick={(e) => closeModal(e)}>Cancel</label>
                    </div>
                    <div className='modal-action'>
                        <button className='btn' type="submit">Add</button>
                    </div>
                  </div>
              </form>
            </div>
      </dialog>

      <button className="btn btn-primary">Button</button>
      <p>{t('Welcome to React')}</p>
      </div>
      <Test />
    </Provider>
  );
}

export default App;
