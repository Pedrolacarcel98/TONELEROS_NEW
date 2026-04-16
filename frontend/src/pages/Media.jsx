import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../components/common/Header';
import mediaService from '../services/mediaService';
import styles from './Media.module.css';

const Media = () => {
  const [activeTab, setActiveTab] = useState('PHOTO'); // 'PHOTO' or 'VIDEO'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [sharingId, setSharingId] = useState(null);
  const fileInputRef = useRef(null);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const data = await mediaService.getAll(activeTab);
      setItems(data);
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [activeTab]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      await mediaService.upload(file, activeTab);
      loadMedia();
    } catch (error) {
      alert('Error al subir archivo');
      console.error(error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres borrar este archivo?')) return;
    try {
      await mediaService.delete(id);
      loadMedia();
    } catch (error) {
      alert('Error al borrar');
    }
  };

  const handleShare = async (item) => {
    const url = mediaService.getViewUrl(item.id);
    
    // Si el navegador no soporta compartir, copiamos el link como fallback
    if (!navigator.share || !navigator.canShare) {
      navigator.clipboard.writeText(url);
      alert('Enlace copiado al portapapeles');
      return;
    }

    setSharingId(item.id);
    try {
      // 1. Descargamos el archivo para poder compartirlo físicamente
      const response = await fetch(url);
      const blob = await response.blob();
      
      // 2. Creamos el objeto File
      const file = new File([blob], item.original_name, { type: blob.type });

      // 3. Verificamos si el navegador permite compartir ese archivo concreto
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: item.original_name,
        });
      } else {
        // Fallback si no se puede compartir el archivo directamente
        await navigator.share({
          title: item.original_name,
          url: url,
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback final: copiar link
      navigator.clipboard.writeText(url);
    } finally {
      setSharingId(null);
    }
  };

  const openFull = (item) => {
    setSelectedMedia(item);
  };

  const closeFull = () => {
    setSelectedMedia(null);
  };

  return (
    <div className={styles.page}>
      <Header showBack={true} />
      
      <main className="container">
        <header className={styles.header}>
          <h1 className={styles.title}>Galería Multimedia</h1>
          <div className={styles.controls}>
            <div className={styles.tabs}>
              <button 
                className={`${styles.tab} ${activeTab === 'PHOTO' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('PHOTO')}
              >
                Fotos
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'VIDEO' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('VIDEO')}
              >
                Videos
              </button>
            </div>
            
            <div className={styles.uploadSection}>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleUpload} 
                style={{ display: 'none' }} 
                accept={activeTab === 'PHOTO' ? "image/*" : "video/*"}
              />
              <button 
                className={styles.uploadBtn} 
                onClick={() => fileInputRef.current.click()}
                disabled={uploading}
              >
                {uploading ? 'Subiendo...' : `Subir ${activeTab === 'PHOTO' ? 'Foto' : 'Video'}`}
              </button>
            </div>
          </div>
        </header>

        {loading ? (
          <div className={styles.loading}>Cargando galería...</div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>
            <p>No hay {activeTab === 'PHOTO' ? 'fotos' : 'videos'} en la galería.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {items.map(item => (
              <div key={item.id} className={styles.itemCard}>
                <div className={styles.preview} onClick={() => openFull(item)}>
                  {activeTab === 'PHOTO' ? (
                    <img src={mediaService.getViewUrl(item.id)} alt={item.original_name} />
                  ) : (
                    <video src={mediaService.getViewUrl(item.id)} />
                  )}
                  <div className={styles.overlay}>
                    <span>Ver pantalla completa</span>
                  </div>
                </div>
                
                <div className={styles.itemInfo}>
                  <p className={styles.fileName} title={item.original_name}>{item.original_name}</p>
                  <div className={styles.actions}>
                    <a 
                      href={mediaService.getDownloadUrl(item.id)} 
                      download={item.original_name}
                      className={styles.actionBtn}
                      title="Descargar"
                    >
                      📥
                    </a>
                    <button 
                      className={styles.actionBtn} 
                      onClick={() => handleShare(item)}
                      title="Compartir"
                      disabled={sharingId === item.id}
                    >
                      {sharingId === item.id ? (
                        <span className={styles.spinnerSmall}></span>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                          <polyline points="16 6 12 2 8 6"></polyline>
                          <line x1="12" y1="2" x2="12" y2="15"></line>
                        </svg>
                      )}
                    </button>
                    <button 
                      className={`${styles.actionBtn} ${styles.deleteBtn}`} 
                      onClick={() => handleDelete(item.id)}
                      title="Borrar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedMedia && (
        <div className={styles.modal} onClick={closeFull}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeFull}>×</button>
            {selectedMedia.media_type === 'PHOTO' ? (
              <img src={mediaService.getViewUrl(selectedMedia.id)} alt={selectedMedia.original_name} />
            ) : (
              <video src={mediaService.getViewUrl(selectedMedia.id)} controls autoPlay />
            )}
            <div className={styles.modalFooter}>
              <h3>{selectedMedia.original_name}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Media;
