import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Papa from 'papaparse';

interface RecipientInputProps {
  recipients: { email: string }[];
  manualEmail: string;
  setManualEmail: (val: string) => void;
  setValue: (field: any, val: any, options?: any) => void;
  error?: string;
}

export const RecipientInput = ({
  recipients,
  manualEmail,
  setManualEmail,
  setValue,
  error,
}: RecipientInputProps) => {
  const csvInputRef = useRef<HTMLInputElement>(null);

  const addManualEmail = () => {
    if (!manualEmail) return;
    if (!/^\S+@\S+\.\S+$/.test(manualEmail)) {
      toast.error('Invalid email address');
      return;
    }
    if (recipients.some((r) => r.email === manualEmail)) {
      toast.error('Email already added');
      return;
    }
    setValue('recipients', [...recipients, { email: manualEmail }], { shouldValidate: true });
    setManualEmail('');
  };

  const removeRecipient = (emailToRemove: string) => {
    setValue('recipients', recipients.filter((r) => r.email !== emailToRemove), { shouldValidate: true });
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

      const newRecipients = parsedEmails.map((email) => ({ email }));
      const merged = [...recipients, ...newRecipients];
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

  return (
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
      {error && <p className="text-xs text-rose-500 pl-20">{error}</p>}
    </div>
  );
};
