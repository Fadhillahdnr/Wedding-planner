import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type ReactNode } from 'react';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: ReactNode;
    confirmLabel: string;
    onConfirm: () => void;
    destructive?: boolean;
    busy?: boolean;
    children?: ReactNode;
}

/** Pengganti confirm() bawaan browser: fokus terkunci, Esc menutup, fokus kembali ke pemicu (Radix). */
export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, onConfirm, destructive, busy, children }: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                {children}
                <DialogFooter className="gap-2">
                    <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                        Batal
                    </Button>
                    <Button type="button" variant={destructive ? 'destructive' : 'default'} disabled={busy} onClick={onConfirm}>
                        {busy ? 'Memproses…' : confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
