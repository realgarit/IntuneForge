import { useState, useCallback } from 'react';
import { Upload, FileArchive, Link2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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
                            <TabsTrigger value="url" disabled>
                                <Link2 className="h-4 w-4 mr-2" />
                                URL (Coming Soon)
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="upload" className="mt-4">
                            <div
                                className={`
                    relative border-2 border-dashed rounded-lg p-8 text-center
                    transition-all duration-200 cursor-pointer
                    ${isDragging
                                        ? 'border-primary bg-primary/5'
                                        : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
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
                                    <div className="space-y-2">
                                        <div className="w-16 h-16 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                                            <FileArchive className="h-8 w-8 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{selectedFile.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatFileSize(selectedFile.size)}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedFile(null);
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="w-16 h-16 mx-auto rounded-lg bg-muted flex items-center justify-center">
                                            <Upload className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Drop your installer here</p>
                                            <p className="text-sm text-muted-foreground">
                                                or click to browse (.exe, .msi, .msix)
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="url" className="mt-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="download-url">Download URL</Label>
                                <Input
                                    id="download-url"
                                    type="url"
                                    placeholder="https://example.com/installer.exe"
                                    value={currentConfig?.sourceUrl || ''}
                                    onChange={(e) => handleUrlChange(e.target.value)}
                                />
                                {urlError && (
                                    <p className="text-sm text-destructive flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {urlError}
                                    </p>
                                )}
                            </div>
                            <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                                <AlertCircle className="h-4 w-4 inline mr-2" />
                                Note: Due to browser security restrictions, downloading from URLs is not supported in the web version.
                                Please download the file first, then upload it locally.
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
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeAdditionalFile(index)}
                                        className="text-muted-foreground hover:text-destructive shrink-0"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
