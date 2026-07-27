import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmails, getEmailById, retryEmail, cancelEmail } from '@/api/email.api';
import toast from 'react-hot-toast';

interface UseEmailsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const useEmails = (params: UseEmailsParams) => {
  return useQuery({
    queryKey: ['emails', params],
    queryFn: () => getEmails(params),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });
};

export const useEmailDetail = (id?: string) => {
  return useQuery({
    queryKey: ['email', id],
    queryFn: () => getEmailById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });
};

export const useRetryEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: retryEmail,
    onSuccess: () => {
      toast.success('Email queued for retry');
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to retry email');
    }
  });
};

export const useCancelEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelEmail,
    onSuccess: () => {
      toast.success('Email cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to cancel email');
    }
  });
};
