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
        'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
        'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
        'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
        'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500',
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
    const cleanName = name
        .replace(/\s*\d+\.\d+.*$/, '')
        .replace(/\s*\(.*\)\s*$/, '')
        .replace(/\s*(x64|x86|32-bit|64-bit).*$/i, '');
    const words = cleanName.trim().split(/\s+/);
    if (words.length === 1) {
        return words[0].slice(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * AppIcon Component - Simple and reliable
 * Shows the iconUrl if available, otherwise shows initials
 */
export function AppIcon({ app, size = 'md', className }: AppIconProps) {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Reset state when app changes
    useEffect(() => {
        setHasError(false);
        setIsLoading(true);
    }, [app.id]);

    const handleError = useCallback(() => {
        setHasError(true);
        setIsLoading(false);
    }, []);

    const handleLoad = useCallback(() => {
        setIsLoading(false);
    }, []);

    const sizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-16 w-16',
        lg: 'h-20 w-20',
    };

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-lg',
        lg: 'text-2xl',
    };

    // If no icon URL or image failed to load, show initials
    if (hasError || !app.iconUrl) {
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

    return (
        <div
            className={cn(
                sizeClasses[size],
                'relative bg-white rounded-2xl shadow-md border border-border/10 flex items-center justify-center overflow-hidden',
                className
            )}
        >
            {isLoading && (
                <div className="absolute inset-0 bg-muted/50 animate-pulse" />
            )}
            <img
                src={app.iconUrl}
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
