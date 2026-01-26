import { Package, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePackage } from '@/contexts/PackageContext';
import type { PackageType } from '@/lib/package-config';

export function PackageDetails() {
    const { currentConfig, updateCurrentConfig } = usePackage();

    if (!currentConfig) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Package Details
                </CardTitle>
                <CardDescription>
                    Basic information about your application
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="display-name">Display Name *</Label>
                        <Input
                            id="display-name"
                            placeholder="My Application"
                            value={currentConfig.displayName}
                            onChange={(e) => updateCurrentConfig({ displayName: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="publisher">Publisher *</Label>
                        <Input
                            id="publisher"
                            placeholder="Company Name"
                            value={currentConfig.publisher}
                            onChange={(e) => updateCurrentConfig({ publisher: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="version">Version *</Label>
                        <Input
                            id="version"
                            placeholder="1.0.0"
                            value={currentConfig.version}
                            onChange={(e) => updateCurrentConfig({ version: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="package-type">Package Type</Label>
                        <Select
                            value={currentConfig.packageType}
                            onValueChange={(value: PackageType) => updateCurrentConfig({ packageType: value })}
                        >
                            <SelectTrigger id="package-type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="EXE">EXE Installer</SelectItem>
                                <SelectItem value="MSI">MSI Package</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        placeholder="Describe what this application does..."
                        value={currentConfig.description}
                        onChange={(e) => updateCurrentConfig({ description: e.target.value })}
                        rows={3}
                    />
                </div>

                <div className="p-3 rounded-lg bg-muted/50 flex gap-2 text-sm">
                    <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="text-muted-foreground">
                        <strong>Tip:</strong> The display name will appear in the Intune portal and on end-user devices.
                        Use a clear, recognizable name.
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
