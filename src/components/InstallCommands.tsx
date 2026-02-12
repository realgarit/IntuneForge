import { Terminal, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePackage } from '@/contexts/PackageContext';

export function InstallCommands() {
    const { currentConfig, updateCurrentConfig } = usePackage();

    if (!currentConfig) return null;

    // Generate smart defaults based on package type
    const generateInstallCommand = () => {
        const fileName = currentConfig.setupFileName || 'installer.exe';

        if (currentConfig.packageType === 'MSI') {
            return `msiexec /i "${fileName}" /qn /norestart`;
        }

        // Common EXE installer arguments
        return `"${fileName}" /S /ALLUSERS`;
    };

    const generateUninstallCommand = () => {
        const fileName = currentConfig.setupFileName || 'installer.exe';

        if (currentConfig.packageType === 'MSI') {
            return `msiexec /x "{ProductCode}" /qn /norestart`;
        }

        return `"${fileName}" /S /uninstall`;
    };

    return (
        <Card className="border-border/40 shadow-sm bg-card/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-black">
                    <Terminal className="h-5 w-5 text-primary" />
                    Install Logic
                </CardTitle>
                <CardDescription className="font-medium">
                    Define how the application should be installed and removed
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="install-cmd" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Install Command *</Label>
                                <button
                                    type="button"
                                    className="text-[10px] font-black uppercase tracking-wider text-primary hover:text-primary/80 transition-colors bg-primary/10 px-2 py-1 rounded"
                                    onClick={() => updateCurrentConfig({ installCommandLine: generateInstallCommand() })}
                                >
                                    Auto-Generate
                                </button>
                            </div>
                            <div className="relative group">
                                <Input
                                    id="install-cmd"
                                    placeholder="setup.exe /S /ALLUSERS"
                                    value={currentConfig.installCommandLine}
                                    onChange={(e) => updateCurrentConfig({ installCommandLine: e.target.value })}
                                    className="h-12 bg-black/5 border-border/40 rounded-xl focus:ring-2 focus:ring-primary/20 font-mono text-sm pr-10"
                                />
                                <Terminal className="absolute right-3 top-3.5 h-5 w-5 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="uninstall-cmd" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Uninstall Command *</Label>
                                <button
                                    type="button"
                                    className="text-[10px] font-black uppercase tracking-wider text-primary hover:text-primary/80 transition-colors bg-primary/10 px-2 py-1 rounded"
                                    onClick={() => updateCurrentConfig({ uninstallCommandLine: generateUninstallCommand() })}
                                >
                                    Auto-Generate
                                </button>
                            </div>
                            <div className="relative group">
                                <Input
                                    id="uninstall-cmd"
                                    placeholder="setup.exe /S /uninstall"
                                    value={currentConfig.uninstallCommandLine}
                                    onChange={(e) => updateCurrentConfig({ uninstallCommandLine: e.target.value })}
                                    className="h-12 bg-black/5 border-border/40 rounded-xl focus:ring-2 focus:ring-primary/20 font-mono text-sm pr-10"
                                />
                                <Terminal className="absolute right-3 top-3.5 h-5 w-5 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2.5">
                                <Label htmlFor="install-behavior" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Install Behavior</Label>
                                <Select
                                    value={currentConfig.installBehavior}
                                    onValueChange={(value: 'system' | 'user') => updateCurrentConfig({ installBehavior: value })}
                                >
                                    <SelectTrigger id="install-behavior" className="h-12 bg-background/50 border-border/40 rounded-xl focus:ring-2 focus:ring-primary/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="system">System (Standard)</SelectItem>
                                        <SelectItem value="user">User Context</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2.5">
                                <Label htmlFor="restart-behavior" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Restart Behavior</Label>
                                <Select
                                    value={currentConfig.restartBehavior}
                                    onValueChange={(value: 'suppress' | 'allow' | 'force') => updateCurrentConfig({ restartBehavior: value })}
                                >
                                    <SelectTrigger id="restart-behavior" className="h-12 bg-background/50 border-border/40 rounded-xl focus:ring-2 focus:ring-primary/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="suppress">No Restart</SelectItem>
                                        <SelectItem value="allow">Allow App Restart</SelectItem>
                                        <SelectItem value="force">Force Reboot</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-muted/40 border border-border/40 space-y-3">
                            <div className="flex items-center gap-2">
                                <Info className="h-4 w-4 text-primary" />
                                <span className="text-xs font-black uppercase tracking-widest">Common Switches</span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] font-mono text-muted-foreground">
                                <code className="bg-background/50 p-1.5 rounded border border-border/20">/S /silent</code>
                                <code className="bg-background/50 p-1.5 rounded border border-border/20">/quiet /q</code>
                                <code className="bg-background/50 p-1.5 rounded border border-border/20">/VERYSILENT</code>
                                <code className="bg-background/50 p-1.5 rounded border border-border/20">msiexec /qn</code>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
