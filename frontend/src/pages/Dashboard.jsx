import React, { useState } from 'react';
import styles from './Dashboard.module.css';
import { Header } from '../components/common/Header';
import apiClient from '../services/apiClient';

// Custom SVG Icons
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
);

const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-5 2.82"/><path d="M22 11h-3a2 2 0 0 0 0 4h3v-4z"/></svg>
);

const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
);

const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

const ZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
);

export const Dashboard = () => {
  return (
    <div className={styles.dashboardContainer}>
      <Header />
      <div className={styles.heroSection}>
        <div className={styles.heroGlow}></div>
        <div className="container">
          <div className={styles.welcome}>
            <img src="/logo.png" alt="Toneleros Logo" className={styles.mainLogo} onError={(e) => e.target.style.display='none'} />
          </div>
          
          <div className={styles.grid}>
            <button className={styles.card} onClick={() => { window.location.hash = '#/events'; }}>
              <div className={`${styles.iconWrapper} ${styles.blueGlow}`}>
                <CalendarIcon />
              </div>
              <h3>Eventos</h3>
            </button>

            <button className={styles.card} onClick={() => { window.location.hash = '#/finance'; }}>
              <div className={`${styles.iconWrapper} ${styles.greenGlow}`}>
                <WalletIcon />
              </div>
              <h3>Finanzas</h3>
            </button>

            <button className={styles.card} onClick={() => { window.location.hash = '#/documents'; }}>
              <div className={`${styles.iconWrapper} ${styles.purpleGlow}`}>
                <FileTextIcon />
              </div>
              <h3>Documentos</h3>
            </button>

            <button className={styles.card} onClick={() => { window.location.hash = '#/media'; }}>
              <div className={`${styles.iconWrapper} ${styles.pinkGlow}`}>
                <ImageIcon />
              </div>
              <h3>Multimedia</h3>
            </button>

            <button className={styles.card} onClick={() => { window.location.hash = '#/clients'; }}>
              <div className={`${styles.iconWrapper} ${styles.orangeGlow}`}>
                <UsersIcon />
              </div>
              <h3>Clientes</h3>
            </button>

            <button className={styles.card} onClick={() => { window.location.hash = '#/integrations'; }}>
              <div className={`${styles.iconWrapper} ${styles.yellowGlow}`}>
                <ZapIcon />
              </div>
              <h3>Automatización</h3>
            </button>

            <button className={styles.card} onClick={() => { window.location.hash = '#/vacations'; }}>
              <div className={`${styles.iconWrapper} ${styles.cyanGlow}`}>
                <SunIcon />
              </div>
              <h3>Vacaciones</h3>
            </button>
          </div>

          <div className={styles.backupSection}>
            <button 
              className={styles.simpleButton} 
              onClick={async () => {
                try {
                  const response = await apiClient.get('/system/backup', { responseType: 'blob' });
                  const url = window.URL.createObjectURL(new Blob([response.data]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', 'toneleros_backup.db');
                  document.body.appendChild(link);
                  link.click();
                  link.parentNode.removeChild(link);
                } catch (e) {
                  alert("Error al descargar la base de datos.");
                }
              }}
            >
              Descargar Copia de Seguridad (.db)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
