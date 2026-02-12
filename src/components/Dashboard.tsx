import { Package, ArrowRight, Settings2, CloudUpload, Library, FileCode, CheckCircle2, Clock, ShieldCheck, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePackage } from '@/contexts/PackageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { View } from '@/App';

interface DashboardProps {
    onNavigate: (view: View) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
    const { createNewConfig, configs } = usePackage();

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
                        <div className="text-3xl font-black">2h ago</div>
                        <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter">
                            PowerToys_v0.75.1.intunewin
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/40 bg-muted/20 hover:bg-muted/30 transition-colors cursor-default group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">API Health</CardTitle>
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
                            <CloudUpload className="h-4 w-4 text-amber-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">99.9%</div>
                        <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter">
                            Graph API connected
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                {/* Patching Health */}
                <Card className="border-border/40 bg-card/50 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black">Patching Health</CardTitle>
                            <CardDescription className="font-medium">Current status of managed applications across the environment.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">+12% this month</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
                            <div className="flex flex-col items-center justify-center p-6 bg-green-500/5 rounded-[2rem] border border-green-500/10">
                                <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4">
                                    <ShieldCheck className="h-6 w-6 text-green-500" />
                                </div>
                                <div className="text-4xl font-black text-green-500">84%</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">Compliant</div>
                            </div>
                            <div className="flex flex-col items-center justify-center p-6 bg-amber-500/5 rounded-[2rem] border border-amber-500/10">
                                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
                                    <Clock className="h-6 w-6 text-amber-500" />
                                </div>
                                <div className="text-4xl font-black text-amber-500">12%</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">Pending</div>
                            </div>
                            <div className="flex flex-col items-center justify-center p-6 bg-destructive/5 rounded-[2rem] border border-destructive/10">
                                <div className="h-12 w-12 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
                                    <AlertTriangle className="h-6 w-6 text-destructive" />
                                </div>
                                <div className="text-4xl font-black text-destructive">4%</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">Failed</div>
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
                                <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20 group-hover:scale-110 transition-transform">
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">VS Code v1.84.2 Deployed</p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Success • 12m ago</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                </div>

                                <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                                            <Package className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">Google Chrome v119.0 Built</p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Packaged • 45m ago</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                </div>

                                <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                                            <Settings2 className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">Firefox v119.0 Configured</p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Drafted • 2h ago</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                </div>
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
