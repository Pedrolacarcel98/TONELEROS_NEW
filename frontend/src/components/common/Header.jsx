import React, { useState, useEffect, useRef } from 'react';
import styles from './Header.module.css';
import { useAuth } from '../../hooks/useAuth';

const NAV_ITEMS = [
  { label: 'Inicio', icon: '🏠', hash: '#/' },
  { label: 'Eventos', icon: '📅', hash: '#/events' },
  { label: 'Documentos', icon: '📄', hash: '#/documents' },
  { label: 'Multimedia', icon: '🎬', hash: '#/media' },
  { label: 'Clientes', icon: '👥', hash: '#/clients' },
  { label: 'Vacaciones', icon: '🏖️', hash: '#/vacations' },
  { label: 'Estadísticas', icon: '📊', hash: '#/finance' },
];

export const Header = ({ title = null }) => {
  const { user, logout } = useAuth();
  const [currentHash, setCurrentHash] = useState(() => window.location.hash || '#/');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
      setIsMenuOpen(false);
    };

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const navigateTo = (hash) => {
    window.location.hash = hash;
    setIsMenuOpen(false);
  };

  const isHome = currentHash === '#/' || currentHash === '' || currentHash === '#';

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.innerHeader} ref={menuRef}>
          {/* Lado Izquierdo: Botón 3 Rayas (Hamburguesa) + Título opcional */}
          <div className={styles.leftSection}>
            <button
              type="button"
              className={`${styles.hamburgerBtn} ${isMenuOpen ? styles.hamburgerBtnActive : ''}`}
              onClick={() => setIsMenuOpen(prev => !prev)}
              title="Menú de navegación"
              aria-label="Abrir menú de navegación"
              aria-expanded={isMenuOpen}
            >
              <svg 
                className={styles.hamburgerIcon} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {title && (
              <div className={styles.titleWrapper}>
                <span className={styles.pageTitle}>{title}</span>
              </div>
            )}

            {/* Menú Desplegable Lateral/Flotante (Anclado a la izquierda) */}
            {isMenuOpen && (
              <>
                <div 
                  className={styles.backdrop} 
                  onClick={() => setIsMenuOpen(false)} 
                  aria-hidden="true" 
                />
                <div className={styles.dropdownMenu} role="menu">
                  <div className={styles.dropdownHeader}>
                    <span className={styles.dropdownTitle}>Navegación</span>
                    <button 
                      type="button" 
                      className={styles.closeMenuBtn}
                      onClick={() => setIsMenuOpen(false)}
                      title="Cerrar menú"
                      aria-label="Cerrar menú"
                    >
                      ×
                    </button>
                  </div>

                  <div className={styles.navGrid}>
                    {NAV_ITEMS.map((item) => {
                      const isActive = item.hash === '#/' 
                        ? isHome 
                        : currentHash === item.hash || currentHash.startsWith(item.hash + '/');

                      return (
                        <button
                          key={item.hash}
                          type="button"
                          onClick={() => navigateTo(item.hash)}
                          className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                          role="menuitem"
                        >
                          <span className={styles.navIcon}>{item.icon}</span>
                          <span className={styles.navLabel}>{item.label}</span>
                          {isActive && <span className={styles.activePill}>Actual</span>}
                        </button>
                      );
                    })}
                  </div>

                  <div className={styles.dropdownDivider} />

                  {/* Sección Usuario y Logout en el menú */}
                  <div className={styles.menuFooter}>
                    <div className={styles.userInfoBlock}>
                      <span className={styles.avatarIcon}>👤</span>
                      <span className={styles.fullEmail} title={user?.email}>
                        {user?.email || 'Usuario'}
                      </span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => { setIsMenuOpen(false); logout(); }} 
                      className={styles.logoutBtn}
                      title="Cerrar sesión"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Lado Derecho: Logo de Toneleros (el del inicio) */}
          <div className={styles.rightSection}>
            <div 
              className={styles.logoWrapper} 
              onClick={() => navigateTo('#/')}
              title="Ir al Inicio"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigateTo('#/');
                }
              }}
            >
              <img 
                src="/logo.png" 
                alt="Toneleros" 
                className={styles.logoImg} 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className={styles.logoFallback} style={{ display: 'none' }}>
                <span className={styles.fallbackIcon}>🎸</span>
                <span className={styles.fallbackText}>TONELEROS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
