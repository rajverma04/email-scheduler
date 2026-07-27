import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useScheduleEmail } from '@/hooks/useScheduleEmail';
import { useSenders } from '@/hooks/useSenders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { ArrowLeft, Paperclip, Clock } from 'lucide-react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

import { SendLaterModal } from './components/SendLaterModal';
import { RecipientInput } from './components/RecipientInput';
import { EmailRichEditor, type AttachmentItem } from './components/EmailRichEditor';

const scheduleSchema = z.object({
  senderId: z.string().min(1, 'Please select a sender'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
  recipients: z.array(z.object({ email: z.string().email() })).min(1, 'At least one recipient is required'),
  scheduleTime: z.string().optional(),
  delayBetweenEmails: z.number().int().min(1, 'Delay must be at least one second'),
  hourlyLimit: z.number().int().min(1, 'Hourly limit must be at least one'),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

export const ScheduleForm = () => {
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const { data: senders, isLoading: loadingSenders } = useSenders();
  const { mutate: scheduleEmail, isPending } = useScheduleEmail();

  const [showSendLater, setShowSendLater] = useState(false);
  const [manualEmail, setManualEmail] = useState('');
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      senderId: '',
      subject: '',
      body: '',
      recipients: [],
      scheduleTime: '',
      delayBetweenEmails: 2,
      hourlyLimit: 200,
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = form;
  const recipients = watch('recipients');
  const selectedSenderId = watch('senderId');

  const selectedSender = senders?.find((s) => s.id === selectedSenderId);

  useEffect(() => {
    if (senders && senders.length > 0 && !selectedSenderId) {
      setValue('senderId', senders[0].id, { shouldValidate: true });
    }
  }, [senders, selectedSenderId, setValue]);

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: AttachmentItem[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      size: (file.size / 1024).toFixed(1) + ' KB',
    }));

    setAttachments((prev) => [...prev, ...newItems]);
    toast.success(`Attached ${newItems.length} file(s)`);
    if (e.target) e.target.value = '';
  };

  const removeAttachment = (idToRemove: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== idToRemove));
  };

  const onSubmit = (data: ScheduleFormValues) => {
    let currentRecipients = [...data.recipients];

    if (manualEmail.trim()) {
      const emailToAdd = manualEmail.trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(emailToAdd)) {
        toast.error('Invalid email address in recipient input field');
        return;
      }
      if (!currentRecipients.some((r) => r.email.toLowerCase() === emailToAdd)) {
        currentRecipients.push({ email: emailToAdd });
        setValue('recipients', currentRecipients, { shouldValidate: true });
        setManualEmail('');
      }
    }

    if (currentRecipients.length === 0) {
      toast.error('Please enter at least one recipient email address');
      return;
    }

    const currentBody = editorRef.current?.innerHTML || data.body;
    const cleanTextBody = editorRef.current?.innerText?.trim() || '';
    if (!cleanTextBody && !currentBody.includes('<img')) {
      toast.error('Email body is required');
      return;
    }

    const payload = {
      ...data,
      recipients: currentRecipients,
      body: currentBody,
      scheduleTime: scheduledDateTime || data.scheduleTime,
    };

    scheduleEmail(payload, {
      onSuccess: () => {
        form.reset();
        if (editorRef.current) editorRef.current.innerHTML = '';
        setAttachments([]);
        setShowSendLater(false);
        navigate('/emails');
      },
    });
  };

  const onError = (formErrors: any) => {
    const errorKeys = Object.keys(formErrors);
    if (errorKeys.length > 0) {
      const firstError = formErrors[errorKeys[0]];
      toast.error(firstError?.message || 'Please fill in all required fields');
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6 relative">

      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-5">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-gray-500 hover:bg-gray-100"
            onClick={() => navigate('/emails')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Compose New Email
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => attachmentInputRef.current?.click()}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
            title="Attach Files"
          >
            <Paperclip className="w-4 h-4" />
            {attachments.length > 0 && (
              <span className="text-[10px] font-extrabold text-[#00A859] absolute -top-0.5 -right-0.5 bg-emerald-50 px-1 rounded-full border border-emerald-200">
                {attachments.length}
              </span>
            )}
          </button>
          <input
            ref={attachmentInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleAttachmentUpload}
          />

          <Button
            variant="ghost"
            size="icon"
            type="button"
            className={cn(
              "rounded-full text-gray-400 hover:text-gray-600 transition-colors relative",
              scheduledDateTime && "text-[#00A859] bg-emerald-50 border border-emerald-200"
            )}
            onClick={() => setShowSendLater(!showSendLater)}
            title={scheduledDateTime ? `Scheduled for ${dayjs(scheduledDateTime).format('MMM DD, YYYY h:mm A')}` : "Schedule Time"}
          >
            <Clock className="w-4 h-4" />
            {scheduledDateTime && (
              <span className="w-2 h-2 rounded-full bg-[#00A859] absolute top-1 right-1" />
            )}
          </Button>

          <Button
            type="button"
            onClick={handleSubmit(onSubmit, onError)}
            disabled={isPending}
            className="border-2 border-[#00A859] hover:bg-emerald-50 text-[#00A859] bg-transparent font-medium px-5 py-2 rounded-full transition-colors text-sm shadow-none"
          >
            {scheduledDateTime
              ? `Send Later (${dayjs(scheduledDateTime).format('MMM DD, h:mm A')})`
              : 'Send'}
          </Button>
        </div>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">

        {/* From Field */}
        <div className="flex items-center gap-4">
          <span className="w-16 text-sm font-semibold text-gray-400">From</span>
          <div className="flex-1 max-w-xs">
            <Select value={selectedSenderId} onValueChange={(val: string | null) => val && setValue('senderId', val, { shouldValidate: true })}>
              <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-medium text-gray-800 dark:text-gray-200">
                <span>
                  {loadingSenders
                    ? "Loading..."
                    : selectedSender
                      ? `${selectedSender.senderEmail} (${selectedSender.senderName})`
                      : "Select sender email"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {senders?.map((sender) => (
                  <SelectItem key={sender.id} value={sender.id}>
                    {sender.senderEmail} ({sender.senderName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {errors.senderId && <span className="text-xs text-rose-500">{errors.senderId.message}</span>}
        </div>

        {/* To Field */}
        <RecipientInput
          recipients={recipients}
          manualEmail={manualEmail}
          setManualEmail={setManualEmail}
          setValue={setValue}
          error={errors.recipients?.message}
        />

        {/* Subject Field */}
        <div className="space-y-1 border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-4">
            <span className="w-16 text-sm font-semibold text-gray-400">Subject</span>
            <Input
              placeholder="Subject"
              {...register('subject')}
              className="border-none shadow-none focus-visible:ring-0 text-sm p-0 placeholder:text-gray-300 flex-1"
            />
          </div>
          {errors.subject && <p className="text-xs text-rose-500 pl-20">{errors.subject.message}</p>}
        </div>

        {/* Inline Limits */}
        <div className="flex items-center gap-6 text-xs text-gray-400 pt-1 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span>Delay between emails (seconds)</span>
            <Input
              type="number"
              defaultValue={2}
              {...register('delayBetweenEmails', { valueAsNumber: true })}
              className="w-14 h-8 text-center bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <span>Hourly Limit (max emails/hour)</span>
            <Input
              type="number"
              defaultValue={200}
              {...register('hourlyLimit', { valueAsNumber: true })}
              className="w-14 h-8 text-center bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-xs"
            />
          </div>
        </div>

        {/* Rich Text Editor Body */}
        <EmailRichEditor
          editorRef={editorRef}
          setValue={setValue}
          attachments={attachments}
          removeAttachment={removeAttachment}
          error={errors.body?.message}
        />
      </form>

      {/* Send Later Overlay Modal */}
      {showSendLater && (
        <SendLaterModal
          scheduledDateTime={scheduledDateTime}
          setScheduledDateTime={setScheduledDateTime}
          setValue={setValue}
          onClose={() => setShowSendLater(false)}
        />
      )}
    </div>
  );
};
