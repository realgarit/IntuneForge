/**
 * Package Configuration Types and Storage
 */

export type PackageType = 'EXE' | 'MSI';
export type DetectionRuleType = 'registry' | 'file' | 'script' | 'msi';
export type AssignmentTarget = 'all-users' | 'all-devices' | 'group';

export interface RegistryDetectionRule {
    type: 'registry';
    keyPath: string;
    valueName: string;
    operator: 'exists' | 'notExists' | 'equals' | 'notEquals' | 'greaterThan' | 'lessThan';
    expectedValue?: string;
    check32BitOn64System: boolean;
}

export interface FileDetectionRule {
    type: 'file';
    path: string;
    fileOrFolderName: string;
    detectionType: 'exists' | 'notExists' | 'version' | 'size' | 'dateModified';
    operator?: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan';
    expectedValue?: string;
    check32BitOn64System: boolean;
}

export interface ScriptDetectionRule {
    type: 'script';
    scriptContent: string;
    enforceSignatureCheck: boolean;
    runAs32Bit: boolean;
}

export interface MsiDetectionRule {
    type: 'msi';
    productCode: string;
    productVersion?: string;
    productVersionOperator?: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'greaterThanOrEqual' | 'lessThanOrEqual';
}

export type DetectionRule = RegistryDetectionRule | FileDetectionRule | ScriptDetectionRule | MsiDetectionRule;

export interface PackageAssignment {
    target: AssignmentTarget;
    groupId?: string;
    groupName?: string;
    intent: 'required' | 'available' | 'uninstall';
    notifications: 'showAll' | 'showReboot' | 'hideAll';
}

export interface PackageConfig {
    id: string;
    name: string;
    displayName: string;
    publisher: string;
    version: string;
    description: string;
    packageType: PackageType;

    // Source
    sourceType: 'local' | 'url';
    sourceUrl?: string;
    setupFileName: string;

    // Install/Uninstall
    installCommandLine: string;
    uninstallCommandLine: string;
    installBehavior: 'system' | 'user';
    restartBehavior: 'suppress' | 'allow' | 'force';

    // Detection
    detectionRules: DetectionRule[];

    // Assignment
    assignments: PackageAssignment[];

    // Metadata
    createdAt: string;
    updatedAt: string;
}

/**
 * Default return codes for Win32 apps
 */
export const defaultReturnCodes = [
    { returnCode: 0, type: 'success' as const },
    { returnCode: 1707, type: 'success' as const },
    { returnCode: 3010, type: 'softReboot' as const },
    { returnCode: 1641, type: 'hardReboot' as const },
    { returnCode: 1618, type: 'retry' as const },
];

/**
 * Creates a new empty package configuration
 */
export function createEmptyPackageConfig(): PackageConfig {
    return {
        id: crypto.randomUUID(),
        name: '',
        displayName: '',
        publisher: '',
        version: '1.0.0',
        description: '',
        packageType: 'EXE',
        sourceType: 'local',
        setupFileName: '',
        installCommandLine: '',
        uninstallCommandLine: '',
        installBehavior: 'system',
        restartBehavior: 'suppress',
        detectionRules: [],
        assignments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

/**
 * Storage key for saved configurations
 */
const STORAGE_KEY = 'intuneforge-configs';
const AUTH_STORAGE_KEY = 'intuneforge-auth';

/**
 * Saves package configurations to localStorage
 */
export function saveConfigs(configs: PackageConfig[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}

/**
 * Loads package configurations from localStorage
 */
export function loadConfigs(): PackageConfig[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    try {
        return JSON.parse(data);
    } catch {
        return [];
    }
}

/**
 * Exports configurations as JSON file
 */
export function exportConfig(config: PackageConfig): void {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name || 'package'}-config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Imports a configuration from JSON file
 */
export async function importConfig(file: File): Promise<PackageConfig> {
    const text = await file.text();
    const config = JSON.parse(text) as PackageConfig;

    // Generate new ID to avoid conflicts
    config.id = crypto.randomUUID();
    config.updatedAt = new Date().toISOString();

    return config;
}

/**
 * Auth configuration storage
 */
export interface AuthConfig {
    clientId: string;
    tenantId?: string;
}

export function saveAuthConfig(config: AuthConfig): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(config));
}

export function loadAuthConfig(): AuthConfig | null {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!data) return null;

    try {
        return JSON.parse(data);
    } catch {
        return null;
    }
}

export function clearAuthConfig(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
}
