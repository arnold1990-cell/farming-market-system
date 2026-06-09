import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import { routes } from './router/routes';
import BackendConnectionOverlay from './components/BackendConnectionOverlay';
import SplashScreen from './components/SplashScreen';

function App() {
  const renderedRoutes = useRoutes(routes);
  return (
    <>
      <Suspense fallback={<SplashScreen />}>
        {renderedRoutes}
      </Suspense>
      <BackendConnectionOverlay />
    </>
  );
}

export default App;
