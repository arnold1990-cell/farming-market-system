import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import { routes } from './router/routes';
import BackendConnectionOverlay from './components/BackendConnectionOverlay';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const renderedRoutes = useRoutes(routes);
  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-transparent"><LoadingSpinner /></div>}>
        {renderedRoutes}
      </Suspense>
      <BackendConnectionOverlay />
    </>
  );
}

export default App;
