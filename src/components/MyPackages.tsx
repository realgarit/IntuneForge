import { FolderOpen, Trash2, Download, Upload, Search, Package, Plus, LayoutGrid, List, Edit3, Calendar, CheckCircle2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePackage } from '@/contexts/PackageContext';
import { exportConfig, importConfig } from '@/lib/package-config';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useSearchShortcut } from '@/hooks/useSearchShortcut';
import { cn } from '@/lib/utils';
import type { PackageConfig } from '@/lib/package-config';

interface MyPackagesProps {
    onEdit: () => void;
}

export function MyPackages({ onEdit }: MyPackagesProps) {
    const {
        configs,
        currentConfig,
        setCurrentConfig,
        deleteConfig,
        deleteConfigs,
        setSelectedFile,
        createNewConfig
    } = usePackage();

    const [search, setSearch] = useState('');
    const searchInputRef = useSearchShortcut();
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const headerCheckboxRef = useRef<HTMLInputElement>(null);

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

    const handleExport = (config: PackageConfig) => {
        exportConfig(config);
    };

    const handleBulkDelete = () => {
        if (confirm(`Delete ${selectedIds.size} packages?`)) {
            deleteConfigs(Array.from(selectedIds));
            setSelectedIds(new Set());
        }
    };

    const handleBulkExport = () => {
        configs.filter(c => selectedIds.has(c.id)).forEach(c => exportConfig(c));
    };

    useEffect(() => {
        if (headerCheckboxRef.current) {
            headerCheckboxRef.current.indeterminate = selectedIds.size > 0 && selectedIds.size < filteredConfigs.length;
        }
    }, [selectedIds, filteredConfigs.length]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pb-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tight flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                            <Package className="h-8 w-8 text-primary" />
                        </div>
                        My Packages
                    </h2>
                    <p className="text-muted-foreground mt-2 font-medium">
                        Manage your locally saved application configurations.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleImport} className="gap-2 h-12 px-6 rounded-xl font-bold border-border/40 hover:bg-muted/50 transition-all">
                        <Upload className="h-4 w-4" />
                        Import
                    </Button>
                    <Button onClick={() => { createNewConfig(); onEdit(); }} className="gap-3 h-12 px-8 rounded-xl font-black bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all border-t border-white/10">
                        <Plus className="h-5 w-5" />
                        New Package
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative group w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        ref={searchInputRef}
                        placeholder="Search your packages, vendors..."
                        className="pl-12 h-14 bg-muted/40 border-border/40 focus:bg-background transition-all rounded-2xl text-base shadow-inner focus:ring-2 focus:ring-primary/20"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search ? (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-90"
                            aria-label="Clear search"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    ) : (
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none hidden md:flex items-center gap-1">
                            <kbd className="h-6 px-2 rounded-lg border border-border/60 bg-background/50 text-[10px] font-black text-muted-foreground/60 flex items-center justify-center shadow-sm">
                                /
                            </kbd>
                        </div>
                    )}
                </div>

                <div className="flex items-center bg-muted/40 p-1.5 rounded-2xl border border-border/40 shadow-inner">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                size="icon"
                                onClick={() => setViewMode('grid')}
                                aria-label="Grid View"
                                className={cn(
                                    "h-11 w-11 rounded-xl transition-all duration-300",
                                    viewMode === 'grid' ? "bg-background shadow-md text-primary" : "text-muted-foreground"
                                )}
                            >
                                <LayoutGrid className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="rounded-lg font-bold">Grid View</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                                size="icon"
                                onClick={() => setViewMode('table')}
                                aria-label="Table View"
                                className={cn(
                                    "h-11 w-11 rounded-xl transition-all duration-300",
                                    viewMode === 'table' ? "bg-background shadow-md text-primary" : "text-muted-foreground"
                                )}
                            >
                                <List className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="rounded-lg font-bold">Table View</TooltipContent>
                    </Tooltip>
                </div>
            </div>

            {filteredConfigs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border/40 rounded-[2.5rem] bg-muted/5 animate-in zoom-in-95 duration-500">
                    <div className="h-24 w-24 bg-muted/50 rounded-[2.5rem] flex items-center justify-center mb-6 border-2 border-dashed border-border shadow-inner">
                        <FolderOpen className="h-10 w-10 text-muted-foreground/20" />
                    </div>
                    <h3 className="text-2xl font-black mb-2">{search ? "No matches found" : "Your library is empty"}</h3>
                    <p className="text-muted-foreground max-w-sm mb-8 font-medium">
                        {search ? "Try adjusting your search terms to find what you're looking for." : "Start by creating a new package from the catalog or uploading your own installer file."}
                    </p>
                    {!search && (
                        <Button onClick={() => { createNewConfig(); onEdit(); }} className="gap-3 rounded-2xl h-14 px-10 font-black shadow-xl shadow-primary/20">
                            <Plus className="h-6 w-6" />
                            Create First Package
                        </Button>
                    )}
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredConfigs.map((config) => (
                        <Card
                            key={config.id}
                            className={cn(
                                "group relative border-border/40 hover:border-primary/40 transition-all duration-500 cursor-pointer overflow-hidden rounded-[2rem] bg-card/50 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1",
                                        selectedIds.has(config.id) ? "border-primary bg-primary/[0.03]" : (currentConfig?.id === config.id && "ring-2 ring-primary bg-primary/[0.03] border-primary/40")
                            )}
                            onClick={() => {
                                setCurrentConfig(config);
                                setSelectedFile(null);
                                onEdit();
                            }}
                        >
                            <CardHeader className="pb-4 relative">
                                <div className="flex justify-between items-start">
                                            <div className="flex gap-4 items-start">
                                                <div className="relative group/check" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        className="opacity-0 absolute inset-0 z-20 cursor-pointer h-6 w-6"
                                                        checked={selectedIds.has(config.id)}
                                                        onChange={() => {
                                                            const next = new Set(selectedIds);
                                                            if (next.has(config.id)) next.delete(config.id);
                                                            else next.add(config.id);
                                                            setSelectedIds(next);
                                                        }}
                                                        aria-label={`Select ${config.displayName || config.name}`}
                                                    />
                                                    <div className={cn(
                                                        "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
                                                        selectedIds.has(config.id)
                                                            ? "bg-primary border-primary shadow-lg shadow-primary/20 scale-110"
                                                            : "bg-background border-muted-foreground/20 group-hover:border-primary/50"
                                                    )}>
                                                        {selectedIds.has(config.id) && <Check className="h-3.5 w-3.5 text-primary-foreground stroke-[4]" />}
                                                    </div>
                                                </div>
                                                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 group-hover:scale-110 transition-transform duration-500">
                                                    <Package className="h-6 w-6 text-primary" />
                                                </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-2 group-hover:translate-y-0" onClick={(e) => e.stopPropagation()}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label="Export JSON"
                                                    className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                                    onClick={() => handleExport(config)}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="rounded-lg font-bold">Export JSON</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label="Delete Package"
                                                    className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                    onClick={() => {
                                                        if (confirm('Delete this package configuration?')) {
                                                            deleteConfig(config.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="rounded-lg font-bold">Delete</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                                <CardTitle className="text-xl mt-5 font-black tracking-tight truncate leading-none">{config.displayName || config.name || 'Untitled'}</CardTitle>
                                <CardDescription className="font-bold flex items-center gap-2 mt-2">
                                    <span className="truncate">{config.publisher}</span>
                                    <span className="h-1 w-1 rounded-full bg-muted-foreground/30 shrink-0" />
                                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0 uppercase tracking-widest">v{config.version}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="h-px w-full bg-gradient-to-r from-transparent via-border/40 to-transparent mb-4" />
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        {config.packageType}
                                    </div>
                                    <span className="opacity-60">{new Date(config.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="bg-card/50 rounded-[2.5rem] border border-border/40 overflow-hidden shadow-2xl animate-in slide-in-from-top-4 duration-500">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/30 border-b border-border/40">
                                    <th className="p-6 w-12">
                                        <div className="relative group/check">
                                            <input
                                                type="checkbox"
                                                ref={headerCheckboxRef}
                                                className="opacity-0 absolute inset-0 z-20 cursor-pointer h-6 w-6"
                                                checked={selectedIds.size > 0 && selectedIds.size === filteredConfigs.length}
                                                onChange={() => {
                                                    if (selectedIds.size === filteredConfigs.length) setSelectedIds(new Set());
                                                    else setSelectedIds(new Set(filteredConfigs.map(c => c.id)));
                                                }}
                                                aria-label="Select all packages"
                                            />
                                            <div className={cn(
                                                "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
                                                selectedIds.size > 0 && selectedIds.size === filteredConfigs.length
                                                    ? "bg-primary border-primary shadow-lg shadow-primary/20"
                                                    : "bg-background border-muted-foreground/20 group-hover:border-primary/50"
                                            )}>
                                                {selectedIds.size === filteredConfigs.length && selectedIds.size > 0 && <Check className="h-3.5 w-3.5 text-primary-foreground stroke-[4]" />}
                                                {selectedIds.size > 0 && selectedIds.size < filteredConfigs.length && <div className="h-1 w-3 bg-primary rounded-full" />}
                                            </div>
                                        </div>
                                    </th>
                                <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Application</th>
                                <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Publisher</th>
                                <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Version</th>
                                <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Updated</th>
                                <th className="p-6 font-black uppercase tracking-widest text-[10px] text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {filteredConfigs.map((config) => (
                                <tr
                                    key={config.id}
                                    className={cn(
                                        "group hover:bg-primary/[0.02] transition-colors cursor-pointer",
                                            selectedIds.has(config.id) ? "bg-primary/[0.04]" : (currentConfig?.id === config.id && "bg-primary/[0.04]")
                                    )}
                                    onClick={() => {
                                        setCurrentConfig(config);
                                        setSelectedFile(null);
                                        onEdit();
                                    }}
                                >
                                        <td className="p-6" onClick={(e) => e.stopPropagation()}>
                                            <div className="relative group/check">
                                                <input
                                                    type="checkbox"
                                                    className="opacity-0 absolute inset-0 z-20 cursor-pointer h-6 w-6"
                                                    checked={selectedIds.has(config.id)}
                                                    onChange={() => {
                                                        const next = new Set(selectedIds);
                                                        if (next.has(config.id)) next.delete(config.id);
                                                        else next.add(config.id);
                                                        setSelectedIds(next);
                                                    }}
                                                    aria-label={`Select ${config.displayName || config.name}`}
                                                />
                                                <div className={cn(
                                                    "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
                                                    selectedIds.has(config.id)
                                                        ? "bg-primary border-primary shadow-lg shadow-primary/20"
                                                        : "bg-background border-muted-foreground/20 group-hover:border-primary/50"
                                                )}>
                                                    {selectedIds.has(config.id) && <Check className="h-3.5 w-3.5 text-primary-foreground stroke-[4]" />}
                                                </div>
                                            </div>
                                        </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                <Package className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-bold group-hover:text-primary transition-colors text-base">{config.displayName || config.name || 'Untitled'}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-widest">{config.packageType}</span>
                                                    {config.assignments?.length > 0 && (
                                                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 uppercase tracking-widest flex items-center gap-1">
                                                            <CheckCircle2 className="h-2.5 w-2.5" />
                                                            Assigned
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-sm font-bold text-muted-foreground">
                                        {config.publisher}
                                    </td>
                                    <td className="p-6">
                                        <span className="text-xs font-mono font-bold bg-muted/50 px-2 py-1 rounded-md border border-border/40">v{config.version}</span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4 opacity-40" />
                                            {new Date(config.updatedAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-6 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex justify-end gap-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" aria-label="Edit Package" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all" onClick={() => { setCurrentConfig(config); setSelectedFile(null); onEdit(); }}>
                                                        <Edit3 className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="rounded-lg font-bold">Edit</TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" aria-label="Export JSON" className="h-10 w-10 rounded-xl hover:bg-muted transition-all" onClick={() => handleExport(config)}>
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="rounded-lg font-bold">Export</TooltipContent>
                                            </Tooltip>

                                            <div className="w-px h-10 bg-border/20 mx-1" />

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" aria-label="Delete Package" className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all" onClick={() => { if(confirm('Delete this package?')) deleteConfig(config.id); }}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="rounded-lg font-bold">Delete</TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Bulk Action Bar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-500">
                    <div className="bg-background/80 backdrop-blur-2xl border-2 border-primary/30 rounded-3xl p-4 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] flex items-center gap-8 ring-1 ring-white/10">
                        <div className="flex items-center gap-4 px-4 border-r border-border/40">
                             <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black shadow-lg shadow-primary/20">
                                 {selectedIds.size}
                             </div>
                             <div>
                                 <p className="text-sm font-black uppercase tracking-widest">Selected</p>
                                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Packages</p>
                             </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                className="h-12 px-6 rounded-2xl gap-2 font-bold hover:bg-primary/10 hover:text-primary transition-all"
                                onClick={handleBulkExport}
                            >
                                <Download className="h-4 w-4" />
                                Export Selected
                            </Button>
                            <Button
                                variant="ghost"
                                className="h-12 px-6 rounded-2xl gap-2 font-bold hover:bg-destructive/10 hover:text-destructive transition-all"
                                onClick={handleBulkDelete}
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete Selected
                            </Button>
                            <div className="w-px h-8 bg-border/40 mx-2" />
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Clear Selection"
                                        className="h-12 w-12 rounded-2xl hover:bg-muted transition-all"
                                        onClick={() => setSelectedIds(new Set())}
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="rounded-lg font-bold">Clear Selection</TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
