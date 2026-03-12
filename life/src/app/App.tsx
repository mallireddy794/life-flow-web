import { RouterProvider } from 'react-router';
import { router } from './routes';
import { UserProvider } from './contexts/UserContext';
import { ChatProvider } from './contexts/ChatContext';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <UserProvider>
      <ChatProvider>
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
      </ChatProvider>
    </UserProvider>
  );
}
