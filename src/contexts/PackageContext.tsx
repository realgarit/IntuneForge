import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { PackageConfig } from '@/lib/package-config';
import {
    createEmptyPackageConfig,
    saveConfigs,
    loadConfigs
} from '@/lib/package-config';

interface PackageContextType {
    configs: PackageConfig[];
    currentConfig: PackageConfig | null;
    selectedFile: File | null;
    setCurrentConfig: (config: PackageConfig | null) => void;
    updateCurrentConfig: (updates: Partial<PackageConfig>) => void;
    createNewConfig: () => PackageConfig;
    saveCurrentConfig: () => void;
    deleteConfig: (id: string) => void;
    setSelectedFile: (file: File | null) => void;
}

const PackageContext = createContext<PackageContextType | undefined>(undefined);

export function PackageProvider({ children }: { children: React.ReactNode }) {
    const [configs, setConfigs] = useState<PackageConfig[]>([]);
    const [currentConfig, setCurrentConfig] = useState<PackageConfig | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Load saved configs on mount
    useEffect(() => {
        const saved = loadConfigs();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setConfigs(saved);
    }, []);

    // Save configs whenever they change
    useEffect(() => {
        saveConfigs(configs);
    }, [configs]);

    const updateCurrentConfig = useCallback((updates: Partial<PackageConfig>) => {
        if (!currentConfig) return;

        const updated = {
            ...currentConfig,
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        setCurrentConfig(updated);
    }, [currentConfig]);

    const createNewConfig = useCallback(() => {
        const newConfig = createEmptyPackageConfig();
        setCurrentConfig(newConfig);
        setSelectedFile(null);
        return newConfig;
    }, []);

    const saveCurrentConfig = useCallback(() => {
        if (!currentConfig) return;

        setConfigs(prev => {
            const index = prev.findIndex(c => c.id === currentConfig.id);
            if (index >= 0) {
                const updated = [...prev];
                updated[index] = currentConfig;
                return updated;
            }
            return [...prev, currentConfig];
        });
    }, [currentConfig]);

    const deleteConfig = useCallback((id: string) => {
        setConfigs(prev => prev.filter(c => c.id !== id));
        if (currentConfig?.id === id) {
            setCurrentConfig(null);
            setSelectedFile(null);
        }
    }, [currentConfig]);

    return (
        <PackageContext.Provider
            value={{
                configs,
                currentConfig,
                selectedFile,
                setCurrentConfig,
                updateCurrentConfig,
                createNewConfig,
                saveCurrentConfig,
                deleteConfig,
                setSelectedFile,
            }}
        >
            {children}
        </PackageContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePackage() {
    const context = useContext(PackageContext);
    if (context === undefined) {
        throw new Error('usePackage must be used within a PackageProvider');
    }
    return context;
}
