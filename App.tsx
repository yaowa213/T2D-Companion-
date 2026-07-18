
import React, { useEffect } from 'react';
import { Providers } from './app/Providers';
import { AppRouter } from './app/Router';
import { syncEngine } from './lib/syncEngine';
import { useAuth } from './app/AuthProvider';
import './lib/notifications/engine'; 
import { DevBypassBanner } from './components/DevBypassBanner';
import { DevOverlayRoot } from './components/dev/DevOverlayRoot';

const SyncEngineInitializer: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.id !== 'dev-user') {
      const stop = syncEngine.startSyncLoop(user.id);
      return () => stop();
    }
  }, [user]);

  return null;
};

const App: React.FC = () => {
  return (
    <Providers>
      <DevBypassBanner />
      <SyncEngineInitializer />
      <AppRouter />
      
      {/* DevOverlayRoot is the last sibling, ensuring it overlays all other content */}
      <DevOverlayRoot />
    </Providers>
  );
};

export default App;
