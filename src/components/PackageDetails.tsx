import { Info, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePackage } from '@/contexts/PackageContext';
import type { PackageType } from '@/lib/package-config';

export function PackageDetails() {
    const { currentConfig, updateCurrentConfig, saveAsTemplate } = usePackage();

    if (!currentConfig) return null;

    const handleSaveTemplate = () => {
        saveAsTemplate(currentConfig);
        alert(`"${currentConfig.name}" has been saved as a template.`);
    };

    return (
        <Card className="border-border/40 shadow-sm bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                <div className="flex flex-col space-y-1.5">
                    <CardTitle className="flex items-center gap-2 text-xl font-black">
                        <Info className="h-5 w-5 text-primary" />
                        Application Metadata
                    </CardTitle>
                    <CardDescription className="font-medium">
                        Standard information used by the Intune Company Portal
                    </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleSaveTemplate} className="rounded-xl font-bold border-primary/20 hover:bg-primary/5 text-primary">
                    <FileCode className="h-4 w-4 mr-2" />
                    Save as Template
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                        <Label htmlFor="display-name" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Display Name *</Label>
                        <Input
                            id="display-name"
                            placeholder="e.g. Google Chrome"
                            value={currentConfig.displayName}
                            onChange={(e) => updateCurrentConfig({ displayName: e.target.value })}
                            className="h-12 bg-background/50 border-border/40 rounded-xl focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div className="space-y-2.5">
                        <Label htmlFor="publisher" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Publisher *</Label>
                        <Input
                            id="publisher"
                            placeholder="e.g. Google LLC"
                            value={currentConfig.publisher}
                            onChange={(e) => updateCurrentConfig({ publisher: e.target.value })}
                            className="h-12 bg-background/50 border-border/40 rounded-xl focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                        <Label htmlFor="version" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Version *</Label>
                        <Input
                            id="version"
                            placeholder="e.g. 119.0.6045.160"
                            value={currentConfig.version}
                            onChange={(e) => updateCurrentConfig({ version: e.target.value })}
                            className="h-12 bg-background/50 border-border/40 rounded-xl focus:ring-2 focus:ring-primary/20 font-mono"
                        />
                    </div>

                    <div className="space-y-2.5">
                        <Label htmlFor="package-type" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Package Type</Label>
                        <Select
                            value={currentConfig.packageType}
                            onValueChange={(value: PackageType) => updateCurrentConfig({ packageType: value })}
                        >
                            <SelectTrigger id="package-type" className="h-12 bg-background/50 border-border/40 rounded-xl focus:ring-2 focus:ring-primary/20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border/40 shadow-2xl">
                                <SelectItem value="EXE">EXE Installer</SelectItem>
                                <SelectItem value="MSI">MSI Package</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2.5">
                    <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Description</Label>
                    <Textarea
                        id="description"
                        placeholder="Provide a detailed description for end users in the Company Portal..."
                        value={currentConfig.description}
                        onChange={(e) => updateCurrentConfig({ description: e.target.value })}
                        rows={4}
                        className="bg-background/50 border-border/40 rounded-xl resize-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
                    />
                </div>

                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex gap-4 text-sm shadow-inner">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                        <Info className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-muted-foreground leading-relaxed py-1">
                        <strong className="text-foreground">Pro Tip:</strong> High-quality metadata improves the user experience in the <span className="text-primary font-bold">Microsoft Intune Company Portal</span>. Always include a clear description and accurate versioning.
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
