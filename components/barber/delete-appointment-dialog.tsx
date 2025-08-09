import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteAppointmentDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: DeleteAppointmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Randevuyu Sil</DialogTitle>
          <DialogDescription>
            Bu randevuyu silmek istediğinizden emin misiniz? Bu işlem geri
            alınamaz.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            İptal
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Siliniyor..." : "Sil"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}