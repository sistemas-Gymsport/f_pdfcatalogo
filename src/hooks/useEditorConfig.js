import { useQuery } from '@tanstack/react-query';
import { configService } from '../services/catalogService.js';

/** Formatos de página, fuentes y estado de servicios (cambia muy poco). */
export const useEditorConfig = () =>
  useQuery({ queryKey: ['config'], queryFn: configService.get, staleTime: 30 * 60 * 1000 });
