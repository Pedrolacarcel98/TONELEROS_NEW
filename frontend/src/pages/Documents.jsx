import React, { useEffect, useState, useRef } from 'react';
import { Header } from '../components/common/Header';
import documentsService from '../services/documentsService';
import styles from './Documents.module.css';

// Caché en memoria para miniaturas de la 1ª página de PDFs
const pdfThumbnailCache = new Map();
let pdfJsPromise = null;

const loadPdfJs = () => {
  if (window.pdfjsLib) {
    return Promise.resolve(window.pdfjsLib);
  }
  if (pdfJsPromise) {
    return pdfJsPromise;
  }
  pdfJsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      } else {
        reject(new Error('No se pudo inicializar pdfjsLib'));
      }
    };
    script.onerror = (err) => {
      pdfJsPromise = null;
      reject(err);
    };
    document.head.appendChild(script);
  });
  return pdfJsPromise;
};

/**
 * Renderiza la primera página del PDF en un <canvas> y la convierte en imagen.
 * Funciona de forma idéntica en Android, iOS y Escritorio, evitando el botón "Abrir"
 * nativo de los iframes móviles y eliminando las barras de scroll.
 */
const PdfFirstPagePreview = ({ doc, url }) => {
  const cacheKey = doc?.id ? `doc-${doc.id}` : url;
  const [thumbDataUrl, setThumbDataUrl] = useState(() => pdfThumbnailCache.get(cacheKey) || null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (pdfThumbnailCache.has(cacheKey)) {
      setThumbDataUrl(pdfThumbnailCache.get(cacheKey));
      return;
    }

    const renderFirstPage = async () => {
      try {
        const [pdfjsLib, arrayBuffer] = await Promise.all([
          loadPdfJs(),
          documentsService.fetchArrayBuffer(doc)
        ]);

        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        const baseViewport = page.getViewport({ scale: 1 });
        const targetWidth = 600;
        const scale = targetWidth / baseViewport.width;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        // Fondo blanco por si el PDF tiene fondo transparente
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvasContext: ctx, viewport }).promise;

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        pdfThumbnailCache.set(cacheKey, dataUrl);

        if (isMounted) {
          setThumbDataUrl(dataUrl);
        }
      } catch (err) {
        console.error('Error generando vista previa del PDF:', err);
        if (isMounted) {
          setFailed(true);
        }
      }
    };

    renderFirstPage();

    return () => {
      isMounted = false;
    };
  }, [cacheKey, doc]);

  return (
    <div className={styles.pdfPreviewWrapper}>
      {thumbDataUrl ? (
        <img
          src={thumbDataUrl}
          alt={doc?.original_name || 'Vista previa PDF'}
          className={styles.pdfPreviewImg}
          loading="lazy"
        />
      ) : failed ? (
        <div className={styles.docPreviewPlaceholder}>
          <div className={styles.fileIconLarge}>📕</div>
          <div className={styles.dummyLines}>
            <div className={styles.line}></div>
            <div className={styles.line}></div>
            <div className={styles.line} style={{ width: '60%' }}></div>
          </div>
        </div>
      ) : (
        <div className={styles.pdfLoadingSkeleton}>
          <div className={styles.spinnerSmall}></div>
          <span>Cargando vista previa...</span>
        </div>
      )}
      <span className={styles.pdfTag}>PDF</span>
    </div>
  );
};

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
    const mime = (doc.mime_type || '').toLowerCase();
    const nameLower = (doc.original_name || '').toLowerCase();
    const url = documentsService.downloadUrl(doc);

    if (mime.startsWith('image/')) {
      return <img src={url} alt={doc.original_name} className={styles.previewImg} />;
    }

    if (mime.includes('pdf') || nameLower.endsWith('.pdf')) {
      return <PdfFirstPagePreview doc={doc} url={url} />;
    }

    // Fallback para Word, Excel, etc. con diseño de "página"
    let label = 'DOC';
    let tagClass = styles.fileTag;
    let icon = '📄';

    if (mime.includes('word') || mime.includes('officedocument.word') || nameLower.endsWith('.doc') || nameLower.endsWith('.docx')) {
      label = 'WORD';
      tagClass = styles.wordTag;
      icon = '📘';
    } else if (mime.includes('sheet') || mime.includes('excel') || mime.includes('officedocument.spreadsheet') || nameLower.endsWith('.xls') || nameLower.endsWith('.xlsx')) {
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
          <div className={styles.headerActions}>
            <button 
              onClick={() => window.open('/crear-presupuesto.html', '_blank')}
              className={styles.createBudgetBtn}
            >
              📝 Crear Presupuesto
            </button>
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
