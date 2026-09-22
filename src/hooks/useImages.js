import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { imageService } from '../services/imageService.js';

export const imageKeys = {
  all: ['images'],
  list: (search) => ['images', 'list', search],
};

export const useImages = (search = '') =>
  useQuery({ queryKey: imageKeys.list(search), queryFn: () => imageService.list(search), placeholderData: (prev) => prev });

function useInvalidateImages() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: imageKeys.all });
    queryClient.invalidateQueries({ queryKey: ['stats'] });
  };
}

export function useUploadImage() {
  const invalidate = useInvalidateImages();
  return useMutation({
    mutationFn: ({ data, onProgress }) => imageService.upload(data, onProgress),
    onSuccess: invalidate,
  });
}

export function useUpdateImage() {
  const invalidate = useInvalidateImages();
  return useMutation({ mutationFn: ({ id, data }) => imageService.update(id, data), onSuccess: invalidate });
}

export function useDeleteImage() {
  const invalidate = useInvalidateImages();
  return useMutation({ mutationFn: imageService.remove, onSuccess: invalidate });
}
