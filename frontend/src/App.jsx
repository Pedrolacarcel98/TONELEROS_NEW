import React, { useState, useEffect, lazy, Suspense } from 'react';
import { LoginForm } from './components/auth/LoginForm';
import { useAuth } from './hooks/useAuth';
import './styles/globals.css';

// Code splitting mediante carga perezosa (React.lazy)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Events = lazy(() => import('./pages/Events'));
const Finance = lazy(() => import('./pages/Finance'));
const Documents = lazy(() => import('./pages/Documents'));
const DocumentViewer = lazy(() => import('./pages/DocumentViewer'));
const Media = lazy(() => import('./pages/Media'));
const Clients = lazy(() => import('./pages/Clients'));
const Vacations = lazy(() => import('./pages/Vacations'));

// Componente de fallback mientras se descarga el chunk de la página
const PageLoadingFallback = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      gap: '16px',
      color: 'var(--text-secondary, #94a3b8)',
      fontSize: '1rem',
    }}
    role="status"
    aria-live="polite"
  >
    <div
      style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(255, 255, 255, 0.1)',
        borderTopColor: '#667eea',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
    <span>Cargando módulo...</span>
  </div>
);

function App() {
  const { isAuthenticated } = useAuth();
  const [currentHash, setCurrentHash] = useState(() => window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderCurrentPage = () => {
    if (currentHash === '#/events') {
      return <Events />;
    }
    if (currentHash === '#/finance' || currentHash === '#/stats') {
      return <Finance />;
    }
    if (currentHash === '#/documents') {
      return <Documents />;
    }
    if (currentHash === '#/media') {
      return <Media />;
    }
    if (currentHash === '#/clients') {
      return <Clients />;
    }
    if (currentHash.startsWith('#/documents/view/')) {
      return <DocumentViewer />;
    }
    if (currentHash === '#/vacations') {
      return <Vacations />;
    }
    return <Dashboard />;
  };

  return (
    <Suspense fallback={<PageLoadingFallback />}>
      {renderCurrentPage()}
    </Suspense>
  );
}

export default App;
