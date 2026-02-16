import { useState, useEffect } from 'react';
import { usePackage } from '@/contexts/PackageContext';
import { APP_CATALOG } from '@/lib/app-catalog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, RefreshCw, ExternalLink, Activity } from 'lucide-react';

interface LinkStatus {
    id: string;
    name: string;
    url: string;
    status: 'checking' | 'valid' | 'invalid' | 'error';
    statusCode?: number;
    error?: string;
}

export function LinkHealth() {
    const { configs } = usePackage();
    const [statuses, setStatuses] = useState<LinkStatus[]>([]);
    const [isCheckingAll, setIsCheckingAll] = useState(false);

    const getAllLinks = () => {
        const catalogLinks = APP_CATALOG.map(app => ({
            id: app.id,
            name: app.name,
            url: app.downloadUrl
        }));

        const userLinks = configs
            .filter(c => c.sourceType === 'url' && c.sourceUrl)
            .map(c => ({
                id: c.id,
                name: c.name,
                url: c.sourceUrl!
            }));

        return [...catalogLinks, ...userLinks];
    };

    useEffect(() => {
        const initialStatuses = getAllLinks().map(link => ({
            ...link,
            status: 'checking' as const
        }));
        setStatuses(initialStatuses);
        checkAllLinks(initialStatuses);
    }, []);

    const checkLink = async (url: string): Promise<{ status: 'valid' | 'invalid' | 'error'; statusCode?: number; error?: string }> => {
        try {
            const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl, { method: 'HEAD' });

            if (response.ok) {
                return { status: 'valid', statusCode: response.status };
            } else {
                return { status: 'invalid', statusCode: response.status };
            }
        } catch (err) {
            return { status: 'error', error: err instanceof Error ? err.message : 'Unknown error' };
        }
    };

    const checkAllLinks = async (currentStatuses: LinkStatus[]) => {
        setIsCheckingAll(true);
        const newStatuses = [...currentStatuses];

        // Use a small delay between checks to avoid rate limiting
        for (let i = 0; i < newStatuses.length; i++) {
            newStatuses[i].status = 'checking';
            setStatuses([...newStatuses]);

            const result = await checkLink(newStatuses[i].url);
            newStatuses[i] = { ...newStatuses[i], ...result };
            setStatuses([...newStatuses]);

            // Wait 100ms between requests
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        setIsCheckingAll(false);
    };

    const handleRefresh = () => {
        const initialStatuses = getAllLinks().map(link => ({
            ...link,
            status: 'checking' as const
        }));
        setStatuses(initialStatuses);
        checkAllLinks(initialStatuses);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <Activity className="h-8 w-8 text-primary" />
                        Link Health Monitor
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Verifying download accessibility for all catalog and custom applications.
                    </p>
                </div>
                <Button
                    onClick={handleRefresh}
                    disabled={isCheckingAll}
                    className="gap-2"
                >
                    <RefreshCw className={isCheckingAll ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                    {isCheckingAll ? 'Checking...' : 'Refresh All'}
                </Button>
            </div>

            <Card className="border-border/40 overflow-hidden bg-card/50 backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 border-b border-border/40">
                            <tr>
                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Application</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Status</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">URL</th>
                                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {statuses.map((item) => (
                                <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-foreground">{item.name}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.status === 'checking' && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <RefreshCw className="h-3 w-3 animate-spin" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Checking</span>
                                            </div>
                                        )}
                                        {item.status === 'valid' && (
                                            <div className="flex items-center gap-2 text-green-500">
                                                <CheckCircle2 className="h-3 w-3" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Valid ({item.statusCode})</span>
                                            </div>
                                        )}
                                        {item.status === 'invalid' && (
                                            <div className="flex items-center gap-2 text-destructive">
                                                <XCircle className="h-3 w-3" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Invalid ({item.statusCode})</span>
                                            </div>
                                        )}
                                        {item.status === 'error' && (
                                            <div className="flex items-center gap-2 text-amber-500">
                                                <XCircle className="h-3 w-3" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Error</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-[10px] bg-muted px-2 py-1 rounded-md text-muted-foreground block max-w-md truncate">
                                            {item.url}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                                        >
                                            Visit <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
