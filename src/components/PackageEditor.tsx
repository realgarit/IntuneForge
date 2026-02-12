import { usePackage } from '@/contexts/PackageContext';
import { FileUploader } from '@/components/FileUploader';
import { PackageDetails } from '@/components/PackageDetails';
import { InstallCommands } from '@/components/InstallCommands';
import { DetectionRules } from '@/components/DetectionRules';
import { Assignments } from '@/components/Assignments';
import { BuildSection } from '@/components/BuildSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Users, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PackageEditor() {
    const { currentConfig, createNewConfig } = usePackage();

    if (!currentConfig) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                <div className="h-20 w-20 bg-muted rounded-3xl flex items-center justify-center mb-6">
                    <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No Package Selected</h3>
                <p className="text-muted-foreground max-w-sm mb-8">
                    Select a package from 'My Packages' or create a new one to start editing.
                </p>
                <Button onClick={() => createNewConfig()} className="gap-2 rounded-xl h-12 px-8">
                    <Plus className="h-5 w-5" />
                    Create New Package
                </Button>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-8 overflow-y-auto scrollbar-thin pr-2 animate-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{currentConfig.displayName || currentConfig.name || 'Untitled Package'}</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Editing configuration for {currentConfig.publisher} {currentConfig.version}
                    </p>
                </div>
            </div>

            <Tabs defaultValue="package" className="w-full">
                <TabsList className="w-full justify-start bg-muted/40 p-1 rounded-xl border border-border/40 mb-2">
                    <TabsTrigger value="package" className="gap-2 px-6">
                        <Package className="h-4 w-4" />
                        Package
                    </TabsTrigger>
                    <TabsTrigger value="assignments" className="gap-2 px-6">
                        <Users className="h-4 w-4" />
                        Assignments
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="package" className="mt-6 space-y-6">
                    <FileUploader />
                    <PackageDetails />
                    <InstallCommands />
                    <DetectionRules />
                    <BuildSection />
                </TabsContent>

                <TabsContent value="assignments" className="mt-6 space-y-6">
                    <Assignments />
                    <BuildSection />
                </TabsContent>
            </Tabs>
        </div>
    );
}
