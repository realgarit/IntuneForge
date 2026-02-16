import { useState, useCallback } from 'react';
import { Upload, FileArchive, Link2, AlertCircle, Plus, Trash2, Check, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePackage } from '@/contexts/PackageContext';
import { formatFileSize } from '@/lib/utils';

export function FileUploader() {
    const {
        selectedFile,
        setSelectedFile,
        currentConfig,
        updateCurrentConfig,
        additionalFiles,
        setAdditionalFiles
    } = usePackage();
    const [isDragging, setIsDragging] = useState(false);
    const [urlError, setUrlError] = useState<string | null>(null);

    const handleFileSelect = useCallback((file: File) => {
        const validExtensions = ['.exe', '.msi', '.msix', '.msixbundle'];
        const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

        if (!validExtensions.includes(ext)) {
            alert('Please select a valid installer file (.exe, .msi, .msix, .msixbundle)');
            return;
        }

        setSelectedFile(file);

        // Auto-fill some fields based on file
        if (currentConfig) {
            const baseName = file.name.replace(/\.[^/.]+$/, '');
            updateCurrentConfig({
                sourceType: 'local',
                setupFileName: file.name,
                name: currentConfig.name || baseName,
                displayName: currentConfig.displayName || baseName,
                packageType: ext === '.msi' ? 'MSI' : 'EXE',
            });
        }
    }, [currentConfig, setSelectedFile, updateCurrentConfig]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    }, [handleFileSelect]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleUrlChange = (url: string) => {
        updateCurrentConfig({ sourceUrl: url, sourceType: 'url' });

        // Extract filename from URL
        try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/');
            const fileName = pathParts[pathParts.length - 1];
            if (fileName && (fileName.endsWith('.exe') || fileName.endsWith('.msi'))) {
                updateCurrentConfig({ setupFileName: fileName });
                setUrlError(null);
            }
        } catch {
            if (url.length > 0) {
                setUrlError('Please enter a valid URL');
            } else {
                setUrlError(null);
            }
        }
    };

    const handleAdditionalFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setAdditionalFiles([...additionalFiles, ...Array.from(files)]);
        }
        // Reset input
        e.target.value = '';
    };

    const removeAdditionalFile = (index: number) => {
        const newFiles = [...additionalFiles];
        newFiles.splice(index, 1);
        setAdditionalFiles(newFiles);
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileArchive className="h-5 w-5" />
                        Source File
                    </CardTitle>
                    <CardDescription>
                        Upload your installer file or provide a download URL
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="upload" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="upload">
                                <Upload className="h-4 w-4 mr-2" />
                                Local File
                            </TabsTrigger>
                            <TabsTrigger value="url">
                                <Link2 className="h-4 w-4 mr-2" />
                                Remote URL
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="upload" className="mt-4">
                            {currentConfig?.sourceType === 'url' && selectedFile ? (
                                <div className="relative border-2 border-primary bg-primary/5 rounded-2xl p-8 text-center animate-in zoom-in-95 duration-500 shadow-inner">
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                        Catalog Source
                                    </div>
                                    <div className="space-y-4">
                                        <div className="w-20 h-20 mx-auto rounded-[2rem] bg-white shadow-xl flex items-center justify-center border-2 border-primary/20 relative group-hover:scale-110 transition-transform duration-500">
                                            {currentConfig.iconUrl ? (
                                                <img src={currentConfig.iconUrl} alt="" className="h-12 w-12 object-contain" />
                                            ) : (
                                                <FileArchive className="h-10 w-10 text-primary" />
                                            )}
                                            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 shadow-lg border-2 border-white">
                                                <Check className="h-3 w-3 text-white stroke-[4]" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-black text-lg">{selectedFile.name}</p>
                                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-tighter mt-1">
                                                {formatFileSize(selectedFile.size)} • Ready to Package
                                            </p>
                                        </div>
                                        <div className="flex justify-center gap-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-xl font-bold h-10 px-6 border-primary/20 hover:bg-primary/5 text-primary"
                                                onClick={() => document.getElementById('file-input')?.click()}
                                            >
                                                Replace File
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className={`
                        relative border-2 border-dashed rounded-2xl p-10 text-center
                        transition-all duration-300 cursor-pointer group
                        ${isDragging
                                            ? 'border-primary bg-primary/5 scale-[0.99] shadow-inner'
                                            : 'border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/30'
                                        }
                      `}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => document.getElementById('file-input')?.click()}
                                >
                                    <input
                                        id="file-input"
                                        type="file"
                                        className="hidden"
                                        accept=".exe,.msi,.msix,.msixbundle"
                                        onChange={handleFileInput}
                                    />

                                    {selectedFile ? (
                                        <div className="space-y-4">
                                            <div className="w-20 h-20 mx-auto rounded-[2rem] bg-primary/10 flex items-center justify-center border-2 border-primary/5 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                                <FileArchive className="h-10 w-10 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-black text-lg">{selectedFile.name}</p>
                                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-tighter mt-1">
                                                    {formatFileSize(selectedFile.size)}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="rounded-xl font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedFile(null);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Remove File
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 py-4">
                                            <div className="w-20 h-20 mx-auto rounded-[2rem] bg-muted flex items-center justify-center border-2 border-border shadow-inner group-hover:rotate-6 transition-transform duration-500">
                                                <Upload className="h-10 w-10 text-muted-foreground/40" />
                                            </div>
                                            <div>
                                                <p className="font-black text-lg">Drop your installer here</p>
                                                <p className="text-sm text-muted-foreground font-medium mt-1">
                                                    or click to browse <span className="text-primary font-bold">.exe, .msi, .msix</span>
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="url" className="mt-4 space-y-6 animate-in slide-in-from-right-4 duration-500">
                            <div className="space-y-3">
                                <Label htmlFor="download-url" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Source URL</Label>
                                <div className="relative group">
                                    <Input
                                        id="download-url"
                                        type="url"
                                        placeholder="https://example.com/installer.exe"
                                        value={currentConfig?.sourceUrl || ''}
                                        onChange={(e) => handleUrlChange(e.target.value)}
                                        className="h-14 bg-background/50 border-border/40 rounded-2xl focus:ring-2 focus:ring-primary/20 pl-12"
                                    />
                                    <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                </div>
                                {urlError && (
                                    <p className="text-xs text-destructive font-bold flex items-center gap-2 px-2 animate-in fade-in slide-in-from-top-1">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        {urlError}
                                    </p>
                                )}
                            </div>
                            
                            <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex gap-4 text-sm shadow-inner">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                                    <Info className="h-4 w-4 text-primary" />
                                </div>
                                <div className="text-muted-foreground leading-relaxed py-1">
                                    <strong className="text-foreground font-black">Remote Source:</strong> When using a URL, IntuneForge will attempt to fetch metadata automatically. 
                                    <span className="block mt-1 text-[11px] opacity-70">Note: Browser security (CORS) may limit some direct downloads.</span>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Additional Files
                    </CardTitle>
                    <CardDescription>
                        Include extra files like transforms (MST), licenses, or config scripts
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => document.getElementById('additional-file-input')?.click()}
                            className="gap-2"
                        >
                            <Upload className="h-4 w-4" />
                            Add Files
                        </Button>
                        <input
                            id="additional-file-input"
                            type="file"
                            className="hidden"
                            multiple
                            onChange={handleAdditionalFiles}
                        />
                        <span className="text-sm text-muted-foreground">
                            {additionalFiles.length} file{additionalFiles.length !== 1 ? 's' : ''} added
                        </span>
                    </div>

                    {additionalFiles.length > 0 && (
                        <div className="border rounded-lg divide-y">
                            {additionalFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-3">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-2 rounded bg-muted">
                                            <FileArchive className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{file.name}</p>
                                            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                                        </div>
                                    </div>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeAdditionalFile(index)}
                                                aria-label="Remove file"
                                                className="text-muted-foreground hover:text-destructive shrink-0"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="rounded-lg font-bold">Remove File</TooltipContent>
                                    </Tooltip>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
