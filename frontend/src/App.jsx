import React, { useState, useEffect } from 'react'; // 1. Importamos hooks necesarios
import { LoginForm } from './components/auth/LoginForm';
import { Dashboard } from './pages/Dashboard';
import { useAuth } from './hooks/useAuth';
import './styles/globals.css';
import Events from './pages/Events';
import Finance from './pages/Finance';
import Documents from './pages/Documents';
import DocumentViewer from './pages/DocumentViewer';
import Media from './pages/Media';

function App() {
  const { isAuthenticated } = useAuth();
  
  // 2. Creamos un estado para la ruta actual
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/');

  // 3. Escuchamos el evento 'hashchange' del navegador
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Limpieza al desmontar el componente
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Lógica de protección
  if (!isAuthenticated) return <LoginForm />;

  // 4. Renderizado condicional basado en el estado
  if (currentHash === '#/events') {
    return <Events />;
  }
  if (currentHash === '#/finance') {
    return <Finance />;
  }
  if (currentHash === '#/documents') {
    return <Documents />;
  }
  if (currentHash === '#/media') {
    return <Media />;
  }
  if (currentHash.startsWith('#/documents/view/')) {
    return <DocumentViewer />;
  }
  
  return <Dashboard />;
}

export default App;