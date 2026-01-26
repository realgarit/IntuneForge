import { Plus, FolderOpen, Trash2, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePackage } from '@/contexts/PackageContext';
import { exportConfig, importConfig } from '@/lib/package-config';

export function Sidebar() {
    const {
        configs,
        currentConfig,
        setCurrentConfig,
        createNewConfig,
        deleteConfig,
        setSelectedFile
    } = usePackage();

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

    const handleExport = () => {
        if (currentConfig) {
            exportConfig(currentConfig);
        }
    };

    return (
        <aside className="w-full lg:w-80 shrink-0 space-y-4">
            {/* New Package Button */}
            <Button
                onClick={createNewConfig}
                className="w-full gap-2 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
                size="lg"
            >
                <Plus className="h-5 w-5" />
                New Package
            </Button>

            {/* Saved Configurations */}
            <Card className="glass-card border-none">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FolderOpen className="h-5 w-5" />
                        Saved Packages
                    </CardTitle>
                    <CardDescription>
                        {configs.length} package{configs.length !== 1 ? 's' : ''} saved
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {configs.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No saved packages yet.
                            <br />
                            Create a new package to get started.
                        </p>
                    ) : (
                        <div className="space-y-1 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                            {configs.map((config) => (
                                <div
                                    key={config.id}
                                    className={`
                    group flex items-center justify-between p-2 rounded-md cursor-pointer
                    transition-all duration-200
                    ${currentConfig?.id === config.id
                                            ? 'bg-primary/20 border border-primary/30 shadow-[0_0_15px_rgba(124,58,237,0.1)]'
                                            : 'hover:bg-white/5 border border-transparent'
                                        }
                  `}
                                    onClick={() => {
                                        setCurrentConfig(config);
                                        setSelectedFile(null);
                                    }}
                                >
                                    <div className="min-w-0">
                                        <p className="font-medium truncate text-sm">
                                            {config.displayName || config.name || 'Untitled'}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {config.publisher} • v{config.version}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('Delete this package configuration?')) {
                                                deleteConfig(config.id);
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Import/Export */}
            {/* Import/Export */}
            <Card className="glass-card border-none">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Import / Export</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={handleImport}
                    >
                        <Upload className="h-4 w-4" />
                        Import
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={handleExport}
                        disabled={!currentConfig}
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                </CardContent>
            </Card>
        </aside>
    );
}
