import { useState, useMemo } from 'react';
import { Search, Loader2, Download, CheckSquare, Square, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { APP_CATALOG } from '@/lib/app-catalog';
import type { CatalogApp } from '@/lib/app-catalog';
import { Badge } from '@/components/ui/badge';

interface AppCatalogProps {
    onSelect: (app: CatalogApp, file: File) => void;
    onAdd?: (apps: CatalogApp[]) => void;
}

export function AppCatalog({ onSelect, onAdd }: AppCatalogProps) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<string>('all');
    const [downloading, setDownloading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());

    const categories = useMemo(() => {
        const cats = new Set(APP_CATALOG.map(app => app.category));
        return ['all', ...Array.from(cats).sort()];
    }, []);

    const filteredApps = APP_CATALOG.filter(app => {
        const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) ||
            app.publisher.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === 'all' || app.category === category;
        return matchesSearch && matchesCategory;
    });

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

    const toggleAppSelection = (appId: string) => {
        const newSelected = new Set(selectedApps);
        if (newSelected.has(appId)) {
            newSelected.delete(appId);
        } else {
            newSelected.add(appId);
        }
        setSelectedApps(newSelected);
    };

    const handleBulkAdd = () => {
        if (!onAdd) return;
        const apps = APP_CATALOG.filter(app => selectedApps.has(app.id));
        onAdd(apps);
    };

    return (
        <div className="space-y-4">
            <DialogHeader>
                <DialogTitle>Application Catalog</DialogTitle>
                <DialogDescription>
                    Select applications to add to your library or package immediately.
                </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search apps..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-48">
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.filter(c => c !== 'all').map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
                {filteredApps.map((app) => {
                    const isSelected = selectedApps.has(app.id);
                    return (
                        <div
                            key={app.id}
                            className={`
                                flex flex-col p-4 border rounded-lg transition-all space-y-3 relative
                                ${isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}
                            `}
                        >
                            <div className="absolute top-4 right-4 z-10">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleAppSelection(app.id);
                                    }}
                                    className="text-primary hover:text-primary/80 transition-colors"
                                >
                                    {isSelected ? (
                                        <CheckSquare className="h-5 w-5" />
                                    ) : (
                                        <Square className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </button>
                            </div>

                            <div
                                className="flex justify-between items-start cursor-pointer"
                                onClick={() => toggleAppSelection(app.id)}
                            >
                                <div className="pr-8">
                                    <h3 className="font-semibold">{app.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-sm text-muted-foreground">{app.publisher}</p>
                                        <Badge variant="secondary" className="text-xs">
                                            {app.category}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground flex-1 line-clamp-2">
                                {app.description}
                            </p>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    onClick={() => handleSelect(app)}
                                    disabled={!!downloading || isSelected}
                                    className="flex-1 gap-2"
                                    variant={isSelected ? "secondary" : "outline"}
                                    size="sm"
                                >
                                    {downloading === app.id ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Downloading...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="h-4 w-4" />
                                            Package Now
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    );
                })}

                {filteredApps.length === 0 && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        No applications found matching your criteria
                    </div>
                )}
            </div>

            {selectedApps.size > 0 && onAdd && (
                <DialogFooter className="sm:justify-between items-center border-t pt-4">
                    <div className="text-sm text-muted-foreground">
                        {selectedApps.size} application{selectedApps.size !== 1 ? 's' : ''} selected
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setSelectedApps(new Set())}
                        >
                            Clear Selection
                        </Button>
                        <Button onClick={handleBulkAdd}>
                            Add Selected to Library
                        </Button>
                    </div>
                </DialogFooter>
            )}
        </div>
    );
}
