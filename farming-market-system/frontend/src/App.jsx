import { useRoutes } from 'react-router-dom';
import { routes } from './router/routes';
import BackendConnectionOverlay from './components/BackendConnectionOverlay';

function App() {
  const renderedRoutes = useRoutes(routes);
  return (
    <>
      {renderedRoutes}
      <BackendConnectionOverlay />
    </>
  );
}

export default App;
