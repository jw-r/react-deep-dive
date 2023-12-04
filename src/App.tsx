import './App.css';
import { TodosApp } from './useSyncExternalStore/TodosApp';
import { useOnlineStatus } from './useSyncExternalStore/useOnlineStatus';

export function App() {
  const isOnline = useOnlineStatus();

  return (
    <div>
      <h1>{isOnline ? 'Online' : 'Offline'}</h1>
    </div>
  );
}
