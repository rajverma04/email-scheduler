import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleEmail } from '@/api/email.api';
import toast from 'react-hot-toast';

export const useScheduleEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: scheduleEmail,
    onSuccess: () => {
      toast.success('Email(s) scheduled successfully!');
      // Invalidate dashboard and emails to refetch stats and lists
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
    onError: (error: any) => {
      const serverMsg = error?.response?.data?.error || error?.response?.data?.message;
      toast.error(serverMsg || 'Failed to schedule emails');
    }
  });
};
