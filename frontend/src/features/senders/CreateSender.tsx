import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateSender } from '@/hooks/useSenders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

const senderSchema = z.object({
  senderName: z.string().min(1, 'Name is required'),
  senderEmail: z.string().email('Invalid email address'),
  smtpHost: z.string().min(1, 'SMTP Host is required'),
  smtpPort: z.number().min(1, 'Valid port is required'),
  smtpUser: z.string().min(1, 'SMTP User is required'),
  smtpPassword: z.string().min(1, 'SMTP Password is required'),
  hourlyLimit: z.number().min(1, 'Hourly limit is required'),
});

type SenderFormValues = z.infer<typeof senderSchema>;

export const CreateSender = () => {
  const [open, setOpen] = useState(false);
  const { mutate: createSender, isPending } = useCreateSender();
  
  const form = useForm<SenderFormValues>({
    resolver: zodResolver(senderSchema),
    defaultValues: {
      senderName: '',
      senderEmail: '',
      smtpHost: 'smtp.gmail.com',
      smtpPort: 465,
      smtpUser: '',
      smtpPassword: '',
      hourlyLimit: 50,
    },
  });

  const onSubmit = (data: SenderFormValues) => {
    createSender(data, {
      onSuccess: () => {
        form.reset();
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Sender
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Sender</DialogTitle>
          <DialogDescription>
            Add a new sender identity and its SMTP configuration.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 pt-2 flex-wrap">
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            className="flex-1 text-xs rounded-xl border-emerald-200 bg-emerald-50/50 text-emerald-800 hover:bg-emerald-100 font-medium"
            onClick={() => {
              form.setValue('smtpHost', 'smtp.gmail.com');
              form.setValue('smtpPort', 465);
            }}
          >
            📧 Gmail
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            className="flex-1 text-xs rounded-xl border-blue-200 bg-blue-50/50 text-blue-800 hover:bg-blue-100 font-medium"
            onClick={() => {
              form.setValue('smtpHost', 'smtp.office365.com');
              form.setValue('smtpPort', 587);
            }}
          >
            💼 Outlook
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            className="flex-1 text-xs rounded-xl border-amber-200 bg-amber-50/50 text-amber-800 hover:bg-amber-100 font-medium"
            onClick={() => {
              form.setValue('smtpHost', 'smtp.ethereal.email');
              form.setValue('smtpPort', 587);
              form.setValue('senderName', 'Ethereal Test Sender');
            }}
          >
            ⚡ Ethereal
          </Button>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sender Name</Label>
              <Input placeholder="John Doe" {...form.register('senderName')} />
              {form.formState.errors.senderName && (
                <p className="text-sm text-red-500">{form.formState.errors.senderName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Sender Email</Label>
              <Input type="email" placeholder="john@example.com" {...form.register('senderEmail')} />
              {form.formState.errors.senderEmail && (
                <p className="text-sm text-red-500">{form.formState.errors.senderEmail.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SMTP Host</Label>
              <Input placeholder="e.g. smtp.gmail.com, mail.domain.com" {...form.register('smtpHost')} />
              {form.formState.errors.smtpHost && (
                <p className="text-sm text-red-500">{form.formState.errors.smtpHost.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>SMTP Port</Label>
              <Input type="number" placeholder="465 or 587" {...form.register('smtpPort', { valueAsNumber: true })} />
              {form.formState.errors.smtpPort && (
                <p className="text-sm text-red-500">{form.formState.errors.smtpPort.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SMTP User</Label>
              <Input placeholder="user@domain.com" {...form.register('smtpUser')} />
              {form.formState.errors.smtpUser && (
                <p className="text-sm text-red-500">{form.formState.errors.smtpUser.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>SMTP Password</Label>
              <Input type="password" placeholder="••••••••••••" {...form.register('smtpPassword')} />
              {form.formState.errors.smtpPassword && (
                <p className="text-sm text-red-500">{form.formState.errors.smtpPassword.message}</p>
              )}
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground bg-muted/50 p-2 rounded-lg border border-border/50">
            💡 <strong>Tip for Gmail:</strong> Gmail requires an <strong>App Password</strong> generated from your Google Account settings (Security &gt; 2-Step Verification &gt; App Passwords), not your regular account password.
          </p>

          <div className="space-y-2">
            <Label>Hourly Sending Limit</Label>
            <Input type="number" {...form.register('hourlyLimit', { valueAsNumber: true })} />
            {form.formState.errors.hourlyLimit && (
              <p className="text-sm text-red-500">{form.formState.errors.hourlyLimit.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full mt-4" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Sender'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
