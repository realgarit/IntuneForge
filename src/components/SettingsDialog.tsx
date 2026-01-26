import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { AuthSetup } from '@/components/AuthSetup';
import React from 'react';

interface SettingsDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactElement; // asChild requires a single element
}

export function SettingsDialog({ open, onOpenChange, trigger }: SettingsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                        Configure application settings and authentication.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <AuthSetup />
                </div>
            </DialogContent>
        </Dialog>
    );
}
