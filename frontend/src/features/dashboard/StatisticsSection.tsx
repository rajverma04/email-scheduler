import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import type { DashboardStats } from '@/api/dashboard.api';
import { Skeleton } from '@/components/ui/skeleton';

export const StatisticsSection = ({ stats, isLoading }: { stats?: DashboardStats, isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  const scheduled = stats?.scheduled || 0;
  const sent = stats?.sent || 0;
  const failed = stats?.failed || 0;
  const total = scheduled + sent + failed;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="rounded-2xl border-gray-100 dark:border-gray-800 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-400">Total Emails</CardTitle>
          <Mail className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{total}</div>
        </CardContent>
      </Card>
      
      <Card className="rounded-2xl border-gray-100 dark:border-gray-800 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-400">Scheduled</CardTitle>
          <Calendar className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{scheduled}</div>
        </CardContent>
      </Card>
      
      <Card className="rounded-2xl border-gray-100 dark:border-gray-800 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-400">Sent</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold text-[#00A859]">{sent}</div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-gray-100 dark:border-gray-800 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-400">Failed</CardTitle>
          <XCircle className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">{failed}</div>
        </CardContent>
      </Card>
    </div>
  );
};
