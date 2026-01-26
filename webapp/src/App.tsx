import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { AppRoutes } from './routes/AppRoutes';
import { ToastContainer } from 'react-toastify';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import 'react-toastify/dist/ReactToastify.css';
import './styles/index.css';
import './styles/fonts.css';
import './App.css';

const OfflineScreen = () => (
  <div className="offline-screen">
    <div className="offline-content">
      <div className="offline-icon">📡</div>
      <h1>No Internet Connection</h1>
      <p>Please check your network settings and try again</p>
      <button onClick={() => window.location.reload()} className="retry-button">
        Try Again
      </button>
    </div>
  </div>
);

function AppContent() {
  const isOnline = useNetworkStatus();

  if (!isOnline) {
    return <OfflineScreen />;
  }

  return (
    <>
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
