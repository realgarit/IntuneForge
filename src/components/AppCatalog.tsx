import { useState } from 'react';
import { Search, Loader2, Download, Filter, Check, Plus, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { APP_CATALOG } from '@/lib/app-catalog';
import type { CatalogApp } from '@/lib/app-catalog';

interface AppCatalogProps {
    onSelect: (app: CatalogApp, file: File) => void;
    onBulkSelect?: (apps: CatalogApp[]) => void;
}

export function AppCatalog({ onSelect, onBulkSelect }: AppCatalogProps) {
    const [search, setSearch] = useState('');
    const [downloading, setDownloading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedApps, setSelectedApps] = useState<string[]>([]);
    const [category, setCategory] = useState<string | null>(null);

    // Customization State (from remote)
    const [view, setView] = useState<'list' | 'customize'>('list');
    const [selectedApp, setSelectedApp] = useState<CatalogApp | null>(null);
    const [activeCustomizations, setActiveCustomizations] = useState<Set<string>>(new Set());

    // Get unique categories
    const categories = Array.from(new Set(APP_CATALOG.map(app => app.category))).sort();

    const filteredApps = APP_CATALOG.filter(app => {
        const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) ||
            app.publisher.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category ? app.category === category : true;
        return matchesSearch && matchesCategory;
    });

    const toggleAppSelection = (appId: string) => {
        setSelectedApps(prev =>
            prev.includes(appId)
                ? prev.filter(id => id !== appId)
                : [...prev, appId]
        );
    };

    const handleAppClick = (app: CatalogApp) => {
        // If customizations exist, go to customize view (single selection flow)
        if (app.customizations && app.customizations.length > 0) {
            setSelectedApp(app);
            setActiveCustomizations(new Set());
            setView('customize');
            setError(null);
        } else {
            // Otherwise, just select/download
            downloadApp(app);
        }
    };

    const toggleCustomization = (id: string) => {
        const newSet = new Set(activeCustomizations);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setActiveCustomizations(newSet);
    };

    const downloadApp = async (app: CatalogApp, customizations: Set<string> = new Set()) => {
        setDownloading(app.id);
        setError(null);
        try {
            // Use the proxy to download the file
            const proxyUrl = `/api/proxy?url=${encodeURIComponent(app.downloadUrl)}`;
            const response = await fetch(proxyUrl);

            if (!response.ok) {
                throw new Error(`Failed to download: ${response.statusText}`);
            }

            const blob = await response.blob();
            const file = new File([blob], app.filename, { type: blob.type });

            // Apply customizations to install command
            let finalInstallCommand = app.installCommand;
            if (app.customizations) {
                app.customizations.forEach(c => {
                    if (customizations.has(c.id)) {
                        finalInstallCommand += ` ${c.arg}`;
                    }
                });
            }

            const appToPackage = {
                ...app,
                installCommand: finalInstallCommand
            };

            onSelect(appToPackage, file);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Download failed');
        } finally {
            setDownloading(null);
        }
    };

    const handleBulkAdd = () => {
        if (onBulkSelect) {
            const apps = APP_CATALOG.filter(app => selectedApps.includes(app.id));
            onBulkSelect(apps);
        }
    };

    if (view === 'customize' && selectedApp) {
        return (
            <div className="flex flex-col h-[70vh] -mx-6 -my-4 p-6 overflow-hidden">
                <DialogHeader className="mb-4">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="-ml-2" onClick={() => setView('list')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <DialogTitle>Customize {selectedApp.name}</DialogTitle>
                            <DialogDescription>
                                Configure installation options before packaging.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-6 p-1">
                    <div className="bg-muted/30 p-4 rounded-lg border">
                        <h4 className="font-medium mb-2">Default Install Command</h4>
                        <code className="text-xs bg-black/80 text-white p-2 rounded block font-mono break-all">
                            {selectedApp.installCommand}
                        </code>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-medium">Available Customizations</h4>
                        {selectedApp.customizations?.map((customization) => (
                            <div key={customization.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="flex items-center h-5">
                                    <input
                                        type="checkbox"
                                        id={customization.id}
                                        checked={activeCustomizations.has(customization.id)}
                                        onChange={() => toggleCustomization(customization.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                                    />
                                </div>
                                <div className="grid gap-1.5 leading-none">
                                    <Label
                                        htmlFor={customization.id}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {customization.label}
                                    </Label>
                                    {customization.description && (
                                        <p className="text-sm text-muted-foreground">
                                            {customization.description}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground font-mono mt-1">
                                        Appends: {customization.arg}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-4 mt-auto border-t flex justify-end gap-2">
                     {error && (
                        <p className="text-sm text-destructive self-center mr-auto">{error}</p>
                    )}
                    <Button variant="outline" onClick={() => setView('list')}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => downloadApp(selectedApp, activeCustomizations)}
                        disabled={!!downloading}
                        className="gap-2"
                    >
                        {downloading === selectedApp.id ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Downloading...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Package with Selection
                            </>
                        )}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[70vh] gap-6">
            {/* Sidebar */}
            <div className="w-48 shrink-0 space-y-4 border-r pr-4">
                <div className="font-semibold mb-2 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Categories
                </div>
                <div className="space-y-1">
                    <Button
                        variant={category === null ? "secondary" : "ghost"}
                        className="w-full justify-start text-sm"
                        onClick={() => setCategory(null)}
                    >
                        All Apps
                    </Button>
                    {categories.map(cat => (
                        <Button
                            key={cat}
                            variant={category === cat ? "secondary" : "ghost"}
                            className="w-full justify-start text-sm"
                            onClick={() => setCategory(cat)}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col space-y-4 min-w-0">
                <DialogHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle>Application Catalog</DialogTitle>
                            <DialogDescription>
                                Select applications to package for Intune.
                            </DialogDescription>
                        </div>
                        {onBulkSelect && selectedApps.length > 0 && (
                            <Button onClick={handleBulkAdd} className="gap-2 animate-in fade-in zoom-in duration-200">
                                <Plus className="h-4 w-4" />
                                Add {selectedApps.length} Selected
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search apps..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto p-1 pr-2 flex-1 custom-scrollbar">
                    {filteredApps.map((app) => {
                        const isSelected = selectedApps.includes(app.id);
                        return (
                            <div
                                key={app.id}
                                className={`
                                    relative flex flex-col p-4 border rounded-lg transition-all duration-200 space-y-3
                                    ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-muted/50'}
                                `}
                            >
                                <div className="flex justify-between items-start gap-3">
                                    {onBulkSelect && (
                                        <div className="pt-1">
                                            <div
                                                className={`
                                                    h-5 w-5 rounded border flex items-center justify-center cursor-pointer transition-colors
                                                    ${isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-input hover:bg-muted'}
                                                `}
                                                onClick={() => toggleAppSelection(app.id)}
                                            >
                                                {isSelected && <Check className="h-3.5 w-3.5" />}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold truncate">{app.name}</h3>
                                            <div className="text-[10px] bg-secondary px-1.5 py-0.5 rounded shrink-0">
                                                {app.version}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs text-muted-foreground">{app.publisher}</p>
                                            {app.customizations && app.customizations.length > 0 && (
                                                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                    <Check className="h-3 w-3" />
                                                    Customizable
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm text-muted-foreground flex-1 line-clamp-2">
                                    {app.description}
                                </p>

                                <div className="flex items-center gap-2 pt-2">
                                    <Button
                                        onClick={() => handleAppClick(app)}
                                        disabled={!!downloading}
                                        className="flex-1 gap-2"
                                        variant="outline"
                                        size="sm"
                                    >
                                        {downloading === app.id ? (
                                            <>
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="h-3 w-3" />
                                                {app.customizations?.length ? 'Customize & Package' : 'Package Now'}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}

                    {filteredApps.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            <p>No applications found matching "{search}"</p>
                            {category && <p className="text-sm mt-1">in category "{category}"</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
