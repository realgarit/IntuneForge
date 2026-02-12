import { cn } from '@/lib/utils';
import { Package, ArrowRight, Settings2, CloudUpload, Library, FileCode, CheckCircle2, Clock, ShieldCheck, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePackage } from '@/contexts/PackageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { View } from '@/App';

interface DashboardProps {
    onNavigate: (view: View) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
    const { createNewConfig, configs } = usePackage();
    const { isAuthenticated, clientId } = useAuth();

    const lastConfig = [...configs].sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];

    const getTimeAgo = (dateString: string) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffInMs = now.getTime() - past.getTime();
        const diffInMins = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMins / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInDays > 0) return `${diffInDays}d ago`;
        if (diffInHours > 0) return `${diffInHours}h ago`;
        if (diffInMins > 0) return `${diffInMins}m ago`;
        return 'Just now';
    };

    const readinessStats = configs.length > 0 ? {
        complete: configs.filter(c => c.detectionRules.length > 0 && c.assignments.length > 0).length,
        partial: configs.filter(c => (c.detectionRules.length > 0) || (c.assignments.length > 0)).length - configs.filter(c => c.detectionRules.length > 0 && c.assignments.length > 0).length,
        draft: configs.filter(c => c.detectionRules.length === 0 && c.assignments.length === 0).length,
    } : { complete: 0, partial: 0, draft: 0 };

    const totalConfigs = configs.length || 1;
    const completePercent = configs.length > 0 ? Math.round((readinessStats.complete / totalConfigs) * 100) : 0;
    const partialPercent = configs.length > 0 ? Math.round((readinessStats.partial / totalConfigs) * 100) : 0;
    const draftPercent = configs.length > 0 ? Math.max(0, 100 - completePercent - partialPercent) : 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">
                    Environment Overview
                </h2>
                <p className="text-muted-foreground">
                    Manage your Win32 application lifecycle from a single dashboard.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-border/40 bg-muted/20 hover:bg-muted/30 transition-colors cursor-default group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Packages</CardTitle>
                        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                            <Package className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{configs.length}</div>
                        <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter">
                            Active configurations
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/40 bg-muted/20 hover:bg-muted/30 transition-colors cursor-default group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Sync Status</CardTitle>
                        <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 group-hover:bg-green-500/20 transition-colors">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">Stable</div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                Catalog v2.4.1 (Latest)
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/40 bg-muted/20 hover:bg-muted/30 transition-colors cursor-default group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Last Build</CardTitle>
                        <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                            <Clock className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{lastConfig ? getTimeAgo(lastConfig.updatedAt) : 'N/A'}</div>
                        <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter truncate">
                            {lastConfig ? lastConfig.displayName || lastConfig.name : 'No recent builds'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/40 bg-muted/20 hover:bg-muted/30 transition-colors cursor-default group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">API Health</CardTitle>
                        <div className={cn(
                            "p-2 rounded-lg border transition-colors",
                            isAuthenticated
                                ? "bg-green-500/10 border-green-500/20 group-hover:bg-green-500/20"
                                : "bg-amber-500/10 border-amber-500/20 group-hover:bg-amber-500/20"
                        )}>
                            <CloudUpload className={cn(
                                "h-4 w-4",
                                isAuthenticated ? "text-green-500" : "text-amber-500"
                            )} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{isAuthenticated ? '100%' : '0%'}</div>
                        <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter">
                            {isAuthenticated ? 'Graph API connected' : clientId ? 'Awaiting Login' : 'Not Configured'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                {/* Configuration Readiness */}
                <Card className="border-border/40 bg-card/50 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black">Configuration Readiness</CardTitle>
                            <CardDescription className="font-medium">Completion status of your Win32 application packages.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                                {configs.length} Total Apps
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
                            <div className="flex flex-col items-center justify-center p-6 bg-green-500/5 rounded-[2rem] border border-green-500/10">
                                <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4">
                                    <ShieldCheck className="h-6 w-6 text-green-500" />
                                </div>
                                <div className="text-4xl font-black text-green-500">{completePercent}%</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">Ready</div>
                            </div>
                            <div className="flex flex-col items-center justify-center p-6 bg-amber-500/5 rounded-[2rem] border border-amber-500/10">
                                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
                                    <Clock className="h-6 w-6 text-amber-500" />
                                </div>
                                <div className="text-4xl font-black text-amber-500">{partialPercent}%</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">Incomplete</div>
                            </div>
                            <div className="flex flex-col items-center justify-center p-6 bg-blue-500/5 rounded-[2rem] border border-blue-500/10">
                                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
                                    <FileCode className="h-6 w-6 text-blue-500" />
                                </div>
                                <div className="text-4xl font-black text-blue-500">{draftPercent}%</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">Draft</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Start */}
                <Card className="border-border/40">
                    <CardHeader>
                        <CardTitle>Quick Start</CardTitle>
                        <CardDescription>Common tasks to get you started</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            className="w-full justify-start gap-3 h-12 rounded-xl"
                            variant="outline"
                            onClick={() => {
                                createNewConfig();
                                onNavigate('editor');
                            }}
                        >
                            <CloudUpload className="h-5 w-5 text-primary" />
                            <div className="text-left">
                                <p className="font-semibold text-sm">Upload New Installer</p>
                                <p className="text-[10px] text-muted-foreground">Start from a local .exe or .msi</p>
                            </div>
                        </Button>

                        <Button
                            className="w-full justify-start gap-3 h-12 rounded-xl"
                            variant="outline"
                            onClick={() => onNavigate('catalog')}
                        >
                            <Library className="h-5 w-5 text-primary" />
                            <div className="text-left">
                                <p className="font-semibold text-sm">Browse App Catalog</p>
                                <p className="text-[10px] text-muted-foreground">Deploy tested packages instantly</p>
                            </div>
                        </Button>

                        <Button
                            className="w-full justify-start gap-3 h-12 rounded-xl"
                            variant="outline"
                            onClick={() => onNavigate('packages')}
                        >
                            <FileCode className="h-5 w-5 text-primary" />
                            <div className="text-left">
                                <p className="font-semibold text-sm">Use a Template</p>
                                <p className="text-[10px] text-muted-foreground">Speed up manual configuration</p>
                            </div>
                        </Button>
                    </CardContent>
                </Card>
                </div>

                <div className="space-y-8">
                    {/* Activity Feed */}
                    <Card className="border-border/40 bg-card/50 shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/20 border-b border-border/40">
                            <CardTitle className="text-lg font-black flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                Recent Activity
                            </CardTitle>
                            <CardDescription className="font-medium">Live packaging and deployment history</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/40">
                                {configs.slice(0, 3).map((config) => (
                                    <div key={config.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "h-10 w-10 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110",
                                                config.detectionRules.length > 0 && config.assignments.length > 0
                                                    ? "bg-green-500/10 border-green-500/20 text-green-500"
                                                    : config.detectionRules.length > 0 || config.assignments.length > 0
                                                    ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                                    : "bg-blue-500/10 border-blue-500/20 text-blue-500"
                                            )}>
                                                {config.detectionRules.length > 0 && config.assignments.length > 0
                                                    ? <CheckCircle2 className="h-5 w-5" />
                                                    : config.detectionRules.length > 0 || config.assignments.length > 0
                                                    ? <Settings2 className="h-5 w-5" />
                                                    : <FileCode className="h-5 w-5" />
                                                }
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{config.displayName || config.name} {config.version}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                                                    {config.detectionRules.length > 0 && config.assignments.length > 0 ? 'Ready' : 'In Progress'} • {getTimeAgo(config.updatedAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                    </div>
                                ))}
                                {configs.length === 0 && (
                                    <div className="p-8 text-center text-muted-foreground">
                                        <p className="text-sm font-medium italic">No recent activity found. Start by creating a new package!</p>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 bg-muted/10 flex justify-center border-t border-border/40">
                                <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest hover:text-primary" onClick={() => onNavigate('packages')}>
                                    View Full History
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Workflow */}
                    <Card className="border-border/40 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
                        <CardHeader>
                            <CardTitle className="text-lg font-black">Workflow Pipeline</CardTitle>
                            <CardDescription className="font-medium">Lifecycle of a Win32 application</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="flex gap-4 group">
                                <div className="mt-1 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                    <CloudUpload className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">1. Intake</p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">Source from catalog or upload binary files directly.</p>
                                </div>
                             </div>
                             <div className="flex gap-4 group">
                                <div className="mt-1 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                    <Settings2 className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">2. Transform</p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">Apply customization logic and detection rules.</p>
                                </div>
                             </div>
                             <div className="flex gap-4 group">
                                <div className="mt-1 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">3. Distribute</p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">Generate .intunewin and push to Microsoft Intune.</p>
                                </div>
                             </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
