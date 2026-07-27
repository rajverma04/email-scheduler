import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/api/dashboard.api';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
    staleTime: 2000,
    refetchOnMount: 'always',
    refetchInterval: 5000,
  });
};
