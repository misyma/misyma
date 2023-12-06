import './App.css';

function App() {
  const applicationVersion = APPLICATION_VERSION;

  return (
    <>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <p>Version: {applicationVersion}</p>
      <button className="btn btn-primary">Button</button>
    </>
  );
}

export default App;
