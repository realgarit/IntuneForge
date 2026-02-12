import { useState } from 'react';
import { Terminal, ChevronUp, ChevronDown, Trash2, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LogEntry {
    id: string;
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
}

export function LogViewer() {
    const [isOpen, setIsOpen] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([
        { id: '1', timestamp: new Date().toLocaleTimeString(), message: 'IntuneForge session started.', type: 'info' },
        { id: '2', timestamp: new Date().toLocaleTimeString(), message: 'Application catalog loaded successfully.', type: 'success' },
        { id: '3', timestamp: new Date().toLocaleTimeString(), message: 'Environment configuration validated.', type: 'info' },
    ]);

    const clearLogs = () => {
        setLogs([]);
    };

    const getLogIcon = (type: LogEntry['type']) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
            case 'error': return <AlertCircle className="h-3.5 w-3.5 text-destructive" />;
            case 'warning': return <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />;
            default: return <Info className="h-3.5 w-3.5 text-blue-500" />;
        }
    };

    return (
        <div className={cn(
            "fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 border-t bg-background shadow-2xl overflow-hidden",
            isOpen ? "h-64" : "h-10"
        )}>
            {/* Header */}
            <div
                className="flex items-center justify-between px-6 h-10 cursor-pointer hover:bg-muted/50 transition-colors bg-muted/30"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-primary" />
                    <span className="text-xs font-black uppercase tracking-widest">System Logs</span>
                    <span className="ml-2 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold">
                        {logs.length} entries
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
                </div>
            </div>

            {/* Content */}
            {isOpen && (
                <div className="flex flex-col h-[calc(100%-2.5rem)]">
                    <div className="flex items-center justify-between px-6 py-2 border-b bg-muted/10">
                        <p className="text-[10px] text-muted-foreground font-medium">Real-time application activity</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-2 text-[10px] font-bold hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); clearLogs(); }}
                        >
                            <Trash2 className="h-3 w-3" />
                            Clear Logs
                        </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[11px] scrollbar-thin">
                        {logs.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                No logs to display.
                            </div>
                        ) : (
                            logs.map(log => (
                                <div key={log.id} className="flex gap-3 items-start animate-in slide-in-from-left-2 duration-200">
                                    <span className="text-muted-foreground/60 shrink-0">[{log.timestamp}]</span>
                                    <span className="shrink-0 mt-0.5">{getLogIcon(log.type)}</span>
                                    <span className={cn(
                                        "break-all",
                                        log.type === 'error' ? "text-destructive" :
                                        log.type === 'success' ? "text-green-500" :
                                        log.type === 'warning' ? "text-yellow-500" :
                                        "text-foreground/80"
                                    )}>
                                        {log.message}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
