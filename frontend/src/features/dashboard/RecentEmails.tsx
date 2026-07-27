import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';
import { useEmails } from '@/hooks/useEmails';
import { Skeleton } from '@/components/ui/skeleton';
import dayjs from 'dayjs';

export const RecentEmails = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useEmails({ page: 1, limit: 5 });

  const emails = data?.data || [];

  return (
    <Card className="mt-6 rounded-2xl border-gray-100 dark:border-gray-800 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</CardTitle>
          <CardDescription className="text-xs text-gray-400">Latest emails scheduled or sent from your account.</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/emails')}
          className="rounded-full border-gray-200 text-xs font-semibold hover:bg-gray-50"
        >
          View All
        </Button>
      </CardHeader>
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
            <p className="text-sm font-medium">No recent email activity found.</p>
            <Button 
              variant="link" 
              onClick={() => navigate('/schedule')}
              className="text-[#00A859] font-semibold text-xs mt-1"
            >
              + Compose First Email
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {emails.map((email: any) => {
              const isSent = email.status === 'SENT';
              const isFailed = email.status === 'FAILED';

              return (
                <div 
                  key={email.id} 
                  onClick={() => navigate(`/emails/${email.id}`)}
                  className="flex items-center justify-between p-4 sm:px-6 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-xs text-gray-600 dark:text-gray-300 shrink-0">
                      {(email.recipientEmail || 'E')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {email.recipientEmail}
                      </div>
                      <div className="text-xs text-gray-400 truncate max-w-sm">
                        {email.subject}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      isSent 
                        ? 'bg-gray-100 text-gray-500' 
                        : isFailed 
                        ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                        : 'bg-[#FFF4E5] text-[#D97706]'
                    }`}>
                      {email.status === 'PENDING' || email.status === 'QUEUED' ? `Scheduled ${dayjs(email.scheduledAt || email.createdAt).format('hh:mm A')}` : email.status}
                    </span>

                    <span className="text-xs text-gray-400 hidden sm:inline-block">
                      {dayjs(email.createdAt).format('MMM DD, YYYY')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
