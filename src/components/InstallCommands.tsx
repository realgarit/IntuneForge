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
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    Install & Uninstall Commands
                </CardTitle>
                <CardDescription>
                    Define how the application should be installed and removed
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="install-cmd">Install Command *</Label>
                        <button
                            type="button"
                            className="text-xs text-primary hover:underline"
                            onClick={() => updateCurrentConfig({ installCommandLine: generateInstallCommand() })}
                        >
                            Generate Default
                        </button>
                    </div>
                    <Input
                        id="install-cmd"
                        placeholder="setup.exe /S /ALLUSERS"
                        value={currentConfig.installCommandLine}
                        onChange={(e) => updateCurrentConfig({ installCommandLine: e.target.value })}
                        className="font-mono text-sm"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="uninstall-cmd">Uninstall Command *</Label>
                        <button
                            type="button"
                            className="text-xs text-primary hover:underline"
                            onClick={() => updateCurrentConfig({ uninstallCommandLine: generateUninstallCommand() })}
                        >
                            Generate Default
                        </button>
                    </div>
                    <Input
                        id="uninstall-cmd"
                        placeholder="setup.exe /S /uninstall"
                        value={currentConfig.uninstallCommandLine}
                        onChange={(e) => updateCurrentConfig({ uninstallCommandLine: e.target.value })}
                        className="font-mono text-sm"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="install-behavior">Install Behavior</Label>
                        <Select
                            value={currentConfig.installBehavior}
                            onValueChange={(value: 'system' | 'user') => updateCurrentConfig({ installBehavior: value })}
                        >
                            <SelectTrigger id="install-behavior">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="system">System (Recommended)</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="restart-behavior">Restart Behavior</Label>
                        <Select
                            value={currentConfig.restartBehavior}
                            onValueChange={(value: 'suppress' | 'allow' | 'force') => updateCurrentConfig({ restartBehavior: value })}
                        >
                            <SelectTrigger id="restart-behavior">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="suppress">Suppress (No Restart)</SelectItem>
                                <SelectItem value="allow">Allow Restart</SelectItem>
                                <SelectItem value="force">Force Restart</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/50 space-y-2 text-sm">
                    <div className="flex gap-2">
                        <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="text-muted-foreground">
                            <strong>Common silent install switches:</strong>
                        </div>
                    </div>
                    <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground font-mono text-xs">
                        <span>/S, /s, /silent</span>
                        <span>/quiet, /q</span>
                        <span>/VERYSILENT</span>
                        <span>/norestart</span>
                        <span>/ALLUSERS</span>
                        <span>msiexec /qn</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
