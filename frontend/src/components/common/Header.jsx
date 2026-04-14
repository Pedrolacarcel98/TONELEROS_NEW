import React from 'react';
import styles from './Header.module.css';
import { useAuth } from '../../hooks/useAuth';

export const Header = ({ showBack = false }) => {
  const { user, logout } = useAuth();

  const goToDashboard = () => {
    window.location.hash = '#/';
  };

  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.innerHeader}>
          {/* Left: Back button or Logo placeholder for symmetry */}
          <div className={styles.left}>
            {showBack ? (
              <button 
                className={styles.backBtn} 
                onClick={goToDashboard}
                aria-label="Volver al inicio"
              >
                <span className={styles.arrow}>←</span>
                <span className={styles.backText}>Volver</span>
              </button>
            ) : (
              <div className={styles.logo} onClick={goToDashboard}>
                <span className={styles.logoIcon}>🎸</span>
                <span className={styles.logoText}>TONELEROS</span>
              </div>
            )}
          </div>

          {/* Center: Logo (visible when showBack is true for symmetry) */}
          {showBack && (
            <div className={styles.centerLogo} onClick={goToDashboard}>
              <span className={styles.logoText}>TONELEROS</span>
            </div>
          )}

          {/* Right: User actions */}
          <div className={styles.right}>
            <div className={styles.userInfo}>
              <span className={styles.email}>{user?.email?.split('@')[0]}</span>
              <button onClick={logout} className={styles.logoutBtn} title="Cerrar sesión">
                Salir
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
