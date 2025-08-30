import React from 'react';
import { AppProps } from 'next/app';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ThemeProvider>
          <Component {...pageProps} />
        </ThemeProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default MyApp;