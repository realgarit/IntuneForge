import { Package, ArrowRight, Settings2, CloudUpload, Library, FileCode, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-border/40 bg-muted/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{configs.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Stored locally in your browser
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-border/40 bg-muted/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Healthy</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Catalog updated 2 hours ago
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-border/40 bg-muted/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Last Deployment</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Never</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            No deployments in this session
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-border/40 bg-muted/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">System Health</CardTitle>
                        <AlertCircle className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">98%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            All services operational
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
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

                {/* Workflow */}
                <Card className="border-border/40 bg-gradient-to-br from-primary/5 to-transparent">
                    <CardHeader>
                        <CardTitle>Packaging Workflow</CardTitle>
                        <CardDescription>How IntuneForge works</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="flex gap-4">
                            <div className="mt-1 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                                <CloudUpload className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">1. Select Application</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Choose from our catalog or upload your own installer file.</p>
                            </div>
                         </div>
                         <div className="flex gap-4">
                            <div className="mt-1 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                                <Settings2 className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">2. Configure Details</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Set install commands, detection rules, and assignments.</p>
                            </div>
                         </div>
                         <div className="flex gap-4">
                            <div className="mt-1 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                                <ArrowRight className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">3. Build & Deploy</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Generate .intunewin package and upload directly to Intune.</p>
                            </div>
                         </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
