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
    iconUrl?: string;

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

    // Global Options (Patch My PC style)
    closeAppBeforeInstall?: boolean;
    skipIfRunning?: boolean;
    notes?: string;

    // Scripts
    preInstallScript?: string;
    postInstallScript?: string;

    // Requirements
    requirements?: PackageRequirements;
}

export interface PackageRequirements {
    architecture: 'x86' | 'x64' | 'both';
    minimumOs: string;
    diskSpaceMB?: number;
    memoryMB?: number;
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
        iconUrl: '',
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
        closeAppBeforeInstall: false,
        skipIfRunning: false,
        notes: '',
        preInstallScript: '',
        postInstallScript: '',
        requirements: {
            architecture: 'both',
            minimumOs: 'Windows 10 1607',
            diskSpaceMB: 0,
            memoryMB: 0
        }
    };
}

/**
 * Storage key for saved configurations
 */
const STORAGE_KEY = 'intuneforge-configs';
const AUTH_STORAGE_KEY = 'intuneforge-auth';
const TEMPLATE_STORAGE_KEY = 'intuneforge-templates';

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
 * Saves templates to localStorage
 */
export function saveTemplates(templates: PackageConfig[]): void {
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
}

/**
 * Loads templates from localStorage
 */
export function loadTemplates(): PackageConfig[] {
    const data = localStorage.getItem(TEMPLATE_STORAGE_KEY);
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

/**
 * Syncs detection rules with the application version
 */
export function syncDetectionRulesWithVersion(rules: DetectionRule[], version: string): DetectionRule[] {
    if (!version || version === 'Latest') return rules;

    // Clean version string (remove 'v' prefix if present)
    const cleanVersion = version.startsWith('v') ? version.substring(1) : version;

    return rules.map(rule => {
        const updated = { ...rule };

        switch (updated.type) {
            case 'msi':
                // For MSI, we usually want to set the product version if it's missing or update it
                updated.productVersion = cleanVersion;
                updated.productVersionOperator = updated.productVersionOperator || 'greaterThanOrEqual';
                break;
            case 'file':
                // If it's a version-based file rule, update the expected value
                if (updated.detectionType === 'version') {
                    updated.expectedValue = cleanVersion;
                    updated.operator = updated.operator || 'greaterThanOrEqual';
                }
                break;
            case 'registry':
                // If it's a value-based registry rule that looks like a version check
                if (['equals', 'greaterThan', 'greaterThanOrEqual'].includes(updated.operator)) {
                    updated.expectedValue = cleanVersion;
                }
                break;
            case 'script':
                // For scripts, we can try to replace a version variable if it follows a common pattern
                if (updated.scriptContent.includes('$targetVersion = [version]"1.0.0"')) {
                    updated.scriptContent = updated.scriptContent.replace(
                        '$targetVersion = [version]"1.0.0"',
                        `$targetVersion = [version]"${cleanVersion}"`
                    );
                }
                break;
        }

        return updated as DetectionRule;
    });
}
