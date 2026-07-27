import { SenderTable } from './SenderTable';
import { CreateSender } from './CreateSender';

export const SendersPage = () => {
  return (
    <div className="space-y-6 max-w-[1000px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Senders</h1>
          <p className="text-muted-foreground mt-2">
            Manage email addresses you send from.
          </p>
        </div>
        <CreateSender />
      </div>
      
      <SenderTable />
    </div>
  );
};
