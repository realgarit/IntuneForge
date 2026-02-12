import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { PackageConfig } from '@/lib/package-config';
import {
    createEmptyPackageConfig,
    saveConfigs,
    loadConfigs,
    saveTemplates,
    loadTemplates
} from '@/lib/package-config';

interface PackageContextType {
    configs: PackageConfig[];
    templates: PackageConfig[];
    currentConfig: PackageConfig | null;
    selectedFile: File | null;
    additionalFiles: File[];
    setCurrentConfig: (config: PackageConfig | null) => void;
    updateCurrentConfig: (updates: Partial<PackageConfig>) => void;
    createNewConfig: () => PackageConfig;
    saveCurrentConfig: () => void;
    addConfigs: (configs: PackageConfig[]) => void;
    deleteConfig: (id: string) => void;
    setSelectedFile: (file: File | null) => void;
    setAdditionalFiles: (files: File[]) => void;
    saveAsTemplate: (config: PackageConfig) => void;
    deleteTemplate: (id: string) => void;
}

const PackageContext = createContext<PackageContextType | undefined>(undefined);

export function PackageProvider({ children }: { children: React.ReactNode }) {
    const [configs, setConfigs] = useState<PackageConfig[]>(() => loadConfigs());
    const [templates, setTemplates] = useState<PackageConfig[]>(() => loadTemplates());
    const [currentConfig, setCurrentConfig] = useState<PackageConfig | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);

    // Save configs whenever they change
    useEffect(() => {
        saveConfigs(configs);
    }, [configs]);

    // Save templates whenever they change
    useEffect(() => {
        saveTemplates(templates);
    }, [templates]);

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
        setAdditionalFiles([]);
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

    const addConfigs = useCallback((newConfigs: PackageConfig[]) => {
        setConfigs(prev => [...prev, ...newConfigs]);
    }, []);

    const deleteConfig = useCallback((id: string) => {
        setConfigs(prev => prev.filter(c => c.id !== id));
        if (currentConfig?.id === id) {
            setCurrentConfig(null);
            setSelectedFile(null);
            setAdditionalFiles([]);
        }
    }, [currentConfig]);

    const saveAsTemplate = useCallback((config: PackageConfig) => {
        const template = {
            ...config,
            id: crypto.randomUUID(),
            name: `${config.name} (Template)`,
            updatedAt: new Date().toISOString(),
        };
        setTemplates(prev => [...prev, template]);
    }, []);

    const deleteTemplate = useCallback((id: string) => {
        setTemplates(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <PackageContext.Provider
            value={{
                configs,
                templates,
                currentConfig,
                selectedFile,
                additionalFiles,
                setCurrentConfig,
                updateCurrentConfig,
                createNewConfig,
                saveCurrentConfig,
                addConfigs,
                deleteConfig,
                setSelectedFile,
                setAdditionalFiles,
                saveAsTemplate,
                deleteTemplate,
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
