import { useEffect, useState } from 'react';
import { Images, Upload } from 'lucide-react';
import { useEditorConfig } from '../../hooks/useEditorConfig.js';
import { Button } from '../ui/Button.jsx';
import { SegmentedControl } from '../ui/Controls.jsx';
import { Modal } from '../ui/Modal.jsx';
import { ImageLibrary } from './ImageLibrary.jsx';
import { ImageUploader } from './ImageUploader.jsx';

/**
 * Selector de imágenes para el editor: elegir de la biblioteca o subir una
 * nueva sin salir del editor. Al subir, la imagen queda seleccionada.
 */
export function ImagePickerModal({ open, onClose, onSelect, currentImageId, title = 'Seleccionar imagen' }) {
  const [tab, setTab] = useState('library');
  const [selected, setSelected] = useState(null);
  const { data: config } = useEditorConfig();
  const cloudinaryReady = config?.services?.cloudinary !== false;

  useEffect(() => {
    if (open) {
      setSelected(null);
      setTab('library');
    }
  }, [open]);

  const confirm = () => {
    if (selected) onSelect(selected);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="xl"
      footer={
        tab === 'library' && (
          <>
            <Button onClick={onClose}>Cancelar</Button>
            <Button variant="primary" onClick={confirm} disabled={!selected}>
              Usar imagen seleccionada
            </Button>
          </>
        )
      }
    >
      <div className="stack">
        <SegmentedControl
          size="md"
          value={tab}
          onChange={setTab}
          ariaLabel="Origen de la imagen"
          options={[
            { value: 'library', label: 'Biblioteca', icon: Images },
            { value: 'upload', label: 'Subir nueva imagen', icon: Upload },
          ]}
        />
        {tab === 'library' ? (
          <ImageLibrary
            mode="select"
            compact
            selectedId={selected?.id ?? currentImageId}
            onSelect={(image) => setSelected(image)}
            emptyAction={
              <Button variant="primary" icon={Upload} onClick={() => setTab('upload')}>
                Subir nueva imagen
              </Button>
            }
          />
        ) : (
          <ImageUploader
            maxUploadMb={config?.maxUploadMb}
            disabled={!cloudinaryReady}
            disabledReason="Cloudinary no está configurado en el servidor."
            onUploaded={(image) => onSelect(image)}
          />
        )}
      </div>
    </Modal>
  );
}
