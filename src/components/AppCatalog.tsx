import { useState } from 'react';
import { Search, Loader2, Download, Filter, Check, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

    const handleSelect = async (app: CatalogApp) => {
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

            onSelect(app, file);
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
                                        <p className="text-xs text-muted-foreground">{app.publisher}</p>
                                    </div>
                                </div>

                                <p className="text-sm text-muted-foreground flex-1 line-clamp-2">
                                    {app.description}
                                </p>

                                <div className="flex items-center gap-2 pt-2">
                                    <Button
                                        onClick={() => handleSelect(app)}
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
                                                Package Now
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
