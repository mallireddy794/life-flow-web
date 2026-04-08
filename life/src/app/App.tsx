import { RouterProvider } from 'react-router';
import { router } from './routes';
import { UserProvider } from './contexts/UserContext';
import { ChatProvider } from './contexts/ChatContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SplashScreen } from './pages/SplashScreen';
import { useState, useEffect } from 'react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); // 2.5 seconds for a premium feel
    return () => clearTimeout(timer);
  }, []);

  return (
    <UserProvider>
      <ChatProvider>
        <ErrorBoundary>
          {showSplash ? <SplashScreen /> : <RouterProvider router={router} />}
        </ErrorBoundary>
      </ChatProvider>
    </UserProvider>
  );
}
