import React, { useEffect, useState } from 'react';
import { Header } from '../components/common/Header';
import documentsService from '../services/documentsService';
import styles from './DocumentViewer.module.css';

const DocumentViewer = () => {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hash = window.location.hash || '';
    const parts = hash.split('/');
    const id = parseInt(parts[parts.length - 1], 10);
    const load = async () => {
      setLoading(true);
      try {
        const list = await documentsService.list();
        const found = list.find(d => d.id === id);
        setDoc(found || null);
      } catch (e) { 
        console.error(e); 
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className={styles.viewerContainer}>
      <Header showBack={true} />
      <div className="container">
        <div style={{ padding: '40px', textAlign: 'center' }}>Cargando documento...</div>
      </div>
    </div>
  );

  if (!doc) return (
    <div className={styles.viewerContainer}>
      <Header showBack={true} />
      <div className="container">
        <div className={styles.content}>
          <div className={styles.fallback}>
            <div className={styles.fallbackIcon}>❓</div>
            <h2>Documento no encontrado</h2>
            <button 
              className={styles.backLink} 
              onClick={() => { window.location.hash = '#/documents'; }}
            >
              ← Volver a documentos
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const url = documentsService.downloadUrl(doc);

  return (
    <div className={styles.viewerContainer}>
      <Header showBack={true} />
      <div className="container">
        <div className={styles.content}>
          <div className={styles.viewerHeader}>
            <button 
              className={styles.backLink} 
              onClick={() => { window.location.hash = '#/documents'; }}
            >
              ← Volver a documentos
            </button>
            <h2 title={doc.original_name}>{doc.original_name}</h2>
          </div>
          
          <div className={styles.mediaContainer}>
            {doc.mime_type?.startsWith('image/') ? (
              <img src={url} alt={doc.original_name} />
            ) : doc.mime_type === 'application/pdf' ? (
              <iframe src={url} title={doc.original_name} />
            ) : (
              <div className={styles.fallback}>
                <div className={styles.fallbackIcon}>📄</div>
                <p>Tipo de archivo: {doc.mime_type || 'desconocido'}</p>
                <a href={url} target="_blank" rel="noreferrer" className={styles.downloadBtn}>
                  Descargar Documento
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
