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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Calendar, Bell, Shield, Cloud } from 'lucide-react';

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
                <div className="py-4 h-[60vh] overflow-hidden flex flex-col">
                    <Tabs defaultValue="auth" className="flex-1 flex flex-col">
                        <TabsList className="grid w-full grid-cols-4 bg-muted/50 rounded-xl mb-6">
                            <TabsTrigger value="auth" className="gap-2 text-xs">
                                <Shield className="h-3.5 w-3.5" />
                                Auth
                            </TabsTrigger>
                            <TabsTrigger value="sync" className="gap-2 text-xs">
                                <Calendar className="h-3.5 w-3.5" />
                                Sync
                            </TabsTrigger>
                            <TabsTrigger value="alerts" className="gap-2 text-xs">
                                <Bell className="h-3.5 w-3.5" />
                                Alerts
                            </TabsTrigger>
                            <TabsTrigger value="general" className="gap-2 text-xs">
                                <Cloud className="h-3.5 w-3.5" />
                                General
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
                            <TabsContent value="auth" className="mt-0 space-y-4">
                                <AuthSetup />
                            </TabsContent>

                            <TabsContent value="sync" className="mt-0 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold">Automatic Synchronization</Label>
                                            <p className="text-xs text-muted-foreground">Keep the application catalog updated automatically.</p>
                                        </div>
                                        <Switch checked={true} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Sync Frequency (Hours)</Label>
                                        <Input type="number" defaultValue={24} className="h-10 rounded-xl" />
                                    </div>

                                    <div className="p-4 rounded-xl bg-muted/30 border border-dashed">
                                        <p className="text-xs text-muted-foreground text-center">
                                            Synchronization occurs in the background when the app is open.
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="alerts" className="mt-0 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold">Email Notifications</Label>
                                            <p className="text-xs text-muted-foreground">Receive alerts for successful deployments.</p>
                                        </div>
                                        <Switch checked={false} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Recipient Address</Label>
                                        <Input type="email" placeholder="admin@domain.com" className="h-10 rounded-xl" />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold">Error Alerts</Label>
                                            <p className="text-xs text-muted-foreground">Notify immediately on packaging failures.</p>
                                        </div>
                                        <Switch checked={true} />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="general" className="mt-0 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold">Telemetry</Label>
                                            <p className="text-xs text-muted-foreground">Help us improve by sending anonymous usage data.</p>
                                        </div>
                                        <Switch checked={true} />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold">Dark Mode</Label>
                                            <p className="text-xs text-muted-foreground">Use the dark theme for the interface.</p>
                                        </div>
                                        <Switch checked={true} disabled />
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
