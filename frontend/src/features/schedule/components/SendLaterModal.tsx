import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarIcon } from 'lucide-react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

interface SendLaterModalProps {
  scheduledDateTime: string;
  setScheduledDateTime: (val: string) => void;
  setValue: (field: any, val: any) => void;
  onClose: () => void;
}

export const SendLaterModal = ({
  scheduledDateTime,
  setScheduledDateTime,
  setValue,
  onClose,
}: SendLaterModalProps) => {
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

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
        <button 
          type="button" 
          onClick={onClose}
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
            onClose();
          }}
          className="border border-[#00A859] hover:bg-emerald-50 text-[#00A859] bg-transparent text-xs font-semibold px-4 py-1.5 rounded-full shadow-none"
        >
          Done
        </Button>
      </div>
    </div>
  );
};
