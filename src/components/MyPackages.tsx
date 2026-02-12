import { FolderOpen, Trash2, Download, Upload, Search, Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePackage } from '@/contexts/PackageContext';
import { exportConfig, importConfig } from '@/lib/package-config';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface MyPackagesProps {
    onEdit: () => void;
}

export function MyPackages({ onEdit }: MyPackagesProps) {
    const {
        configs,
        currentConfig,
        setCurrentConfig,
        deleteConfig,
        setSelectedFile,
        createNewConfig
    } = usePackage();

    const [search, setSearch] = useState('');

    const filteredConfigs = configs.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.displayName.toLowerCase().includes(search.toLowerCase()) ||
        c.publisher.toLowerCase().includes(search.toLowerCase())
    );

    const handleImport = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                try {
                    const config = await importConfig(file);
                    setCurrentConfig(config);
                    setSelectedFile(null);
                } catch {
                    alert('Failed to import configuration. Please check the file format.');
                }
            }
        };
        input.click();
    };

    const handleExport = (config: any) => {
        exportConfig(config);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Package className="h-8 w-8 text-primary" />
                        My Packages
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Manage your locally saved application configurations.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleImport} className="gap-2 rounded-xl">
                        <Upload className="h-4 w-4" />
                        Import
                    </Button>
                    <Button onClick={() => { createNewConfig(); onEdit(); }} className="gap-2 rounded-xl">
                        <Plus className="h-4 w-4" />
                        New Package
                    </Button>
                </div>
            </div>

            <div className="relative group max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Search your packages..."
                    className="pl-10 h-11 bg-muted/40 border-border/40 focus:bg-background transition-all rounded-xl"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {filteredConfigs.length === 0 ? (
                <Card className="border-dashed border-2 bg-transparent">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="h-16 w-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
                            <FolderOpen className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                        <h3 className="text-xl font-bold mb-1">No packages found</h3>
                        <p className="text-muted-foreground max-w-xs">
                            {search ? "No packages match your search criteria." : "You haven't saved any packages yet."}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredConfigs.map((config) => (
                        <Card
                            key={config.id}
                            className={`
                                group relative border-border/40 hover:border-primary/50 transition-all cursor-pointer overflow-hidden
                                ${currentConfig?.id === config.id ? 'ring-2 ring-primary bg-primary/5' : ''}
                            `}
                            onClick={() => {
                                setCurrentConfig(config);
                                setSelectedFile(null);
                                onEdit();
                            }}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                                        <Package className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    onClick={() => handleExport(config)}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Export JSON</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => {
                                                        if (confirm('Delete this package configuration?')) {
                                                            deleteConfig(config.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Delete Package</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                                <CardTitle className="text-lg mt-4 truncate">{config.displayName || config.name || 'Untitled'}</CardTitle>
                                <CardDescription className="truncate">{config.publisher} • v{config.version}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-2">
                                    <span>{config.packageType}</span>
                                    <span>Updated {new Date(config.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
