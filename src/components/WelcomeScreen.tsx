import { Hammer, Package, ArrowRight, Settings2, CloudUpload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePackage } from '@/contexts/PackageContext';

export function WelcomeScreen() {
    const { createNewConfig } = usePackage();

    return (
        <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50" />

            <div className="max-w-xl w-full text-center space-y-8 relative z-10">
                <div className="relative w-24 h-24 mx-auto group">
                    <div className="absolute inset-0 bg-primary rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                    <div className="relative h-full w-full rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-2xl ring-1 ring-white/10">
                        <Hammer className="h-10 w-10 text-white" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                        Welcome to IntuneForge
                    </h2>
                    <p className="text-lg text-muted-foreground/80 max-w-md mx-auto leading-relaxed">
                        The modern way to package and deploy Win32 applications to Microsoft Intune.
                    </p>
                </div>

                <div className="grid gap-4 text-left p-6 glass-card rounded-xl border border-white/5">
                    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors duration-200">
                        <div className="p-2.5 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                            <CloudUpload className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-semibold text-foreground">Upload Your Installer</p>
                            <p className="text-sm text-muted-foreground">Support for .exe and .msi files</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors duration-200">
                        <div className="p-2.5 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                            <Settings2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-semibold text-foreground">Configure & Build</p>
                            <p className="text-sm text-muted-foreground">Smart detection rules and commands</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors duration-200">
                        <div className="p-2.5 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                            <ArrowRight className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-semibold text-foreground">Deploy to Intune</p>
                            <p className="text-sm text-muted-foreground">Direct upload via Graph API</p>
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <Button
                        size="lg"
                        onClick={createNewConfig}
                        className="h-12 px-8 gap-2 text-base rounded-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/25 transition-all active:scale-95"
                    >
                        <Package className="h-5 w-5" />
                        Create Your First Package
                    </Button>
                </div>
            </div>
        </div>
    );
}
