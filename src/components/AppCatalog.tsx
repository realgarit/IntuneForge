import { useState } from 'react';
import { Search, Loader2, Download } from 'lucide-react';
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
}

export function AppCatalog({ onSelect }: AppCatalogProps) {
    const [search, setSearch] = useState('');
    const [downloading, setDownloading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const filteredApps = APP_CATALOG.filter(app =>
        app.name.toLowerCase().includes(search.toLowerCase()) ||
        app.publisher.toLowerCase().includes(search.toLowerCase())
    );

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

    return (
        <div className="space-y-4">
            <DialogHeader>
                <DialogTitle>Application Catalog</DialogTitle>
                <DialogDescription>
                    Select an application to automatically package it for Intune.
                </DialogDescription>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
                {filteredApps.map((app) => (
                    <div
                        key={app.id}
                        className="flex flex-col p-4 border rounded-lg hover:bg-muted/50 transition-colors space-y-3"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold">{app.name}</h3>
                                <p className="text-sm text-muted-foreground">{app.publisher}</p>
                            </div>
                            <div className="text-xs bg-secondary px-2 py-1 rounded">
                                {app.version}
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground flex-1 line-clamp-2">
                            {app.description}
                        </p>
                        <Button
                            onClick={() => handleSelect(app)}
                            disabled={!!downloading}
                            className="w-full gap-2"
                            variant="outline"
                        >
                            {downloading === app.id ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Downloading...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4" />
                                    Select & Package
                                </>
                            )}
                        </Button>
                    </div>
                ))}

                {filteredApps.length === 0 && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        No applications found matching "{search}"
                    </div>
                )}
            </div>
        </div>
    );
}
