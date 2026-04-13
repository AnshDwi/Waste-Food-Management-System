import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { App } from './app/App';
import './index.css';
import { store } from './app/store';
import { setupApiInterceptors } from './lib/api';
import { queryClient } from './lib/queryClient';
import { AppErrorBoundary } from './components/ui/AppErrorBoundary';

setupApiInterceptors(store);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </Provider>
    </AppErrorBoundary>
  </React.StrictMode>
);
