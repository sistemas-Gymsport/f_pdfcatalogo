import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogService } from '../services/catalogService.js';

export const catalogKeys = {
  all: ['catalogs'],
  list: (search) => ['catalogs', 'list', search],
  detail: (id) => ['catalogs', 'detail', id],
  stats: ['stats'],
};

export const useCatalogs = (search = '') =>
  useQuery({ queryKey: catalogKeys.list(search), queryFn: () => catalogService.list(search), placeholderData: (prev) => prev });

export const useCatalog = (id, options = {}) =>
  useQuery({ queryKey: catalogKeys.detail(id), queryFn: () => catalogService.get(id), enabled: Boolean(id), ...options });

export const useStats = () => useQuery({ queryKey: catalogKeys.stats, queryFn: catalogService.stats });

/** Invalida listados y estadísticas tras cualquier cambio. */
function useInvalidateCatalogs() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: catalogKeys.all });
    queryClient.invalidateQueries({ queryKey: catalogKeys.stats });
  };
}

export function useCreateCatalog() {
  const invalidate = useInvalidateCatalogs();
  return useMutation({ mutationFn: catalogService.create, onSuccess: invalidate });
}

export function useUpdateCatalog() {
  const invalidate = useInvalidateCatalogs();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => catalogService.update(id, data),
    onSuccess: (catalog) => {
      queryClient.setQueryData(catalogKeys.detail(catalog.id), catalog);
      invalidate();
    },
  });
}

export function useDuplicateCatalog() {
  const invalidate = useInvalidateCatalogs();
  return useMutation({ mutationFn: catalogService.duplicate, onSuccess: invalidate });
}

export function useDeleteCatalog() {
  const invalidate = useInvalidateCatalogs();
  return useMutation({ mutationFn: catalogService.remove, onSuccess: invalidate });
}
