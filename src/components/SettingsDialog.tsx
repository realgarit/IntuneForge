import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { AuthSetup } from '@/components/AuthSetup';
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Calendar, Bell, Shield, Cloud, Settings2, Zap } from 'lucide-react';

interface SettingsDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactElement; // asChild requires a single element
}

export function SettingsDialog({ open, onOpenChange, trigger }: SettingsDialogProps) {
    const [defaults, setDefaults] = useState({
        autoKill: true,
        skipRunning: false,
        suppressRestarts: true,
        autoSync: true,
        emailNotifs: false,
        errorAlerts: true,
        telemetry: true
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-[2rem] border-border/40 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black">Settings</DialogTitle>
                    <DialogDescription className="font-medium">
                        Configure application settings and authentication.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 flex-1 min-h-0 flex flex-col">
                    <Tabs defaultValue="auth" className="flex-1 flex flex-col min-h-0">
                        <TabsList className="grid w-full grid-cols-5 bg-muted/50 rounded-2xl mb-6 p-1 h-14">
                            <TabsTrigger value="auth" className="gap-2 text-[10px] font-black uppercase tracking-widest px-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md">
                                <Shield className="h-3.5 w-3.5" />
                                Auth
                            </TabsTrigger>
                            <TabsTrigger value="defaults" className="gap-2 text-[10px] font-black uppercase tracking-widest px-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md">
                                <Zap className="h-3.5 w-3.5" />
                                Defaults
                            </TabsTrigger>
                            <TabsTrigger value="sync" className="gap-2 text-[10px] font-black uppercase tracking-widest px-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md">
                                <Calendar className="h-3.5 w-3.5" />
                                Sync
                            </TabsTrigger>
                            <TabsTrigger value="alerts" className="gap-2 text-[10px] font-black uppercase tracking-widest px-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md">
                                <Bell className="h-3.5 w-3.5" />
                                Alerts
                            </TabsTrigger>
                            <TabsTrigger value="general" className="gap-2 text-[10px] font-black uppercase tracking-widest px-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md">
                                <Cloud className="h-3.5 w-3.5" />
                                General
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
                            <TabsContent value="auth" className="mt-0 space-y-4 focus-visible:outline-none">
                                <AuthSetup />
                            </TabsContent>

                            <TabsContent value="defaults" className="mt-0 space-y-6 focus-visible:outline-none animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Settings2 className="h-4 w-4 text-primary" />
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Global Packaging Defaults</h4>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-muted/20 hover:bg-muted/30 transition-colors">
                                            <div className="space-y-0.5">
                                                <Label className="text-sm font-bold">Auto-Kill Processes</Label>
                                                <p className="text-xs text-muted-foreground">Default for 'Close App Before Install'</p>
                                            </div>
                                            <Switch
                                                checked={defaults.autoKill}
                                                onChange={(e) => setDefaults(prev => ({ ...prev, autoKill: e.target.checked }))}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-muted/20 hover:bg-muted/30 transition-colors">
                                            <div className="space-y-0.5">
                                                <Label className="text-sm font-bold">Skip if Running</Label>
                                                <p className="text-xs text-muted-foreground">Default for 'Skip if Application is Running'</p>
                                            </div>
                                            <Switch
                                                checked={defaults.skipRunning}
                                                onChange={(e) => setDefaults(prev => ({ ...prev, skipRunning: e.target.checked }))}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-muted/20 hover:bg-muted/30 transition-colors">
                                            <div className="space-y-0.5">
                                                <Label className="text-sm font-bold">Suppress Restarts</Label>
                                                <p className="text-xs text-muted-foreground">Default to 'Suppress (No Restart)' for all apps</p>
                                            </div>
                                            <Switch
                                                checked={defaults.suppressRestarts}
                                                onChange={(e) => setDefaults(prev => ({ ...prev, suppressRestarts: e.target.checked }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 shadow-inner">
                                        <p className="text-[10px] text-primary font-black uppercase tracking-[0.15em] leading-relaxed">
                                            Note: These settings will be applied to all new packages created from the catalog or via manual upload. Individual packages can still override these defaults.
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="sync" className="mt-0 space-y-6 focus-visible:outline-none animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-muted/20">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold">Automatic Synchronization</Label>
                                            <p className="text-xs text-muted-foreground">Keep the application catalog updated automatically.</p>
                                        </div>
                                        <Switch
                                            checked={defaults.autoSync}
                                            onChange={(e) => setDefaults(prev => ({ ...prev, autoSync: e.target.checked }))}
                                        />
                                    </div>

                                    <div className="space-y-3 px-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sync Frequency (Hours)</Label>
                                        <Input type="number" defaultValue={24} className="h-12 rounded-xl bg-muted/20 border-border/40 focus:ring-2 focus:ring-primary/20" />
                                    </div>

                                    <div className="p-5 rounded-2xl bg-muted/30 border border-dashed border-border/60">
                                        <p className="text-xs text-muted-foreground text-center font-medium">
                                            Synchronization occurs in the background when the application is active.
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="alerts" className="mt-0 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-muted/20">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold">Email Notifications</Label>
                                            <p className="text-xs text-muted-foreground">Receive alerts for successful deployments.</p>
                                        </div>
                                        <Switch
                                            checked={defaults.emailNotifs}
                                            onChange={(e) => setDefaults(prev => ({ ...prev, emailNotifs: e.target.checked }))}
                                        />
                                    </div>

                                    <div className="space-y-3 px-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recipient Address</Label>
                                        <Input type="email" placeholder="admin@domain.com" className="h-12 rounded-xl bg-muted/20 border-border/40 focus:ring-2 focus:ring-primary/20" />
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-muted/20">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold">Error Alerts</Label>
                                            <p className="text-xs text-muted-foreground">Notify immediately on packaging failures.</p>
                                        </div>
                                        <Switch
                                            checked={defaults.errorAlerts}
                                            onChange={(e) => setDefaults(prev => ({ ...prev, errorAlerts: e.target.checked }))}
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="general" className="mt-0 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-muted/20">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold">Telemetry</Label>
                                            <p className="text-xs text-muted-foreground">Help us improve by sending anonymous usage data.</p>
                                        </div>
                                        <Switch
                                            checked={defaults.telemetry}
                                            onChange={(e) => setDefaults(prev => ({ ...prev, telemetry: e.target.checked }))}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-muted/20 opacity-60">
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
