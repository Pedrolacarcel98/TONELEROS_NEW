import React, { useEffect, useState, useRef } from 'react';
import { Header } from '../components/common/Header';
import documentsService from '../services/documentsService';
import styles from './Documents.module.css';

const Documents = () => {
  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sharingId, setSharingId] = useState(null);
  const fileRef = useRef();

  const load = async () => {
    setLoading(true);
    try {
      const data = await documentsService.list();
      setItems(data);
    } catch (e) { 
      console.error(e); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    try {
      await documentsService.upload(file);
      setFile(null);
      fileRef.current.value = '';
      await load();
    } catch (e) { 
      console.error(e); 
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas borrar este documento?')) return;
    try {
      await documentsService.delete(id);
      await load();
    } catch (e) {
      console.error(e);
      alert('Error al borrar el documento');
    }
  };

  const onShare = async (doc) => {
    const url = documentsService.downloadUrl(doc);
    if (!navigator.share) {
      await navigator.clipboard.writeText(url);
      alert('Enlace copiado al portapapeles');
      return;
    }

    setSharingId(doc.id);
    try {
      const response = await fetch(url, { mode: 'cors', cache: 'no-cache' });
      const blob = await response.blob();
      const fileObj = new File([blob], doc.original_name, { type: doc.mime_type || blob.type });

      if (navigator.canShare && navigator.canShare({ files: [fileObj] })) {
        await navigator.share({ files: [fileObj], title: doc.original_name });
      } else {
        await navigator.share({ title: doc.original_name, url: url });
      }
    } catch (e) { 
      console.error('Share error:', e);
      try {
        await navigator.share({ title: doc.original_name, url: url });
      } catch (err) {
        await navigator.clipboard.writeText(url);
        alert('Enlace copiado al portapapeles');
      }
    } finally {
      setSharingId(null);
    }
  };

  const getDocVisual = (doc) => {
    const mime = doc.mime_type || '';
    const url = documentsService.downloadUrl(doc);

    if (mime.startsWith('image/')) {
      return <img src={url} alt={doc.original_name} className={styles.previewImg} />;
    }

    if (mime.includes('pdf')) {
      return (
        <div className={styles.pdfPreviewWrapper}>
          <iframe 
            src={`${url}#toolbar=0&navpanes=0&scrollbar=0`} 
            className={styles.pdfIframe}
            title="PDF Preview"
            frameBorder="0"
          />
          <div className={styles.previewOverlay}></div>
          <span className={styles.pdfTag}>PDF</span>
        </div>
      );
    }

    // Fallback para Word, Excel, etc. con diseño de "página"
    let label = 'DOC';
    let tagClass = styles.fileTag;
    let icon = '📄';

    if (mime.includes('word') || mime.includes('officedocument.word')) {
      label = 'WORD';
      tagClass = styles.wordTag;
      icon = '📘';
    } else if (mime.includes('sheet') || mime.includes('excel') || mime.includes('officedocument.spreadsheet')) {
      label = 'EXCEL';
      tagClass = styles.excelTag;
      icon = '📗';
    }

    return (
      <div className={styles.docPreviewPlaceholder}>
        <span className={tagClass}>{label}</span>
        <div className={styles.fileIconLarge}>{icon}</div>
        <div className={styles.dummyLines}>
          <div className={styles.line}></div>
          <div className={styles.line}></div>
          <div className={styles.line} style={{width: '60%'}}></div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.documentsContainer}>
      <Header showBack={true} />
      <div className="container">
        <div className={styles.pageHeader}>
          <h1>Documentos</h1>
          <form onSubmit={onUpload} className={styles.uploadForm}>
            <div className={styles.fileInputWrapper}>
              <input 
                ref={fileRef} 
                type="file" 
                onChange={e => setFile(e.target.files[0])} 
                className={styles.fileInput}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || !file} 
              className={styles.uploadBtn}
            >
              {loading ? 'Subiendo...' : 'Subir Documento'}
            </button>
          </form>
        </div>

        {loading && items.length === 0 ? (
          <div className={styles.loading}>Cargando documentos...</div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>
            <p>No hay documentos registrados.</p>
          </div>
        ) : (
          <div className={styles.previewGrid}>
            {items.map(it => {
              const downloadUrl = documentsService.downloadUrl(it);
              return (
                <div key={it.id} className={styles.previewCard}>
                  <div 
                    className={styles.thumb} 
                    onClick={() => window.open(downloadUrl, '_blank')}
                  >
                    {getDocVisual(it)}
                  </div>
                  <div className={styles.meta}>
                    <div className={styles.name} title={it.original_name}>{it.original_name}</div>
                    <div className={styles.actions}>
                      <button 
                        onClick={() => window.open(downloadUrl, '_blank')}
                        className={`${styles.actionBtn} ${styles.openBtn}`}
                      >
                        Abrir
                      </button>
                      <button 
                        onClick={() => onShare(it)} 
                        className={`${styles.actionBtn} ${styles.shareBtn}`}
                        disabled={sharingId === it.id}
                      >
                        {sharingId === it.id ? (
                          <div className={styles.spinnerSmall}></div>
                        ) : (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                              <polyline points="16 6 12 2 8 6"></polyline>
                              <line x1="12" y1="2" x2="12" y2="15"></line>
                            </svg>
                            Compartir
                          </>
                        )}
                      </button>
                      <button 
                        onClick={() => onDelete(it.id)} 
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;
