import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { useEditorConfig } from '../hooks/useEditorConfig.js';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { ImageLibrary } from '../components/images/ImageLibrary.jsx';
import { ImageUploader } from '../components/images/ImageUploader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Controls.jsx';

export default function ImagesPage() {
  const [showUploader, setShowUploader] = useState(false);
  const { data: config } = useEditorConfig();
  const cloudinaryReady = config?.services?.cloudinary !== false;

  return (
    <>
      <PageHeader
        title="Biblioteca de imágenes"
        description="Imágenes almacenadas en Cloudinary, disponibles para todos los catálogos."
        actions={
          <Button variant={showUploader ? 'secondary' : 'primary'} icon={showUploader ? X : Upload} onClick={() => setShowUploader((v) => !v)}>
            {showUploader ? 'Cerrar' : 'Subir imagen'}
          </Button>
        }
      />

      {!cloudinaryReady && (
        <div className="notice notice--warning" role="alert">
          Cloudinary no está configurado en el backend. Define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y
          CLOUDINARY_API_SECRET en el archivo .env del servidor para poder subir imágenes.
        </div>
      )}

      {showUploader && (
        <div style={{ marginBottom: 24 }}>
          <Card title="Subir nueva imagen">
            <ImageUploader maxUploadMb={config?.maxUploadMb} disabled={!cloudinaryReady} onUploaded={() => setShowUploader(false)} />
          </Card>
        </div>
      )}

      <ImageLibrary
        mode="manage"
        emptyAction={
          <Button variant="primary" icon={Upload} onClick={() => setShowUploader(true)} disabled={!cloudinaryReady}>
            Subir imagen
          </Button>
        }
      />
    </>
  );
}
