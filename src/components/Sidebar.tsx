import { Plus, LayoutDashboard, Library, Package, Settings, ChevronRight, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePackage } from '@/contexts/PackageContext';
import { cn } from '@/lib/utils';
import type { View } from '@/App';

interface SidebarProps {
    currentView: View;
    onNavigate: (view: View) => void;
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
    const {
        createNewConfig,
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
                        <button
                            onClick={() => onNavigate('settings')}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 text-sm font-bold group",
                                currentView === 'settings'
                                    ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20"
                                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:translate-x-1"
                            )}
                        >
                            <Settings className={cn(
                                "h-5 w-5 transition-transform duration-300",
                                currentView === 'settings' ? "rotate-90" : "group-hover:rotate-45"
                            )} />
                            Settings
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-6 space-y-4">
                <div className="p-5 bg-card/50 rounded-3xl border border-border/40 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Settings className="h-12 w-12" />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                        <Activity className="h-3 w-3 text-primary" />
                        System Health
                    </h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-foreground/80">Core Engine</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-primary px-1.5 py-0.5 bg-primary/10 rounded-md border border-primary/10 animate-pulse">LIVE</span>
                                <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-foreground/80">Catalog Sync</span>
                            <span className="text-[9px] font-black text-muted-foreground">OK</span>
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
