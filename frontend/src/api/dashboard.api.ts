import api from './axios';

export interface DashboardStats {
  scheduled: number;
  sent: number;
  failed: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get('/dashboard/stats');
  return data;
};

export const getRecentEmails = async () => {
  const { data } = await api.get('/dashboard/recent');
  return data;
};

