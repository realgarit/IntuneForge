import { Hammer, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';


export function Header() {
    const { isAuthenticated, account, logout } = useAuth();

    return (
        <header className="glass sticky top-0 z-50 border-b border-white/5 shadow-2xl">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/10 ring-1 ring-white/10">
                        <Hammer className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-foreground tracking-tighter">
                            IntuneForge
                        </h1>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] -mt-1 opacity-70">Win32 App Packager</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {isAuthenticated && (
                        <>
                            <div className="flex items-center gap-2 text-sm bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-foreground font-medium hidden sm:inline">
                                    {account?.username || account?.name}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={logout}
                                className="gap-2 hover:bg-destructive/10 hover:text-destructive transition-colors active:scale-95"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Sign Out</span>
                            </Button>
                        </>
                    )}


                </div>
            </div>
        </header>
    );
}
