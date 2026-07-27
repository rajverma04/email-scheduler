import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useScheduleEmail } from '@/hooks/useScheduleEmail';
import { useSenders } from '@/hooks/useSenders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { 
  ArrowLeft, Paperclip, Clock, Calendar as CalendarIcon, Undo2, Redo2, 
  Type, Bold, Italic, Underline, AlignLeft, List, ListOrdered, 
  Quote, Link as LinkIcon, Strikethrough, Upload, X 
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import Papa from 'papaparse';

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

export interface AttachmentItem {
  id: string;
  name: string;
  url: string;
  type: string;
  size: string;
}

export const ScheduleForm = () => {
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
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

  const selectedSender = senders?.find(s => s.id === selectedSenderId);

  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});

  // Auto-select first available sender if none is selected
  useEffect(() => {
    if (senders && senders.length > 0 && !selectedSenderId) {
      setValue('senderId', senders[0].id, { shouldValidate: true });
    }
  }, [senders, selectedSenderId, setValue]);

  const updateActiveFormats = () => {
    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        insertOrderedList: document.queryCommandState('insertOrderedList'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        justifyLeft: document.queryCommandState('justifyLeft'),
      });
    } catch {
      // Ignore queryCommandState errors
    }
  };

  const formatCommand = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value ?? undefined);
    if (editorRef.current) {
      setValue('body', editorRef.current.innerHTML, { shouldValidate: true });
    }
    updateActiveFormats();
  };

  const handleLinkPrompt = () => {
    const url = prompt('Enter URL link:');
    if (url) {
      formatCommand('createLink', url);
    }
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: AttachmentItem[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      size: (file.size / 1024).toFixed(1) + ' KB',
    }));

    setAttachments(prev => [...prev, ...newItems]);
    toast.success(`Attached ${newItems.length} file(s)`);
    if (e.target) e.target.value = '';
  };

  const removeAttachment = (idToRemove: string) => {
    setAttachments(prev => prev.filter(item => item.id !== idToRemove));
  };

  const onSubmit = (data: ScheduleFormValues) => {
    let currentRecipients = [...data.recipients];
    
    // Auto-add text typed in the recipient input field if valid email
    if (manualEmail.trim()) {
      const emailToAdd = manualEmail.trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(emailToAdd)) {
        toast.error('Invalid email address in recipient input field');
        return;
      }
      if (!currentRecipients.some(r => r.email.toLowerCase() === emailToAdd)) {
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const importEmails = (values: string[]) => {
      const parsedEmails = values
        .map((value) => value.trim().toLowerCase())
        .filter((email) => /^\S+@\S+\.\S+$/.test(email));

      if (parsedEmails.length === 0) {
        toast.error('No valid email addresses were found in the selected file');
        return;
      }

      const currentRecipients = watch('recipients');
      const newRecipients = parsedEmails.map((email) => ({ email }));
      const merged = [...currentRecipients, ...newRecipients];
      const unique = Array.from(new Map(merged.map((item) => [item.email, item])).values());
      setValue('recipients', unique, { shouldValidate: true });
      toast.success(`Detected ${unique.length} unique email address${unique.length === 1 ? '' : 'es'}`);
    };

    if (file.name.toLowerCase().endsWith('.txt') || file.type === 'text/plain') {
      file.text().then((text) => importEmails(text.split(/[\s,;]+/)));
    } else {
      Papa.parse<string[]>(file, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => importEmails(results.data.flatMap((row) => row)),
      });
    }
    if (e.target) e.target.value = '';
  };

  const addManualEmail = () => {
    if (!manualEmail) return;
    if (!/^\S+@\S+\.\S+$/.test(manualEmail)) {
      toast.error('Invalid email address');
      return;
    }
    const currentRecipients = watch('recipients');
    if (currentRecipients.some(r => r.email === manualEmail)) {
      toast.error('Email already added');
      return;
    }
    setValue('recipients', [...currentRecipients, { email: manualEmail }], { shouldValidate: true });
    setManualEmail('');
  };

  const removeRecipient = (emailToRemove: string) => {
    const currentRecipients = watch('recipients');
    setValue('recipients', currentRecipients.filter(r => r.email !== emailToRemove), { shouldValidate: true });
  };

  const setPresetTime = (preset: string) => {
    let target = dayjs();
    if (preset === 'tomorrow') {
      target = target.add(1, 'day').hour(9).minute(0);
    } else if (preset === '10am') {
      target = target.add(1, 'day').hour(10).minute(0);
    } else if (preset === '11am') {
      target = target.add(1, 'day').hour(11).minute(0);
    } else if (preset === '3pm') {
      target = target.add(1, 'day').hour(15).minute(0);
    }
    const formatted = target.format('YYYY-MM-DDTHH:mm');
    setScheduledDateTime(formatted);
    setValue('scheduleTime', formatted);
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
                {senders?.map(sender => (
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
        <div className="space-y-1 border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-4">
            <span className="w-16 text-sm font-semibold text-gray-400">To</span>
            <div className="flex-1 flex flex-wrap items-center gap-2">
              {recipients.map((r, i) => (
                <span key={i} className="bg-emerald-50 text-[#00A859] border border-emerald-200 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  {r.email}
                  <button type="button" onClick={() => removeRecipient(r.email)} className="hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <Input 
                placeholder="recipient@example.com"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addManualEmail())}
                className="border-none shadow-none focus-visible:ring-0 text-sm p-0 placeholder:text-gray-300 flex-1 min-w-[200px]"
              />
            </div>

            <button 
              type="button"
              onClick={() => csvInputRef.current?.click()}
              className="flex items-center gap-1.5 text-[#00A859] hover:text-[#00924D] font-semibold text-xs shrink-0 ml-auto transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload List ({recipients.length})
            </button>
            <input 
              ref={csvInputRef} 
              type="file" 
              accept=".csv,.txt,text/plain" 
              className="hidden" 
              onChange={handleFileUpload} 
            />
          </div>
          {errors.recipients && <p className="text-xs text-rose-500 pl-20">{errors.recipients.message}</p>}
        </div>

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

        {/* Rich Text Editor Body matching Figma Gray Container */}
        <div className="bg-[#F8FAFC] dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 min-h-[380px] space-y-4">
          
          {/* Floating White Pill Formatting Toolbar */}
          <div className="bg-white dark:bg-gray-900 rounded-full shadow-sm border border-gray-100 dark:border-gray-800 px-4 py-1.5 flex items-center gap-1 text-gray-500 text-xs w-fit mx-auto">
            <button 
              type="button" 
              onClick={() => formatCommand('undo')} 
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 transition-colors" 
              title="Undo"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button 
              type="button" 
              onClick={() => formatCommand('redo')} 
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 transition-colors" 
              title="Redo"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>

            <span className="h-4 w-px bg-gray-200 dark:bg-gray-800 mx-1" />

            <button 
              type="button" 
              onClick={() => formatCommand('fontSize', '4')} 
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 flex items-center gap-0.5 transition-colors" 
              title="Font Size"
            >
              <Type className="w-3.5 h-3.5" /><span className="text-[10px]">Tт</span>
            </button>

            <span className="h-4 w-px bg-gray-200 dark:bg-gray-800 mx-1" />

            <button 
              type="button" 
              onClick={() => formatCommand('bold')} 
              className={cn("p-1.5 rounded-full transition-colors font-bold", activeFormats.bold ? "bg-[#EAF5ED] text-[#00A859]" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800")} 
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>

            <button 
              type="button" 
              onClick={() => formatCommand('italic')} 
              className={cn("p-1.5 rounded-full transition-colors italic", activeFormats.italic ? "bg-[#EAF5ED] text-[#00A859]" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800")} 
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>

            <button 
              type="button" 
              onClick={() => formatCommand('underline')} 
              className={cn("p-1.5 rounded-full transition-colors underline", activeFormats.underline ? "bg-[#EAF5ED] text-[#00A859]" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800")} 
              title="Underline"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>

            <button 
              type="button" 
              onClick={() => formatCommand('strikeThrough')} 
              className={cn("p-1.5 rounded-full transition-colors line-through", activeFormats.strikeThrough ? "bg-[#EAF5ED] text-[#00A859]" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800")} 
              title="Strikethrough"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>

            <span className="h-4 w-px bg-gray-200 dark:bg-gray-800 mx-1" />

            <button 
              type="button" 
              onClick={() => formatCommand('justifyLeft')} 
              className={cn("p-1.5 rounded-full transition-colors", activeFormats.justifyLeft ? "bg-[#EAF5ED] text-[#00A859]" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800")} 
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>

            <button 
              type="button" 
              onClick={() => formatCommand('insertOrderedList')} 
              className={cn("p-1.5 rounded-full transition-colors", activeFormats.insertOrderedList ? "bg-[#EAF5ED] text-[#00A859]" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800")} 
              title="Numbered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>

            <button 
              type="button" 
              onClick={() => formatCommand('insertUnorderedList')} 
              className={cn("p-1.5 rounded-full transition-colors", activeFormats.insertUnorderedList ? "bg-[#EAF5ED] text-[#00A859]" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800")} 
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>

            <button 
              type="button" 
              onClick={() => formatCommand('formatBlock', 'blockquote')} 
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 transition-colors" 
              title="Quote"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>

            <button 
              type="button" 
              onClick={handleLinkPrompt} 
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 transition-colors" 
              title="Insert Link"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Interactive contentEditable Rich Text Area */}
          <div 
            ref={editorRef}
            contentEditable
            onInput={() => {
              if (editorRef.current) {
                setValue('body', editorRef.current.innerHTML, { shouldValidate: true });
              }
              updateActiveFormats();
            }}
            onKeyUp={updateActiveFormats}
            onMouseUp={updateActiveFormats}
            onClick={updateActiveFormats}
            data-placeholder="Type Your Reply..."
            className="w-full min-h-[160px] focus:outline-none text-sm text-gray-800 dark:text-gray-200 p-2 border-none rounded-xl empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300"
          />

          {/* User Uploaded System Attachment Thumbnail Cards */}
          {attachments.length > 0 && (
            <div className="pt-3 flex flex-wrap gap-3 border-t border-gray-200/60 dark:border-gray-700/60">
              {attachments.map(att => (
                <div key={att.id} className="relative group">
                  {att.type.startsWith('image/') ? (
                    <div className="w-36 h-24 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm relative">
                      <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => removeAttachment(att.id)}
                        className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-full p-1 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm">
                      <Paperclip className="w-4 h-4 text-[#00A859]" />
                      <div className="text-xs max-w-[120px] truncate">
                        <div className="font-medium text-gray-800 dark:text-gray-200 truncate">{att.name}</div>
                        <div className="text-[10px] text-gray-400">{att.size}</div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeAttachment(att.id)}
                        className="text-gray-400 hover:text-rose-500 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {errors.body && <p className="text-xs text-rose-500">{errors.body.message}</p>}
        </div>
      </form>

      {/* Send Later Overlay Modal matching Figma */}
      {showSendLater && (
        <div className="absolute top-16 right-8 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-2xl z-50 space-y-4 animate-in fade-in zoom-in-95">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">
            Send Later
          </h3>

          <div className="relative">
            <Input 
              type="datetime-local" 
              value={scheduledDateTime}
              onChange={(e) => {
                const val = e.target.value;
                setScheduledDateTime(val);
                setValue('scheduleTime', val);
              }}
              className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-xs px-3 py-2 pr-8 text-gray-800 dark:text-gray-200"
            />
            <CalendarIcon className="w-4 h-4 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5 pt-1 text-xs text-gray-500 dark:text-gray-400">
            <div 
              onClick={() => setPresetTime('tomorrow')} 
              className="px-2.5 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer font-medium hover:text-gray-900"
            >
              Tomorrow
            </div>
            <div 
              onClick={() => setPresetTime('10am')} 
              className="px-2.5 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer hover:text-gray-900"
            >
              Tomorrow, 10:00 AM
            </div>
            <div 
              onClick={() => setPresetTime('11am')} 
              className="px-2.5 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer hover:text-gray-900"
            >
              Tomorrow, 11:00 AM
            </div>
            <div 
              onClick={() => setPresetTime('3pm')} 
              className="px-2.5 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer hover:text-gray-900"
            >
              Tomorrow, 3:00 PM
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button 
              type="button" 
              onClick={() => setShowSendLater(false)}
              className="text-xs text-gray-500 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <Button 
              type="button"
              onClick={() => {
                if (scheduledDateTime) {
                  setValue('scheduleTime', scheduledDateTime);
                  toast.success(`Scheduled for ${dayjs(scheduledDateTime).format('MMM DD, YYYY h:mm A')}`);
                }
                setShowSendLater(false);
              }}
              className="border border-[#00A859] hover:bg-emerald-50 text-[#00A859] bg-transparent text-xs font-semibold px-4 py-1.5 rounded-full shadow-none"
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
