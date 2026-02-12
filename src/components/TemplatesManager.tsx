import { useState } from 'react';
import { Copy, Trash2, FileCode, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { usePackage } from '@/contexts/PackageContext';
import type { PackageConfig } from '@/lib/package-config';

interface TemplatesManagerProps {
    onSelect: (template: PackageConfig) => void;
}

export function TemplatesManager({ onSelect }: TemplatesManagerProps) {
    const { templates, deleteTemplate } = usePackage();
    const [search, setSearch] = useState('');

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.publisher.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <DialogHeader>
                <DialogTitle>Package Templates</DialogTitle>
                <DialogDescription>
                    Load a saved configuration template to start packaging.
                </DialogDescription>
            </DialogHeader>

            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search templates..."
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {templates.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/20">
                    <FileCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No Templates Saved</h3>
                    <p className="text-muted-foreground">
                        Save a package configuration as a template to see it here.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto p-1">
                    {filteredTemplates.map((template) => (
                        <div
                            key={template.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex-1 min-w-0 mr-4">
                                <h3 className="font-semibold truncate">{template.name}</h3>
                                <p className="text-sm text-muted-foreground truncate">
                                    {template.publisher} • {template.version}
                                </p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onSelect(template)}
                                    className="gap-2"
                                >
                                    <Copy className="h-4 w-4" />
                                    Load
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteTemplate(template.id)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {filteredTemplates.length === 0 && templates.length > 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No templates found matching "{search}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
