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

  const handleShare = (item) => {
    const url = mediaService.getViewUrl(item.id);
    if (navigator.share) {
      navigator.share({
        title: item.original_name,
        text: 'Mira este contenido de Toneleros',
        url: url,
      }).catch(console.error);
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(url);
      alert('Enlace copiado al portapapeles');
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
                    >
                      🔗
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
