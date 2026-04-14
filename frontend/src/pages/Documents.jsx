import React, { useEffect, useState, useRef } from 'react';
import { Header } from '../components/common/Header';
import documentsService from '../services/documentsService';
import styles from './Documents.module.css';

const Documents = () => {
  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
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

  const onShare = async (id) => {
    try {
      const res = await documentsService.share(id);
      const url = res.share_url || documentsService.downloadUrl({ stored_name: res.stored_name });
      await navigator.clipboard.writeText(url);
      alert('Enlace copiado al portapapeles');
    } catch (e) { 
      console.error(e); 
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.includes('pdf')) return 'PDF';
    if (mimeType?.includes('image')) return '🖼️';
    if (mimeType?.includes('word') || mimeType?.includes('officedocument')) return '📘';
    if (mimeType?.includes('sheet') || mimeType?.includes('excel')) return '📗';
    if (mimeType?.includes('zip') || mimeType?.includes('rar')) return '📦';
    return '📄';
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
          <div style={{ textAlign: 'center', padding: '40px' }}>Cargando documentos...</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px' }}>
            <p style={{ fontSize: '1.2rem', color: '#666' }}>No hay documentos subidos aún.</p>
          </div>
        ) : (
          <div className={styles.previewGrid}>
            {items.map(it => (
              <div key={it.id} className={styles.previewCard}>
                <div 
                  className={styles.thumb} 
                  onClick={() => { window.location.hash = `#/documents/view/${it.id}`; }}
                  title="Ver documento"
                >
                  {it.mime_type?.startsWith('image/') ? (
                    <img src={documentsService.downloadUrl(it)} alt={it.original_name} />
                  ) : it.mime_type === 'application/pdf' ? (
                    <div className={styles.fileIcon}>📕</div>
                  ) : (
                    <div className={styles.fileIcon}>{getFileIcon(it.mime_type)}</div>
                  )}
                </div>
                <div className={styles.meta}>
                  <div className={styles.name} title={it.original_name}>{it.original_name}</div>
                  <div className={styles.actions}>
                    <a 
                      href={documentsService.downloadUrl(it)} 
                      target="_blank" 
                      rel="noreferrer" 
                      className={`${styles.actionBtn} ${styles.openBtn}`}
                    >
                      Abrir
                    </a>
                    <button 
                      onClick={() => onShare(it.id)} 
                      className={`${styles.actionBtn} ${styles.shareBtn}`}
                    >
                      Enlace
                    </button>
                    <button 
                      onClick={() => onDelete(it.id)} 
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;
