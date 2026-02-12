import { Plus, LayoutDashboard, Library, Package, Settings, ChevronRight, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { usePackage } from '@/contexts/PackageContext';
import { useAuth } from '@/contexts/AuthContext';
import { SettingsDialog } from '@/components/SettingsDialog';
import { cn } from '@/lib/utils';
import type { View } from '@/App';

interface SidebarProps {
    currentView: View;
    onNavigate: (view: View) => void;
    settingsOpen?: boolean;
    onSettingsOpenChange?: (open: boolean) => void;
}

export function Sidebar({
    currentView,
    onNavigate,
    settingsOpen: propsSettingsOpen,
    onSettingsOpenChange
}: SidebarProps) {
    const { clientId, tenantId, isAuthenticated } = useAuth();
    const [showSetupCue, setShowSetupCue] = useState(false);
    const [internalSettingsOpen, setInternalSettingsOpen] = useState(false);

    const settingsOpen = propsSettingsOpen !== undefined ? propsSettingsOpen : internalSettingsOpen;
    const setSettingsOpen = onSettingsOpenChange || setInternalSettingsOpen;

    // Check if visual cue should be shown
    useState(() => {
        const isDismissed = localStorage.getItem('settings-cue-dismissed') === 'true';
        const isSetup = !!clientId && !!tenantId;

        if (!isSetup && !isDismissed) {
            setTimeout(() => setShowSetupCue(true), 1000);
        }
    });

    const handleDismissCue = () => {
        setShowSetupCue(false);
        localStorage.setItem('settings-cue-dismissed', 'true');
    };

    const handleOpenSettings = (open: boolean) => {
        setSettingsOpen(open);
        if (open) {
            handleDismissCue();
        }
    };
    const {
        createNewConfig,
        configs
    } = usePackage();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'catalog', label: 'App Catalog', icon: Library },
        { id: 'packages', label: 'My Packages', icon: Package },
        { id: 'editor', label: 'Package Editor', icon: Settings },
    ] as const;

    const handleNewPackage = () => {
        createNewConfig();
        onNavigate('editor');
    };

    return (
        <aside className="w-full lg:w-72 shrink-0 flex flex-col h-full bg-muted/20 border-r border-border/40 p-6">
            <div className="space-y-8 flex-1">
                <div className="space-y-2">
                    <Button
                        onClick={handleNewPackage}
                        className="w-full gap-3 bg-gradient-to-br from-primary to-blue-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20 transition-all h-14 rounded-2xl text-sm font-black uppercase tracking-widest border-t border-white/10"
                    >
                        <Plus className="h-5 w-5 stroke-[3]" />
                        New Package
                    </Button>
                </div>

                <nav className="space-y-1">
                    <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-3">
                        Navigation
                    </p>
                    <div className="space-y-2">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group text-sm font-bold relative overflow-hidden",
                                    currentView === item.id
                                        ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20"
                                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:translate-x-1"
                                )}
                            >
                                <div className="flex items-center gap-3 relative z-10">
                                    <item.icon className={cn(
                                        "h-5 w-5 transition-transform duration-300",
                                        currentView === item.id ? "scale-110" : "group-hover:scale-110 group-hover:text-primary"
                                    )} />
                                    {item.label}
                                </div>
                                {currentView === item.id && (
                                    <ChevronRight className="h-4 w-4 relative z-10 animate-in slide-in-from-left-2" />
                                )}
                                {currentView === item.id && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                                )}
                            </button>
                        ))}
                    </div>
                </nav>

                <div className="pt-6">
                    <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-3">
                        Resources
                    </p>
                    <div className="space-y-2">
                        <div className="relative">
                            {showSetupCue && (
                                <div className="absolute bottom-full left-0 mb-4 w-64 p-4 rounded-xl bg-popover border border-border shadow-xl z-50 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-popover border-b border-r border-border rotate-45" />
                                    <div className="space-y-2">
                                        <p className="font-semibold text-sm">Start Here!</p>
                                        <p className="text-xs text-muted-foreground">
                                            Configure your Azure AD environment settings to get started.
                                        </p>
                                        <Button
                                            size="sm"
                                            className="w-full text-xs h-7"
                                            onClick={handleDismissCue}
                                        >
                                            Got it
                                        </Button>
                                    </div>
                                </div>
                            )}
                            <SettingsDialog
                                open={settingsOpen}
                                onOpenChange={handleOpenSettings}
                                trigger={
                                    <button
                                        className={cn(
                                            "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 text-sm font-bold group relative",
                                            currentView === 'settings' || settingsOpen
                                                ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20"
                                                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:translate-x-1",
                                            showSetupCue && "animate-bounce border-primary/50 text-primary shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Settings className={cn(
                                                "h-5 w-5 transition-transform duration-300",
                                                currentView === 'settings' || settingsOpen ? "rotate-90" : "group-hover:rotate-45"
                                            )} />
                                            Settings
                                        </div>
                                        {showSetupCue && (
                                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full animate-ping" />
                                        )}
                                    </button>
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-6 space-y-4">
                <div className="p-5 bg-card/50 rounded-3xl border border-border/40 shadow-sm relative overflow-hidden group">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                        <Activity className="h-3 w-3 text-primary" />
                        Environment Status
                    </h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-foreground/80">Microsoft Graph</span>
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "text-[9px] font-black px-1.5 py-0.5 rounded-md border",
                                    isAuthenticated
                                        ? "text-green-500 bg-green-500/10 border-green-500/10"
                                        : "text-amber-500 bg-amber-500/10 border-amber-500/10"
                                )}>
                                    {isAuthenticated ? 'CONNECTED' : 'GUEST'}
                                </span>
                                <div className={cn(
                                    "h-2 w-2 rounded-full",
                                    isAuthenticated
                                        ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                                        : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                                )} />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-foreground/80">Storage</span>
                            <span className="text-[9px] font-black text-muted-foreground uppercase">{configs.length > 0 ? 'Active' : 'Empty'}</span>
                        </div>
                    </div>
                </div>

                <div className="px-4 flex items-center justify-between">
                    <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">v1.2.0-stable</span>
                    <div className="flex gap-1">
                        <div className="h-1 w-1 rounded-full bg-muted-foreground/20" />
                        <div className="h-1 w-1 rounded-full bg-muted-foreground/20" />
                        <div className="h-1 w-1 rounded-full bg-muted-foreground/20" />
                    </div>
                </div>
            </div>
        </aside>
    );
}
