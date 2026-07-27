import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useEmails, useRetryEmail, useCancelEmail } from '@/hooks/useEmails';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { RotateCcw, XCircle, Search, Clock, SlidersHorizontal, RefreshCw, Star } from 'lucide-react';
import dayjs from 'dayjs';

export const EmailTable = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get('status') || 'SCHEDULED';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [starredEmails, setStarredEmails] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, refetch } = useEmails({
    page,
    limit: 15,
    search: debouncedSearch,
    status: statusParam,
  });

  const { mutate: retryEmail, isPending: isRetrying } = useRetryEmail();
  const { mutate: cancelEmail, isPending: isCancelling } = useCancelEmail();

  const toggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setStarredEmails(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const stripHtml = (html: string) => {
    return html ? html.replace(/<[^>]*>?/gm, '').trim() : '';
  };

  return (
    <div className="space-y-4 max-w-[1200px] mx-auto p-4 sm:p-6">
      {/* Search Header Bar matching Figma */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search"
            className="pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border-none rounded-full text-sm focus-visible:ring-1 focus-visible:ring-[#00A859] placeholder:text-gray-400 text-gray-900 dark:text-white"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-400 hover:text-gray-600 rounded-full"
            title="Filter"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-400 hover:text-gray-600 rounded-full" 
            onClick={() => refetch()}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Email Rows List */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 shadow-sm overflow-hidden">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-32 rounded-full" />
              <Skeleton className="h-6 w-36 rounded-full" />
              <Skeleton className="h-4 flex-1 rounded-full" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
          ))
        ) : (!data?.data || !Array.isArray(data.data) || data.data.length === 0) ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No scheduled or sent emails found.
          </div>
        ) : (
          (data.data).map((email) => {
            const scheduleDate = email.scheduledAt || email.scheduleTime;
            const formattedTime = scheduleDate 
              ? dayjs(scheduleDate).format('ddd h:mm:ss A')
              : 'Immediate';

            const plainTextBody = stripHtml(email.body);
            return (
              <div 
                key={email.id} 
                onClick={() => navigate(`/emails/${email.id}`)}
                className="group flex items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors text-sm cursor-pointer"
              >
                {/* Recipient Name */}
                <div className="w-36 sm:w-44 shrink-0 font-semibold text-gray-900 dark:text-white capitalize truncate">
                  To: {email.recipientEmail}
                </div>

                {/* Time / Status Pill Badge */}
                {email.status === 'SENT' ? (
                  <div className="shrink-0 flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/40 text-[#00A859] border border-emerald-200 dark:border-emerald-900 px-3.5 py-1 rounded-full text-xs font-semibold">
                    Sent {email.sentAt ? `· ${dayjs(email.sentAt).format('MMM D, h:mm A')}` : ''}
                  </div>
                ) : email.status === 'FAILED' ? (
                  <div className="shrink-0 flex items-center justify-center bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 px-3.5 py-1 rounded-full text-xs font-semibold">
                    Failed
                  </div>
                ) : email.status === 'CANCELLED' ? (
                  <div className="shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 px-3.5 py-1 rounded-full text-xs font-medium">
                    Cancelled
                  </div>
                ) : (
                  <div className="shrink-0 flex items-center gap-1.5 bg-[#FFF4E5] dark:bg-amber-950/40 text-[#D97706] dark:text-amber-400 px-3.5 py-1 rounded-full text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{email.status} · {formattedTime}</span>
                  </div>
                )}

                {/* Subject & Text Snippet */}
                <div className="flex-1 min-w-0 truncate text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white mr-1.5">
                    {email.subject}
                  </span>
                  <span>- {plainTextBody || 'No preview text'}</span>
                </div>

                {/* Actions & Star Toggle */}
                <div className="flex items-center gap-2 shrink-0">
                  {email.status === 'FAILED' && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Retry"
                      className="h-8 w-8 text-amber-600 hover:text-amber-700"
                      disabled={isRetrying || isCancelling}
                      onClick={(e) => { e.stopPropagation(); retryEmail(email.id); }}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                  {(email.status === 'PENDING' || email.status === 'QUEUED') && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Cancel"
                      className="h-8 w-8 text-rose-500 hover:text-rose-600"
                      disabled={isRetrying || isCancelling}
                      onClick={(e) => { e.stopPropagation(); cancelEmail(email.id); }}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <button 
                    type="button"
                    onClick={(e) => toggleStar(e, email.id)}
                    className="p-1 text-gray-300 dark:text-gray-600 hover:text-amber-400 transition-colors"
                  >
                    <Star className={`w-4 h-4 ${starredEmails[email.id] ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-gray-400 pt-2">
          <span>Page {page} of {data.pagination.totalPages}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-xs"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-xs"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= data.pagination.totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
