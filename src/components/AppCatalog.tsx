import { useState, useMemo } from 'react';
import { Search, Loader2, Download, Plus, Check, Filter } from 'lucide-react';
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
    onSelect: (apps: CatalogApp[], immediateDownload: boolean, file?: File) => void;
}

// Simple Badge component since it's missing in ui/
const Badge = ({ children, className = "", variant = "default" }: { children: React.ReactNode, className?: string, variant?: "default" | "outline" | "secondary" }) => {
    const variants = {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "text-foreground border border-input hover:bg-accent hover:text-accent-foreground"
    };
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

export function AppCatalog({ onSelect }: AppCatalogProps) {
    const [search, setSearch] = useState('');
    const [downloading, setDownloading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedApps, setSelectedApps] = useState<string[]>([]);

    // Extract unique categories
    const categories = useMemo(() => {
        const cats = new Set(APP_CATALOG.map(app => app.category));
        return ['All', ...Array.from(cats).sort()];
    }, []);

    // Filter apps based on search and category
    const filteredApps = useMemo(() => {
        return APP_CATALOG.filter(app => {
            const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) ||
                app.publisher.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [search, selectedCategory]);

    const handleSingleSelect = async (app: CatalogApp) => {
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

            onSelect([app], true, file);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Download failed');
        } finally {
            setDownloading(null);
        }
    };

    const toggleAppSelection = (appId: string) => {
        setSelectedApps(prev =>
            prev.includes(appId)
                ? prev.filter(id => id !== appId)
                : [...prev, appId]
        );
    };

    const handleBulkAdd = () => {
        const apps = APP_CATALOG.filter(app => selectedApps.includes(app.id));
        onSelect(apps, false);
    };

    return (
        <div className="flex flex-col h-[70vh] -mx-6 -my-6">
            <div className="p-6 pb-4 border-b">
                <DialogHeader>
                    <DialogTitle>Application Catalog</DialogTitle>
                    <DialogDescription>
                        Select applications to add to your library or package immediately.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-4 mt-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search apps..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-1 min-h-0">
                {/* Sidebar Categories */}
                <div className="w-48 border-r bg-muted/10 p-4 overflow-y-auto">
                    <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Categories
                    </h3>
                    <div className="space-y-1">
                        {categories.map(category => (
                            <Button
                                key={category}
                                variant={selectedCategory === category ? "secondary" : "ghost"}
                                className={`w-full justify-start text-sm h-9 ${selectedCategory === category ? 'bg-secondary font-medium' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                                <span className="ml-auto text-xs opacity-50">
                                    {category === 'All'
                                        ? APP_CATALOG.length
                                        : APP_CATALOG.filter(a => a.category === category).length}
                                </span>
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 bg-background">
                    {error && (
                        <div className="m-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-1 gap-3">
                            {filteredApps.map((app) => {
                                const isSelected = selectedApps.includes(app.id);
                                return (
                                    <div
                                        key={app.id}
                                        className={`
                                            group flex items-start p-3 border rounded-lg transition-all duration-200
                                            ${isSelected ? 'bg-primary/5 border-primary/50 ring-1 ring-primary/20' : 'hover:bg-muted/50'}
                                        `}
                                        onClick={() => toggleAppSelection(app.id)}
                                    >
                                        <div className="mr-3 mt-1">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                                checked={isSelected}
                                                onChange={() => {}} // Handled by parent div click
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-sm">{app.name}</h3>
                                                    <Badge variant="outline" className="text-[10px] px-1.5 h-5">
                                                        {app.version}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {app.publisher}
                                            </p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {app.description}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 text-xs whitespace-nowrap"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSingleSelect(app);
                                                }}
                                                disabled={!!downloading}
                                            >
                                                {downloading === app.id ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Download className="h-3 w-3 mr-1" />
                                                        Package
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredApps.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Filter className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>No applications found matching your criteria.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t bg-muted/5 flex justify-between items-center">
                        <div className="text-sm text-muted-foreground font-medium">
                            {selectedApps.length > 0 ? (
                                <span className="text-primary">{selectedApps.length} applications selected</span>
                            ) : (
                                <span>Select apps to add them to your library</span>
                            )}
                        </div>
                        <Button
                            disabled={selectedApps.length === 0}
                            onClick={handleBulkAdd}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add {selectedApps.length} to Library
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
