import { Plus, LayoutDashboard, Library, Package, Settings, ChevronRight } from 'lucide-react';
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
        // createNewConfig already sets the new config as current in the context usually
        // If it doesn't, we should check PackageContext.
        onNavigate('editor');
    };

    return (
        <aside className="w-full lg:w-72 shrink-0 space-y-6">
            <div className="space-y-2">
                <Button
                    onClick={handleNewPackage}
                    className="w-full gap-3 bg-primary hover:bg-primary/90 shadow-md transition-all active:scale-95 h-12 rounded-xl text-sm font-bold"
                >
                    <Plus className="h-5 w-5" />
                    New Package
                </Button>
            </div>

            <nav className="space-y-1">
                <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">
                    Navigation
                </p>
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={cn(
                            "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                            currentView === item.id
                                ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className={cn(
                                "h-5 w-5 transition-colors",
                                currentView === item.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )} />
                            {item.label}
                        </div>
                        {currentView === item.id && (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </button>
                ))}
            </nav>

            <div className="pt-6 border-t border-border/40">
                <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">
                    Resources
                </p>
                <div className="space-y-1">
                    <button
                        onClick={() => onNavigate('settings')}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
                            currentView === 'settings'
                                ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <Settings className="h-5 w-5" />
                        Settings
                    </button>
                </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-2xl border border-border/40">
                <h4 className="text-xs font-bold mb-1">Status</h4>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    System Ready
                </div>
            </div>
        </aside>
    );
}
