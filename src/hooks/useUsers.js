import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService, userService } from '../services/authService.js';

export const useUsers = () => useQuery({ queryKey: ['users'], queryFn: userService.list });

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: userService.create, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }) });
}

export function useSetUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => userService.setStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

export const useChangePassword = () => useMutation({ mutationFn: authService.changePassword });
