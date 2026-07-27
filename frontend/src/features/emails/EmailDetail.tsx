import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Star, Trash2, RotateCcw, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useEmailDetail, useRetryEmail } from '@/hooks/useEmails';
import { Skeleton } from '@/components/ui/skeleton';
import dayjs from 'dayjs';

export const EmailDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const { data: email, isLoading } = useEmailDetail(id);
  const { mutate: retryEmail, isPending: isRetrying } = useRetryEmail();

  if (isLoading) {
    return (
      <div className="max-w-[1100px] mx-auto bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 space-y-6">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!email) {
    return (
      <div className="max-w-[1100px] mx-auto text-center py-20 text-gray-400">
        Email not found.
        <Button variant="link" onClick={() => navigate('/emails')} className="text-[#00A859] block mx-auto mt-2">
          ← Back to Emails
        </Button>
      </div>
    );
  }

  const isSent = email.status === 'SENT';
  const isFailed = email.status === 'FAILED';
  const recipientName = email.recipientEmail.includes('@')
    ? email.recipientEmail.split('@')[0].replace('.', ' ')
    : email.recipientEmail;

  return (
    <div className="max-w-[1100px] mx-auto bg-white dark:bg-gray-900 min-h-[85vh] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 sm:p-8 space-y-8">
      {/* Top Header Bar matching Figma */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-5">
        <div className="flex items-center gap-4 min-w-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full text-gray-500 hover:bg-gray-100 shrink-0"
            onClick={() => navigate('/emails')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
            {email.subject}
          </h1>
        </div>

        <div className="flex items-center gap-3 text-gray-400 shrink-0">
          {isFailed && (
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full text-xs text-amber-600 border-amber-200 hover:bg-amber-50"
              onClick={() => retryEmail(email.id)}
              disabled={isRetrying}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Retry
            </Button>
          )}
          <Button variant="ghost" size="icon" className="rounded-full hover:text-amber-400">
            <Star className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:text-rose-500">
            <Trash2 className="w-4 h-4" />
          </Button>
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center border border-amber-200 ml-2">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
          </div>
        </div>
      </div>

      {/* Sender & Recipient Info */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#00A859] text-white font-bold flex items-center justify-center text-sm shrink-0 uppercase">
            {(email.sender?.senderName || email.recipientEmail || 'E')[0]}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-gray-900 dark:text-white text-sm capitalize">
                {email.sender?.senderName || 'Sender'}
              </span>
              <span className="text-xs text-gray-400">
                &lt;{email.sender?.senderEmail || 'sender@domain.com'}&gt;
              </span>
            </div>
            <span className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5">
              To: <strong className="text-gray-800 dark:text-gray-200">{recipientName}</strong> &lt;{email.recipientEmail}&gt;
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5 ${
            isSent 
              ? 'bg-emerald-50 text-[#00A859] border border-emerald-200' 
              : isFailed 
              ? 'bg-rose-50 text-rose-600 border border-rose-200' 
              : 'bg-[#FFF4E5] text-[#D97706]'
          }`}>
            {isSent ? <CheckCircle2 className="w-3.5 h-3.5" /> : isFailed ? <XCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            <span>{email.status}</span>
          </span>
          <span className="text-xs text-gray-400 font-medium">
            {dayjs(email.scheduledAt || email.createdAt).format('MMM DD, YYYY · h:mm A')}
          </span>
        </div>
      </div>

      {/* Email Body Content */}
      <div className="space-y-4 text-sm text-gray-800 dark:text-gray-200 leading-relaxed max-w-4xl border-t border-gray-100 dark:border-gray-800 pt-6">
        <div 
          className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: email.body }}
        />
      </div>
    </div>
  );
};
