import { useDashboard } from '@/hooks/useDashboard';
import { StatisticsSection } from './StatisticsSection';
import { RecentEmails } from './RecentEmails';
import { useAuthStore } from '@/store/authStore';

export const Dashboard = () => {
  const { data: stats, isLoading } = useDashboard();
  const user = useAuthStore(state => state.user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
        <p className="text-muted-foreground mt-2">
          Here's an overview of your email campaigns and schedule.
        </p>
      </div>
      
      <StatisticsSection stats={stats} isLoading={isLoading} />
      
      <RecentEmails />
    </div>
  );
};
