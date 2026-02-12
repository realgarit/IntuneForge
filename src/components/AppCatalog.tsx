import { useState } from 'react';
import { Search, Loader2, Download, LayoutGrid, ListFilter, ArrowLeft, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import {
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { APP_CATALOG } from '@/lib/app-catalog';
import type { CatalogApp } from '@/lib/app-catalog';
import { cn } from '@/lib/utils';

interface AppCatalogProps {
    onSelect: (app: CatalogApp, file: File) => void;
}

export function AppCatalog({ onSelect }: AppCatalogProps) {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [downloading, setDownloading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Customization State
    const [view, setView] = useState<'list' | 'customize'>('list');
    const [selectedApp, setSelectedApp] = useState<CatalogApp | null>(null);
    const [activeCustomizations, setActiveCustomizations] = useState<Set<string>>(new Set());

    const categories = ['All', ...new Set(APP_CATALOG.map(app => app.category))].sort();

    const filteredApps = APP_CATALOG.filter(app => {
        const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) ||
            app.publisher.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleAppClick = (app: CatalogApp) => {
        if (app.customizations && app.customizations.length > 0) {
            setSelectedApp(app);
            setActiveCustomizations(new Set());
            setView('customize');
            setError(null);
        } else {
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
            // If we were in customize view, stay there to show error
        } finally {
            setDownloading(null);
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
        <div className="flex flex-col h-[70vh] -mx-6 -my-4 p-6 overflow-hidden">
            <DialogHeader className="mb-4">
                <DialogTitle>Application Catalog</DialogTitle>
                <DialogDescription>
                    Select an application to automatically package it for Intune.
                </DialogDescription>
            </DialogHeader>

            <div className="flex gap-4 flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-48 flex-shrink-0 flex flex-col gap-1 border-r pr-4 overflow-y-auto">
                     <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                        <ListFilter className="h-4 w-4" />
                        Categories
                    </h3>
                    {categories.map(category => (
                        <Button
                            key={category}
                            variant={selectedCategory === category ? "secondary" : "ghost"}
                            className={cn(
                                "justify-start text-sm h-9",
                                selectedCategory === category && "bg-secondary font-medium"
                            )}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                            {category !== 'All' && (
                                <span className="ml-auto text-xs text-muted-foreground">
                                    {APP_CATALOG.filter(a => a.category === category).length}
                                </span>
                            )}
                        </Button>
                    ))}
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto p-1 pr-2">
                        {filteredApps.map((app) => (
                            <div
                                key={app.id}
                                className="flex flex-col p-4 border rounded-lg hover:bg-muted/50 transition-colors space-y-3 cursor-pointer group"
                                onClick={() => handleAppClick(app)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold group-hover:text-primary transition-colors">{app.name}</h3>
                                        <p className="text-sm text-muted-foreground">{app.publisher}</p>
                                    </div>
                                    <div className="text-xs bg-secondary px-2 py-1 rounded">
                                        {app.version}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                     <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                        {app.category}
                                    </span>
                                    {app.customizations && app.customizations.length > 0 && (
                                         <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center gap-1">
                                            <Check className="h-3 w-3" />
                                            Customizable
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground flex-1 line-clamp-2">
                                    {app.description}
                                </p>
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAppClick(app);
                                    }}
                                    disabled={!!downloading}
                                    className="w-full gap-2 mt-auto"
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
                                            {app.customizations?.length ? 'Customize & Package' : 'Select & Package'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        ))}

                        {filteredApps.length === 0 && (
                            <div className="col-span-full text-center py-8 text-muted-foreground flex flex-col items-center gap-3">
                                <LayoutGrid className="h-10 w-10 opacity-20" />
                                <p>No applications found matching "{search}"</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
