import { FileQuestion } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';

export default function NotFoundPage() {
  return (
    <div style={{ maxWidth: 520, margin: '12vh auto', padding: 16 }}>
      <EmptyState
        icon={FileQuestion}
        title="Página no encontrada"
        description="La dirección no existe o fue movida."
        action={<Button variant="primary" to="/admin">Ir al panel</Button>}
      />
    </div>
  );
}
