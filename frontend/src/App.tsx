import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from './contexts/Web3Context';
import TestWalletConnection from './pages/TestWalletConnection';

function App() {
  return (
    <Web3Provider>
      <div className="App">
        <TestWalletConnection />
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Web3Provider>
  );
}

export default App;
