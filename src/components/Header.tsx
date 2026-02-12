import { useState } from 'react';
import { Hammer, Settings, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { SettingsDialog } from '@/components/SettingsDialog';

interface HeaderProps {
    onOpenSettings?: () => void;
    settingsOpen?: boolean;
    onSettingsOpenChange?: (open: boolean) => void;
}

export function Header({ onOpenSettings, settingsOpen: propsSettingsOpen, onSettingsOpenChange }: HeaderProps) {
    const { isAuthenticated, account, logout, clientId, tenantId } = useAuth();
    const [internalSettingsOpen, setInternalSettingsOpen] = useState(false);
    const [showSetupCue, setShowSetupCue] = useState(false);

    const settingsOpen = propsSettingsOpen !== undefined ? propsSettingsOpen : internalSettingsOpen;
    const setSettingsOpen = onSettingsOpenChange || setInternalSettingsOpen;

    // Check if visual cue should be shown
    useState(() => {
        const isDismissed = localStorage.getItem('settings-cue-dismissed') === 'true';
        const isSetup = !!clientId && !!tenantId;

        if (!isSetup && !isDismissed) {
            // Small delay to ensure it catches the eye after load
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

                    <div className="relative">
                        {showSetupCue && (
                            <div className="absolute top-12 right-0 w-64 p-4 rounded-xl bg-popover border border-border shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
                                <div className="absolute -top-1.5 right-3 w-3 h-3 bg-popover border-t border-l border-border rotate-45" />
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
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`transition-all duration-300 relative ${showSetupCue ? 'animate-bounce border-primary/50 text-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'hover:rotate-90 active:scale-95'
                                        }`}
                                >
                                    <Settings className="h-5 w-5" />
                                    {showSetupCue && (
                                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full animate-ping" />
                                    )}
                                </Button>
                            }
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}
