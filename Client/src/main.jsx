import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import {BrowserRouter} from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { AppThemeProvider } from './context/AppThemeProvider';
import { SocketProvider } from './context/SocketProvider.jsx';
import { FriendRequestsProvider } from './context/friendRequestsProvider.jsx';
import { ChatsProvider } from './context/ChatsProvider.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <SocketProvider>
        <AppThemeProvider>
          <FriendRequestsProvider>
            <ChatsProvider>
              <App/>
            </ChatsProvider>
          </FriendRequestsProvider>
        </AppThemeProvider>
      </SocketProvider>
    </AuthProvider>
  </BrowserRouter>
)
