import { Zap, FileJson, AlertCircle, Info, Code2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { usePackage } from '@/contexts/PackageContext';

export function PackageOptions() {
    const { currentConfig, updateCurrentConfig } = usePackage();

    if (!currentConfig) return null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-border/40 shadow-sm bg-card/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Zap className="h-5 w-5 text-primary" />
                            Deployment Behavior
                        </CardTitle>
                        <CardDescription>
                            Configure how the installer interacts with the system
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-4 p-3 rounded-xl border border-border/40 bg-muted/30">
                            <div className="space-y-0.5">
                                <Label htmlFor="close-app" className="text-base font-bold">Close App Before Install</Label>
                                <p className="text-xs text-muted-foreground">
                                    Automatically terminate related processes before installation
                                </p>
                            </div>
                            <Switch
                                id="close-app"
                                checked={currentConfig.closeAppBeforeInstall}
                                onChange={(e) => updateCurrentConfig({ closeAppBeforeInstall: e.target.checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-4 p-3 rounded-xl border border-border/40 bg-muted/30">
                            <div className="space-y-0.5">
                                <Label htmlFor="skip-running" className="text-base font-bold">Skip if Running</Label>
                                <p className="text-xs text-muted-foreground">
                                    Do not install if the application is currently in use
                                </p>
                            </div>
                            <Switch
                                id="skip-running"
                                checked={currentConfig.skipIfRunning}
                                onChange={(e) => updateCurrentConfig({ skipIfRunning: e.target.checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-4 p-3 rounded-xl border border-border/40 bg-muted/30">
                            <div className="space-y-0.5">
                                <Label htmlFor="user-notif" className="text-base font-bold">Show User Notifications</Label>
                                <p className="text-xs text-muted-foreground">
                                    Display installation progress to the end user
                                </p>
                            </div>
                            <Switch
                                id="user-notif"
                                checked={true}
                                disabled
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/40 shadow-sm bg-card/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <FileJson className="h-5 w-5 text-primary" />
                            Deployment Notes
                        </CardTitle>
                        <CardDescription>
                            Internal documentation for this package
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="Add internal notes, change logs, or specific instructions for this deployment..."
                            className="min-h-[145px] bg-background/50 border-border/40 rounded-xl resize-none focus:ring-2 focus:ring-primary/20"
                            value={currentConfig.notes || ''}
                            onChange={(e) => updateCurrentConfig({ notes: e.target.value })}
                        />
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border/40 shadow-sm bg-card/50 overflow-hidden">
                <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Code2 className="h-5 w-5 text-primary" />
                                Custom Scripts
                            </CardTitle>
                            <CardDescription>
                                Run PowerShell scripts before or after the installation
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full border border-amber-500/20">
                            <AlertCircle className="h-3 w-3" />
                            <span className="text-[10px] font-black uppercase tracking-wider">Advanced</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/40">
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Pre-Install Script</Label>
                                <Info className="h-4 w-4 text-muted-foreground/40" />
                            </div>
                            <Textarea
                                placeholder="# PowerShell script to run before install..."
                                className="min-h-[200px] font-mono text-xs bg-black/5 border-border/40 rounded-xl focus:ring-2 focus:ring-primary/20"
                                value={currentConfig.preInstallScript || ''}
                                onChange={(e) => updateCurrentConfig({ preInstallScript: e.target.value })}
                            />
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Post-Install Script</Label>
                                <Info className="h-4 w-4 text-muted-foreground/40" />
                            </div>
                            <Textarea
                                placeholder="# PowerShell script to run after install..."
                                className="min-h-[200px] font-mono text-xs bg-black/5 border-border/40 rounded-xl focus:ring-2 focus:ring-primary/20"
                                value={currentConfig.postInstallScript || ''}
                                onChange={(e) => updateCurrentConfig({ postInstallScript: e.target.value })}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
