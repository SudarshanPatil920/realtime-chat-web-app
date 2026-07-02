import type { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthScreen } from '../features/auth/AuthScreen';
import { ChatScreen } from '../features/chat/ChatScreen';
import { useAuthStore } from '../features/auth/auth.store';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const username = useAuthStore((state) => state.username);
  return username ? children : <Navigate to="/" replace />;
};

function App() {
  const username = useAuthStore((state) => state.username);
  return (
    <Routes>
      <Route path="/" element={username ? <Navigate to="/chat" replace /> : <AuthScreen />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatScreen />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
