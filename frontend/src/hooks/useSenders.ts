import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSenders, createSender, deleteSender } from '@/api/sender.api';
import toast from 'react-hot-toast';

const extractErrorMessage = (error: any, fallback: string): string => {
  const dataErr = error?.response?.data?.error || error?.response?.data?.message;
  if (!dataErr) return error?.message || fallback;
  if (typeof dataErr === 'string') return dataErr;
  if (Array.isArray(dataErr)) {
    return dataErr.map((item) => (typeof item === 'string' ? item : item?.message || JSON.stringify(item))).join(', ');
  }
  if (typeof dataErr === 'object') {
    return dataErr?.message || JSON.stringify(dataErr);
  }
  return String(dataErr);
};

export const useSenders = () => {
  return useQuery({
    queryKey: ['senders'],
    queryFn: getSenders,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });
};

export const useCreateSender = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createSender,
    onSuccess: () => {
      toast.success('Sender profile created');
      queryClient.invalidateQueries({ queryKey: ['senders'] });
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to create sender'));
    }
  });
};

export const useDeleteSender = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteSender,
    onSuccess: () => {
      toast.success('Sender profile deleted');
      queryClient.invalidateQueries({ queryKey: ['senders'] });
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to delete sender'));
    }
  });
};
