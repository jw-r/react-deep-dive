import './App.css';
import { useOnlineStatus } from './useSyncExternalStore/useOnlineStatus';

export function App() {
  const isOnline = useOnlineStatus();

  return (
    <div>
      <h1>{isOnline ? 'Online' : 'Offline'}</h1>
    </div>
  );
}
