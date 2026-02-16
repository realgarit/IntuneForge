import { useState, useCallback, useEffect } from 'react';
import { Hammer } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CatalogApp } from '@/lib/app-catalog';

interface AppIconProps {
    app: CatalogApp;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * Generates a consistent color based on the app name
 */
function getAppColor(name: string): string {
    const colors = [
        'bg-red-500',
        'bg-orange-500',
        'bg-amber-500',
        'bg-yellow-500',
        'bg-lime-500',
        'bg-green-500',
        'bg-emerald-500',
        'bg-teal-500',
        'bg-cyan-500',
        'bg-sky-500',
        'bg-blue-500',
        'bg-indigo-500',
        'bg-violet-500',
        'bg-purple-500',
        'bg-fuchsia-500',
        'bg-pink-500',
        'bg-rose-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

/**
 * Extracts initials from app name (up to 2 characters)
 */
function getInitials(name: string): string {
    // Remove version numbers and common suffixes
    const cleanName = name
        .replace(/\s*\d+\.\d+.*$/, '') // Remove version like "1.2.3"
        .replace(/\s*\(.*\)\s*$/, '') // Remove parentheses
        .replace(/\s*(x64|x86|32-bit|64-bit).*$/i, ''); // Remove architecture

    const words = cleanName.trim().split(/\s+/);
    if (words.length === 1) {
        return words[0].slice(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Generates a DuckDuckGo favicon URL from a download URL
 */
function getDuckDuckGoFavicon(url: string): string | null {
    try {
        const domain = new URL(url).hostname;
        return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    } catch {
        return null;
    }
}

/**
 * AppIcon Component
 * 
 * A self-contained icon component that handles its own error state.
 * This prevents the "switching around" bug caused by shared state in the parent component.
 * 
 * Fallback chain:
 * 1. Original iconUrl from app catalog
 * 2. DuckDuckGo favicon service (extracted from downloadUrl domain)
 * 3. Generated initials avatar with consistent color
 */
export function AppIcon({ app, size = 'md', className }: AppIconProps) {
    const [currentSrcIndex, setCurrentSrcIndex] = useState(0);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Build the fallback chain
    const iconSources: string[] = [];
    
    // Primary: Original iconUrl
    if (app.iconUrl) {
        iconSources.push(app.iconUrl);
    }
    
    // Fallback 1: DuckDuckGo favicon from download URL domain
    const ddgoFavicon = getDuckDuckGoFavicon(app.downloadUrl);
    if (ddgoFavicon && !iconSources.includes(ddgoFavicon)) {
        iconSources.push(ddgoFavicon);
    }

    // Reset state when app changes
    useEffect(() => {
        setCurrentSrcIndex(0);
        setHasError(false);
        setIsLoading(true);
    }, [app.id]);

    const handleError = useCallback(() => {
        if (currentSrcIndex < iconSources.length - 1) {
            // Try next fallback
            setCurrentSrcIndex(prev => prev + 1);
        } else {
            // All fallbacks exhausted
            setHasError(true);
            setIsLoading(false);
        }
    }, [currentSrcIndex, iconSources.length]);

    const handleLoad = useCallback(() => {
        setIsLoading(false);
    }, []);

    const sizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-16 w-16',
        lg: 'h-20 w-20',
    };

    const iconSizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-10 w-10',
    };

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-lg',
        lg: 'text-2xl',
    };

    // If no icon sources or all failed, show initials avatar
    if (hasError || iconSources.length === 0) {
        const bgColor = getAppColor(app.name);
        const initials = getInitials(app.name);

        return (
            <div
                className={cn(
                    sizeClasses[size],
                    'rounded-2xl flex items-center justify-center shadow-md border-2 border-white/20',
                    bgColor,
                    className
                )}
                title={app.name}
            >
                <span className={cn(
                    textSizeClasses[size],
                    'font-black text-white tracking-tight select-none'
                )}>
                    {initials}
                </span>
            </div>
        );
    }

    const currentSrc = iconSources[currentSrcIndex];

    return (
        <div
            className={cn(
                sizeClasses[size],
                'relative bg-white rounded-2xl shadow-md border border-border/10 flex items-center justify-center overflow-hidden',
                className
            )}
        >
            {/* Loading placeholder */}
            {isLoading && (
                <div className="absolute inset-0 bg-muted/50 animate-pulse" />
            )}
            
            {/* Icon image */}
            <img
                src={currentSrc}
                alt=""
                className={cn(
                    'h-full w-full object-contain p-2 transition-opacity duration-200',
                    isLoading ? 'opacity-0' : 'opacity-100'
                )}
                onError={handleError}
                onLoad={handleLoad}
            />
        </div>
    );
}

/**
 * Simple fallback icon component for table view (smaller, no initials)
 */
export function AppIconSimple({ app, className }: { app: CatalogApp; className?: string }) {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setHasError(false);
        setIsLoading(true);
    }, [app.id]);

    if (hasError || !app.iconUrl) {
        return (
            <div className={cn(
                'h-8 w-8 bg-secondary/50 rounded-lg flex items-center justify-center border border-border/40',
                className
            )}>
                <Hammer className="h-4 w-4 text-muted-foreground/40" />
            </div>
        );
    }

    return (
        <div className={cn(
            'h-8 w-8 bg-white rounded-lg border p-1 flex items-center justify-center overflow-hidden',
            className
        )}>
            {isLoading && <div className="absolute inset-0 bg-muted/30 animate-pulse" />}
            <img
                src={app.iconUrl}
                alt=""
                className={cn(
                    'h-full w-full object-contain transition-opacity duration-200',
                    isLoading ? 'opacity-0' : 'opacity-100'
                )}
                onError={() => setHasError(true)}
                onLoad={() => setIsLoading(false)}
            />
        </div>
    );
}
