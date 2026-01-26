import { useState } from 'react';
import { Hammer, Settings, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { SettingsDialog } from '@/components/SettingsDialog';

export function Header() {
    const { isAuthenticated, account, logout } = useAuth();
    const [settingsOpen, setSettingsOpen] = useState(false);

    return (
        <header className="glass sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                        <Hammer className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground tracking-tight">
                            IntuneForge
                        </h1>
                        <p className="text-xs text-muted-foreground font-medium">Win32 App Packager</p>
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

                    <SettingsDialog
                        open={settingsOpen}
                        onOpenChange={setSettingsOpen}
                        trigger={
                            <Button
                                variant="ghost"
                                size="icon"
                                className="transition-transform active:scale-95 hover:rotate-90 duration-300"
                            >
                                <Settings className="h-5 w-5" />
                            </Button>
                        }
                    />
                </div>
            </div>
        </header>
    );
}
