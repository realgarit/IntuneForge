import { useState } from 'react';
import {
    Search,
    Loader2,
    Download,
    LayoutGrid,
    ListFilter,
    ArrowLeft,
    Check,
    Hammer,
    Monitor,
    Globe,
    Code,
    MessageSquare,
    Play,
    Wrench,
    Briefcase,
    Package,
    PlusCircle,
    Info
} from 'lucide-react';
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

import { usePackage } from '@/contexts/PackageContext';
import type { PackageAssignment } from '@/lib/package-config';

interface AppCatalogProps {
    onSelect: (app: CatalogApp, file: File) => void;
    onBulkSelect?: (apps: { app: CatalogApp, file: File }[]) => void;
}

const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
        case 'all': return <LayoutGrid className="h-4 w-4" />;
        case 'browsers': return <Globe className="h-4 w-4" />;
        case 'communication': return <MessageSquare className="h-4 w-4" />;
        case 'development': return <Code className="h-4 w-4" />;
        case 'media': return <Play className="h-4 w-4" />;
        case 'productivity': return <Briefcase className="h-4 w-4" />;
        case 'utilities': return <Wrench className="h-4 w-4" />;
        default: return <Package className="h-4 w-4" />;
    }
};

export function AppCatalog({ onSelect, onBulkSelect }: AppCatalogProps) {
    const { addConfigs } = usePackage();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [downloading, setDownloading] = useState<string | null>(null);
    const [bulkDownloading, setBulkDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [iconErrors, setIconErrors] = useState<Set<string>>(new Set());

    // Multi-select state
    const [selectedAppIds, setSelectedAppIds] = useState<Set<string>>(new Set());

    // Auto-assignment state
    const [autoAssign, setAutoAssign] = useState<boolean>(false);
    const [assignmentTarget, setAssignmentTarget] = useState<'all-users' | 'all-devices'>('all-devices');

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

    const handleIconError = (appId: string) => {
        setIconErrors(prev => {
            const next = new Set(prev);
            next.add(appId);
            return next;
        });
    };

    const handleAppClick = (app: CatalogApp) => {
        if (app.customizations && app.customizations.length > 0) {
            setSelectedApp(app);
            setActiveCustomizations(new Set());
            setView('customize');
            setError(null);
        } else {
            downloadApp(app).catch(() => { /* error handled in downloadApp */ });
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

    const downloadApp = async (app: CatalogApp, customizations: Set<string> = new Set(), silent = false) => {
        if (!silent) setDownloading(app.id);
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

            if (!silent) {
                onSelect(appToPackage, file);
            }
            return { app: appToPackage, file };
        } catch (err) {
            console.error(err);
            if (!silent) setError(err instanceof Error ? err.message : 'Download failed');
            throw err;
        } finally {
            if (!silent) setDownloading(null);
        }
    };

    const handleBulkDownload = async () => {
        setBulkDownloading(true);
        setError(null);
        const appsToDownload = APP_CATALOG.filter(a => selectedAppIds.has(a.id));
        const results: { app: CatalogApp, file: File }[] = [];

        try {
            for (const app of appsToDownload) {
                const result = await downloadApp(app, new Set(), true);
                results.push(result);
            }

            // Create configurations
            const newConfigs = results.map(({ app }) => {
                const assignments: PackageAssignment[] = autoAssign ? [
                    {
                        target: assignmentTarget,
                        intent: 'required',
                        notifications: 'showAll'
                    }
                ] : [];

                return {
                    id: crypto.randomUUID(),
                    name: app.name,
                    displayName: app.name,
                    publisher: app.publisher,
                    description: app.description,
                    version: app.version,
                    setupFileName: app.filename,
                    installCommandLine: app.installCommand,
                    uninstallCommandLine: app.uninstallCommand,
                    detectionRules: app.detectionRules,
                    packageType: (app.filename.toLowerCase().endsWith('.msi') ? 'MSI' : 'EXE') as 'MSI' | 'EXE',
                    sourceType: 'url' as const,
                    sourceUrl: app.downloadUrl,
                    installBehavior: 'system' as const,
                    restartBehavior: 'suppress' as const,
                    assignments,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
            });

            addConfigs(newConfigs);
            setSelectedAppIds(new Set());
            if (onBulkSelect) {
                onBulkSelect(results);
            }
        } catch (err) {
            setError('Bulk download failed. Some apps might have failed to download.');
        } finally {
            setBulkDownloading(false);
        }
    };

    if (view === 'customize' && selectedApp) {
        return (
            <div className="flex flex-col h-[75vh] p-8 overflow-hidden">
                <DialogHeader className="mb-8">
                    <div className="flex items-center gap-6">
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl shadow-sm" onClick={() => setView('list')}>
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                        <div className="flex items-center gap-5">
                            {selectedApp.iconUrl && !iconErrors.has(selectedApp.id) ? (
                                <div className="h-16 w-16 bg-white rounded-2xl shadow-md border p-3 flex items-center justify-center">
                                    <img
                                        src={selectedApp.iconUrl}
                                        alt=""
                                        className="h-full w-full object-contain"
                                        onError={() => handleIconError(selectedApp.id)}
                                    />
                                </div>
                            ) : (
                                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
                                    <Hammer className="h-8 w-8 text-primary" />
                                </div>
                            )}
                            <div>
                                <DialogTitle className="text-3xl font-bold tracking-tight">{selectedApp.name}</DialogTitle>
                                <DialogDescription className="text-lg mt-1 flex items-center gap-2">
                                    <Wrench className="h-4 w-4 text-primary" />
                                    Configure installation options
                                </DialogDescription>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-8 pr-2 scrollbar-thin">
                    <div className="bg-muted/30 p-6 rounded-2xl border border-border/60 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                             <div className="p-1.5 bg-black/10 rounded-lg">
                                <Code className="h-4 w-4 text-muted-foreground" />
                             </div>
                             <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Default Install Command</h4>
                        </div>
                        <code className="text-sm bg-black/90 text-blue-400 p-4 rounded-xl block font-mono break-all leading-relaxed shadow-xl border border-white/5">
                            {selectedApp.installCommand}
                        </code>
                    </div>

                    <div className="space-y-5">
                        <div className="flex items-center gap-2">
                             <div className="p-1.5 bg-primary/10 rounded-lg">
                                <ListFilter className="h-4 w-4 text-primary" />
                             </div>
                             <h4 className="text-xl font-bold tracking-tight">Installation Tweaks</h4>
                        </div>
                        <div className="grid gap-4">
                            {selectedApp.customizations?.map((customization) => (
                                <div
                                    key={customization.id}
                                    className={cn(
                                        "flex items-start space-x-5 p-5 border-2 rounded-2xl transition-all duration-300 cursor-pointer group",
                                        activeCustomizations.has(customization.id)
                                            ? "bg-primary/[0.03] border-primary shadow-md translate-x-1"
                                            : "hover:bg-muted/50 border-border/60 hover:border-primary/30"
                                    )}
                                    onClick={() => toggleCustomization(customization.id)}
                                >
                                    <div className="flex items-center h-7">
                                        <div className={cn(
                                            "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
                                            activeCustomizations.has(customization.id)
                                                ? "bg-primary border-primary scale-110 shadow-lg shadow-primary/20"
                                                : "border-muted-foreground/30 group-hover:border-primary/50"
                                        )}>
                                            {activeCustomizations.has(customization.id) && <Check className="h-4 w-4 text-primary-foreground stroke-[4]" />}
                                        </div>
                                    </div>
                                    <div className="grid gap-2 leading-none flex-1">
                                        <Label
                                            className="text-lg font-bold cursor-pointer transition-colors group-hover:text-primary"
                                        >
                                            {customization.label}
                                        </Label>
                                        {customization.description && (
                                            <p className="text-muted-foreground leading-relaxed">
                                                {customization.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] uppercase font-black text-muted-foreground/60 bg-muted px-2 py-1 rounded-md">CLI Argument</span>
                                            <code className="text-xs text-primary font-mono bg-primary/10 px-3 py-1 rounded-md border border-primary/20">
                                                {customization.arg}
                                            </code>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-8 mt-6 border-t flex justify-end items-center gap-4">
                     {error && (
                        <p className="text-sm text-destructive font-bold bg-destructive/10 px-4 py-2 rounded-xl flex items-center gap-3 mr-auto border border-destructive/20 animate-in fade-in slide-in-from-left-4">
                             <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                             {error}
                        </p>
                    )}
                    <Button variant="ghost" onClick={() => setView('list')} className="rounded-xl h-12 px-8 font-bold text-muted-foreground hover:text-foreground">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => downloadApp(selectedApp, activeCustomizations).catch(() => {})}
                        disabled={!!downloading}
                        className="gap-3 h-12 px-10 rounded-xl font-bold shadow-xl shadow-primary/25 bg-gradient-to-r from-primary to-blue-600 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        {downloading === selectedApp.id ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Downloading...
                            </>
                        ) : (
                            <>
                                <Download className="h-5 w-5" />
                                Start Packaging
                            </>
                        )}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[85vh] p-8 overflow-hidden bg-background">
            <DialogHeader className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <DialogTitle className="text-4xl font-black tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent flex items-center gap-3">
                             <Package className="h-10 w-10 text-primary" />
                             App Catalog
                        </DialogTitle>
                        <DialogDescription className="text-lg mt-2 font-medium text-muted-foreground/80">
                            Deploy tested and verified application packages in seconds.
                        </DialogDescription>
                    </div>
                    <div className="hidden lg:flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/5 rounded-full border border-primary/10 shadow-sm ring-1 ring-primary/5">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                            <span className="text-xs font-bold text-primary uppercase tracking-tighter">{APP_CATALOG.length} verified packages available</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mr-2">Updated Daily</p>
                    </div>
                </div>
            </DialogHeader>

            <div className="flex gap-8 flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 flex-shrink-0 flex flex-col gap-2 overflow-y-auto pr-4 scrollbar-thin">
                    <h3 className="text-[11px] font-black text-muted-foreground/50 mb-3 px-4 uppercase tracking-[0.2em] flex items-center gap-2">
                        Categories
                    </h3>
                    {categories.map(category => (
                        <Button
                            key={category}
                            variant={selectedCategory === category ? "secondary" : "ghost"}
                            className={cn(
                                "justify-start text-sm h-12 px-5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                                selectedCategory === category
                                    ? "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 border-none"
                                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:translate-x-1"
                            )}
                            onClick={() => setSelectedCategory(category)}
                        >
                            <span className={cn(
                                "mr-4 transition-transform duration-300 group-hover:scale-110",
                                selectedCategory === category ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                            )}>
                                {getCategoryIcon(category)}
                            </span>
                            {category}
                            {category !== 'All' && (
                                <span className={cn(
                                    "ml-auto text-[10px] font-black px-2 py-0.5 rounded-lg transition-all",
                                    selectedCategory === category
                                        ? "bg-white/20 text-white"
                                        : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                )}>
                                    {APP_CATALOG.filter(a => a.category === category).length}
                                </span>
                            )}
                        </Button>
                    ))}
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col gap-6 overflow-hidden relative">
                    <div className="flex gap-4 items-center">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-all duration-300" />
                            <Input
                                placeholder="Search apps, vendors, categories..."
                                className="pl-12 h-14 bg-muted/40 border-border/40 focus:bg-background transition-all duration-300 rounded-2xl ring-offset-background text-base shadow-inner focus:ring-2 focus:ring-primary/20"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        {selectedAppIds.size > 0 && (
                            <Button
                                variant="outline"
                                onClick={() => setSelectedAppIds(new Set())}
                                className="h-14 px-8 rounded-2xl border-dashed border-2 font-bold hover:bg-destructive/5 hover:text-destructive hover:border-destructive/50 transition-all flex gap-3 shadow-sm active:scale-95"
                            >
                                <PlusCircle className="h-5 w-5 rotate-45" />
                                Reset Selection ({selectedAppIds.size})
                            </Button>
                        )}
                    </div>

                    {error && (
                        <div className="p-5 text-sm font-bold text-destructive bg-destructive/5 border border-destructive/20 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-300">
                            <div className="h-3 w-3 rounded-full bg-destructive animate-ping shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 overflow-y-auto p-2 pr-4 scrollbar-thin">
                        {filteredApps.map((app) => (
                            <div
                                key={app.id}
                                className={cn(
                                    "relative flex flex-col p-6 border-2 rounded-3xl transition-all duration-500 group cursor-pointer overflow-hidden min-h-[220px]",
                                    selectedAppIds.has(app.id)
                                        ? "border-primary bg-primary/[0.02] shadow-2xl shadow-primary/10 -translate-y-1"
                                        : "bg-card hover:bg-muted/30 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1"
                                )}
                                onClick={() => handleAppClick(app)}
                            >
                                {/* Glow effect on hover */}
                                <div className="absolute -inset-24 bg-primary/5 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                <div className="absolute top-6 right-6 z-10" onClick={(e) => e.stopPropagation()}>
                                    <div className="relative group/check">
                                        <input
                                            type="checkbox"
                                            className="h-7 w-7 rounded-xl border-2 border-muted-foreground/20 text-primary focus:ring-primary cursor-pointer accent-primary transition-all duration-300 scale-110 opacity-0 absolute inset-0 z-20"
                                            checked={selectedAppIds.has(app.id)}
                                            onChange={(e) => {
                                                const newSet = new Set(selectedAppIds);
                                                if (e.target.checked) {
                                                    newSet.add(app.id);
                                                } else {
                                                    newSet.delete(app.id);
                                                }
                                                setSelectedAppIds(newSet);
                                            }}
                                            data-testid={`app-checkbox-${app.id}`}
                                            aria-label={`Select ${app.name}`}
                                        />
                                        <div className={cn(
                                            "h-7 w-7 rounded-xl border-2 flex items-center justify-center transition-all duration-300",
                                            selectedAppIds.has(app.id)
                                                ? "bg-primary border-primary shadow-lg shadow-primary/20 scale-110"
                                                : "bg-background/50 border-muted-foreground/20 group-hover/check:border-primary/50"
                                        )}>
                                            {selectedAppIds.has(app.id) && <Check className="h-4 w-4 text-primary-foreground stroke-[4]" />}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-6 items-start mb-6 relative">
                                    <div className="relative flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
                                        {app.iconUrl && !iconErrors.has(app.id) ? (
                                            <div className="relative h-20 w-20 bg-white rounded-3xl shadow-lg border-2 border-border/10 p-4 flex items-center justify-center overflow-hidden">
                                                <img
                                                    src={app.iconUrl}
                                                    alt=""
                                                    className="h-full w-full object-contain transition-transform duration-500 group-hover:rotate-3"
                                                    onError={() => handleIconError(app.id)}
                                                />
                                            </div>
                                        ) : (
                                            <div className="relative h-20 w-20 bg-secondary/50 rounded-3xl flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                                                <Hammer className="h-10 w-10 text-muted-foreground/40" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 pr-10">
                                        <div className="flex items-center gap-2 mb-1.5">
                                             <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-primary/10 text-primary uppercase tracking-widest border border-primary/10">
                                                {app.category}
                                            </span>
                                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground uppercase tracking-widest">
                                                v{app.version}
                                            </span>
                                        </div>
                                        <h3 className="font-black text-2xl text-foreground truncate group-hover:text-primary transition-colors duration-300 leading-none">
                                            {app.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground font-bold flex items-center gap-2 mt-2">
                                            {app.publisher}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-base text-muted-foreground/80 leading-relaxed line-clamp-2 mb-8 h-12 relative">
                                    <span className="absolute -left-3 top-0 text-2xl text-primary/20 font-serif">"</span>
                                    {app.description}
                                </p>

                                <div className="mt-auto flex items-center justify-between gap-4 relative">
                                     <div className="flex gap-2">
                                        {app.customizations && app.customizations.length > 0 && (
                                             <div className="flex items-center gap-2 bg-blue-500/5 text-blue-600 px-3 py-1.5 rounded-xl border border-blue-500/10 shadow-sm">
                                                <Wrench className="h-3.5 w-3.5 stroke-[2.5]" />
                                                <span className="text-[10px] font-black uppercase tracking-wider">Customizable</span>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAppClick(app);
                                        }}
                                        disabled={!!downloading}
                                        className={cn(
                                            "gap-2.5 rounded-2xl font-black text-xs h-11 px-6 transition-all duration-300 active:scale-95 shadow-lg",
                                            app.customizations?.length
                                                ? "bg-secondary hover:bg-secondary/80 text-secondary-foreground hover:shadow-secondary/20"
                                                : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
                                        )}
                                    >
                                        {downloading === app.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Download className="h-4 w-4" />
                                                {app.customizations?.length ? 'Configure' : 'Deploy Now'}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {filteredApps.length === 0 && (
                            <div className="col-span-full py-32 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
                                <div className="h-24 w-24 bg-muted/50 rounded-[2.5rem] flex items-center justify-center mb-8 border-2 border-dashed border-border shadow-inner">
                                    <Search className="h-10 w-10 text-muted-foreground/20" />
                                </div>
                                <h3 className="text-2xl font-black mb-3">No matching packages</h3>
                                <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
                                    We couldn't find "<strong>{search}</strong>" in the <strong>{selectedCategory}</strong> collection. Try broadening your search.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => { setSearch(''); setSelectedCategory('All'); }}
                                    className="mt-8 rounded-2xl px-10 h-12 font-black border-2 border-primary/20 text-primary hover:bg-primary/5 transition-all active:scale-95"
                                >
                                    View All Apps
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Bulk Actions Footer */}
                    {selectedAppIds.size > 0 && (
                        <div className="absolute bottom-6 left-6 right-6 z-20">
                            <div className="bg-background/80 backdrop-blur-2xl border-2 border-primary/30 rounded-[2rem] p-6 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-8 duration-700 ring-1 ring-white/10 overflow-hidden group/footer">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50 pointer-events-none" />
                                <div className="flex flex-col lg:flex-row gap-8 items-center relative z-10">
                                    <div className="flex items-center gap-6 flex-1">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-primary blur-2xl animate-pulse opacity-30 rounded-full" />
                                            <div className="relative h-16 w-16 rounded-[1.25rem] bg-primary flex items-center justify-center text-primary-foreground font-black text-2xl shadow-2xl shadow-primary/40 rotate-6 group-hover/footer:rotate-0 transition-transform duration-500">
                                                {selectedAppIds.size}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-black text-2xl leading-tight">Batch Process Selection</p>
                                            <p className="text-muted-foreground font-medium mt-1">Ready to automate {selectedAppIds.size} application deployments</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                                        <div className="flex items-center gap-3 bg-muted/60 px-6 py-2.5 rounded-[1.25rem] border-2 border-border/50 h-16 shadow-inner">
                                            <div className="relative h-6 w-6">
                                                <input
                                                    type="checkbox"
                                                    id="auto-assign"
                                                    checked={autoAssign}
                                                    onChange={(e) => setAutoAssign(e.target.checked)}
                                                    className="opacity-0 absolute inset-0 z-20 cursor-pointer"
                                                />
                                                <div className={cn(
                                                    "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
                                                    autoAssign ? "bg-primary border-primary shadow-lg shadow-primary/20" : "bg-background border-muted-foreground/30"
                                                )}>
                                                    {autoAssign && <Check className="h-3.5 w-3.5 text-primary-foreground stroke-[4]" />}
                                                </div>
                                            </div>
                                            <Label htmlFor="auto-assign" className="text-xs font-black cursor-pointer uppercase tracking-widest text-muted-foreground/80">Auto-Assign to</Label>
                                            {autoAssign && (
                                                <select
                                                    value={assignmentTarget}
                                                    onChange={(e) => setAssignmentTarget(e.target.value as any)}
                                                    className="text-xs bg-primary/10 rounded-lg px-3 py-1.5 border-none focus:ring-2 focus:ring-primary/20 font-black text-primary cursor-pointer outline-none transition-all hover:bg-primary/20 ml-2 shadow-sm"
                                                >
                                                    <option value="all-devices">All Devices</option>
                                                    <option value="all-users">All Users</option>
                                                </select>
                                            )}
                                        </div>

                                        <Button
                                            className="h-16 px-12 gap-4 shadow-2xl shadow-primary/30 bg-gradient-to-br from-primary via-primary to-blue-600 font-black text-lg rounded-[1.25rem] hover:scale-[1.02] active:scale-[0.98] transition-all w-full lg:w-auto border-t border-white/20"
                                            onClick={handleBulkDownload}
                                            disabled={bulkDownloading}
                                        >
                                            {bulkDownloading ? (
                                                <>
                                                    <Loader2 className="h-6 w-6 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="h-6 w-6" />
                                                    Deploy Selection
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
