import { usePackage } from '@/contexts/PackageContext';
import { FileUploader } from '@/components/FileUploader';
import { PackageDetails } from '@/components/PackageDetails';
import { InstallCommands } from '@/components/InstallCommands';
import { DetectionRules } from '@/components/DetectionRules';
import { Assignments } from '@/components/Assignments';
import { PackageOptions } from '@/components/PackageOptions';
import { Requirements } from '@/components/Requirements';
import { BuildSection } from '@/components/BuildSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Users, AlertCircle, Plus, Terminal, Search, Settings2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PackageEditor() {
    const { currentConfig, createNewConfig } = usePackage();

    if (!currentConfig) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                <div className="h-24 w-24 bg-muted/50 rounded-[2.5rem] flex items-center justify-center mb-8 border-2 border-dashed border-border shadow-inner">
                    <AlertCircle className="h-10 w-10 text-muted-foreground/20" />
                </div>
                <h3 className="text-2xl font-black mb-2">No Package Selected</h3>
                <p className="text-muted-foreground max-w-sm mb-8 font-medium">
                    Select a package from 'My Packages' or create a new one to start editing.
                </p>
                <Button onClick={() => createNewConfig()} className="gap-3 rounded-2xl h-14 px-10 font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    <Plus className="h-6 w-6" />
                    Create New Package
                </Button>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-8 overflow-y-auto scrollbar-thin pr-4 animate-in slide-in-from-right-4 duration-500 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
                        <Package className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black tracking-tight leading-none">{currentConfig.displayName || currentConfig.name || 'Untitled Package'}</h2>
                        <div className="flex items-center gap-3 mt-2">
                             <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{currentConfig.publisher || 'Unknown Publisher'}</span>
                             <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                             <span className="text-xs font-black px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground uppercase tracking-widest">v{currentConfig.version}</span>
                        </div>
                    </div>
                </div>
                <BuildSection />
            </div>

            <Tabs defaultValue="info" className="w-full">
                <div className="bg-muted/30 p-1.5 rounded-2xl border border-border/40 shadow-inner inline-flex w-full overflow-x-auto scrollbar-none">
                    <TabsList className="bg-transparent h-12 w-full justify-start gap-1">
                        <TabsTrigger value="info" className="gap-2.5 px-6 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary transition-all font-bold">
                            <Package className="h-4 w-4" />
                            General Info
                        </TabsTrigger>
                        <TabsTrigger value="requirements" className="gap-2.5 px-6 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary transition-all font-bold">
                            <ShieldCheck className="h-4 w-4" />
                            Requirements
                        </TabsTrigger>
                        <TabsTrigger value="install" className="gap-2.5 px-6 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary transition-all font-bold">
                            <Terminal className="h-4 w-4" />
                            Install Logic
                        </TabsTrigger>
                        <TabsTrigger value="detection" className="gap-2.5 px-6 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary transition-all font-bold">
                            <Search className="h-4 w-4" />
                            Detection
                        </TabsTrigger>
                        <TabsTrigger value="options" className="gap-2.5 px-6 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary transition-all font-bold">
                            <Settings2 className="h-4 w-4" />
                            Deployment Options
                        </TabsTrigger>
                        <TabsTrigger value="assignments" className="gap-2.5 px-6 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary transition-all font-bold">
                            <Users className="h-4 w-4" />
                            Assignments
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="mt-8">
                    <TabsContent value="info" className="space-y-6 focus-visible:outline-none">
                        <PackageDetails />
                    </TabsContent>

                    <TabsContent value="requirements" className="space-y-6 focus-visible:outline-none">
                        <Requirements />
                    </TabsContent>

                    <TabsContent value="install" className="space-y-6 focus-visible:outline-none">
                        <FileUploader />
                        <InstallCommands />
                    </TabsContent>

                    <TabsContent value="detection" className="space-y-6 focus-visible:outline-none">
                        <DetectionRules />
                    </TabsContent>

                    <TabsContent value="options" className="space-y-6 focus-visible:outline-none">
                        <PackageOptions />
                    </TabsContent>

                    <TabsContent value="assignments" className="space-y-6 focus-visible:outline-none">
                        <Assignments />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
