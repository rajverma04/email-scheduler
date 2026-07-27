import { useSenders, useDeleteSender } from '@/hooks/useSenders';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export const SenderTable = () => {
  const { data: senders, isLoading } = useSenders();
  const { mutate: deleteSender } = useDeleteSender();

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sender Name</TableHead>
            <TableHead>Sender Email</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 inline-block" /></TableCell>
              </TableRow>
            ))
          ) : senders?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                No senders configured. Add one to start sending emails.
              </TableCell>
            </TableRow>
          ) : (
            senders?.map((sender) => (
              <TableRow key={sender.id}>
                <TableCell className="font-medium">{sender.senderName}</TableCell>
                <TableCell>{sender.senderEmail}</TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger render={
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    } />
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Sender</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {sender.senderName} ({sender.senderEmail})? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteSender(sender.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
