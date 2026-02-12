import { usePackage } from '@/contexts/PackageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Monitor, Cpu, HardDrive, Layout } from 'lucide-react';

export function Requirements() {
    const { currentConfig, updateCurrentConfig } = usePackage();

    if (!currentConfig) return null;

    const reqs = currentConfig.requirements || {
        architecture: 'both',
        minimumOs: 'Windows 10 1607',
        diskSpaceMB: 0,
        memoryMB: 0
    };

    const updateReqs = (updates: Partial<typeof reqs>) => {
        updateCurrentConfig({
            requirements: { ...reqs, ...updates }
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-border/40 bg-muted/20">
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                                <Cpu className="h-4 w-4 text-primary" />
                            </div>
                            <CardTitle className="text-lg font-black">Architecture</CardTitle>
                        </div>
                        <CardDescription className="font-medium">Specify the CPU architecture required for this package.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            {(['x86', 'x64', 'both'] as const).map((arch) => (
                                <button
                                    key={arch}
                                    onClick={() => updateReqs({ architecture: arch })}
                                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                                        reqs.architecture === arch
                                            ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10'
                                            : 'bg-background border-border/40 hover:border-primary/50 text-muted-foreground'
                                    }`}
                                >
                                    <span className="text-sm font-black uppercase tracking-widest">{arch}</span>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/40 bg-muted/20">
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                                <Monitor className="h-4 w-4 text-primary" />
                            </div>
                            <CardTitle className="text-lg font-black">Operating System</CardTitle>
                        </div>
                        <CardDescription className="font-medium">Minimum Windows version required.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Minimum OS Version</Label>
                            <select
                                value={reqs.minimumOs}
                                onChange={(e) => updateReqs({ minimumOs: e.target.value })}
                                className="w-full h-12 bg-background border-2 border-border/40 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            >
                                <option value="Windows 10 1607">Windows 10 1607</option>
                                <option value="Windows 10 1703">Windows 10 1703</option>
                                <option value="Windows 10 1709">Windows 10 1709</option>
                                <option value="Windows 10 1803">Windows 10 1803</option>
                                <option value="Windows 10 1809">Windows 10 1809</option>
                                <option value="Windows 10 1903">Windows 10 1903</option>
                                <option value="Windows 10 1909">Windows 10 1909</option>
                                <option value="Windows 10 2004">Windows 10 2004</option>
                                <option value="Windows 10 20H2">Windows 10 20H2</option>
                                <option value="Windows 10 21H1">Windows 10 21H1</option>
                                <option value="Windows 11 21H2">Windows 11 21H2</option>
                                <option value="Windows 11 22H2">Windows 11 22H2</option>
                                <option value="Windows 11 23H2">Windows 11 23H2</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/40 bg-muted/20">
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                                <HardDrive className="h-4 w-4 text-primary" />
                            </div>
                            <CardTitle className="text-lg font-black">Disk Space</CardTitle>
                        </div>
                        <CardDescription className="font-medium">Minimum free disk space required.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Free Disk Space (MB)</Label>
                            <Input
                                type="number"
                                value={reqs.diskSpaceMB}
                                onChange={(e) => updateReqs({ diskSpaceMB: parseInt(e.target.value) || 0 })}
                                className="h-12 border-2 border-border/40 rounded-xl font-bold"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/40 bg-muted/20">
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                                <Layout className="h-4 w-4 text-primary" />
                            </div>
                            <CardTitle className="text-lg font-black">Memory</CardTitle>
                        </div>
                        <CardDescription className="font-medium">Minimum physical memory required.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Physical Memory (MB)</Label>
                            <Input
                                type="number"
                                value={reqs.memoryMB}
                                onChange={(e) => updateReqs({ memoryMB: parseInt(e.target.value) || 0 })}
                                className="h-12 border-2 border-border/40 rounded-xl font-bold"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
