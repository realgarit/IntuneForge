/**
 * Microsoft Graph API client for Intune operations
 */

import { graphConfig } from './msal-config';
import { type DetectionRule as InternalDetectionRule } from './package-config';

export interface Win32AppCreateRequest {
    '@odata.type': '#microsoft.graph.win32LobApp';
    displayName: string;
    description: string;
    publisher: string;
    fileName: string;
    installCommandLine: string;
    uninstallCommandLine: string;
    installExperience: {
        '@odata.type': 'microsoft.graph.win32LobAppInstallExperience';
        runAsAccount: 'system' | 'user';
        deviceRestartBehavior: 'suppress' | 'allow' | 'force';
    };
    rules: DetectionRule[];
    returnCodes: ReturnCode[];
    msiInformation?: MsiInformation;
    setupFilePath: string;
    applicableArchitectures: string;
    minimumSupportedWindowsRelease: string;
}

export type Win32AppDeploymentStage =
    | 'creating_app'
    | 'creating_content'
    | 'creating_file'
    | 'getting_storage_uri'
    | 'uploading'
    | 'committing'
    | 'waiting_for_commit'
    | 'finalizing'
    | 'assigning'
    | 'complete'
    | 'error';

export interface DetectionRule {
    '@odata.type': string;
    [key: string]: unknown;
}

export interface ReturnCode {
    returnCode: number;
    type: 'success' | 'softReboot' | 'hardReboot' | 'retry' | 'failed';
}

export interface MsiInformation {
    productCode: string;
    productVersion: string;
    publisher: string;
    requiresReboot: boolean;
    upgradeCode?: string;
}

export interface ContentVersion {
    id: string;
}

export interface ContentFile {
    id: string;
    azureStorageUri: string;
    isCommitted: boolean;
}

/**
 * Creates a new Win32 app in Intune
 */
export async function createWin32App(
    accessToken: string,
    app: Win32AppCreateRequest
): Promise<{ id: string }> {
    const response = await fetch(`${graphConfig.baseUrl}${graphConfig.win32Apps}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(app),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create Win32 app: ${error}`);
    }

    return await response.json();
}

/**
 * Creates a content version for the app
 */
export async function createContentVersion(
    accessToken: string,
    appId: string
): Promise<ContentVersion> {
    const response = await fetch(
        `${graphConfig.baseUrl}${graphConfig.win32Apps}/${appId}/microsoft.graph.win32LobApp/contentVersions`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create content version: ${error}`);
    }

    return await response.json();
}

/**
 * Creates a content file entry
 */
export async function createContentFile(
    accessToken: string,
    appId: string,
    contentVersionId: string,
    fileName: string,
    fileSize: number,
    encryptedFileSize: number
): Promise<ContentFile> {
    const response = await fetch(
        `${graphConfig.baseUrl}${graphConfig.win32Apps}/${appId}/microsoft.graph.win32LobApp/contentVersions/${contentVersionId}/files`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                '@odata.type': '#microsoft.graph.mobileAppContentFile',
                name: fileName,
                size: fileSize,
                sizeEncrypted: encryptedFileSize,
                isDependency: false,
            }),
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create content file: ${error}`);
    }

    return await response.json();
}

/**
 * Waits for the Azure Storage URI to be ready
 */
export async function waitForStorageUri(
    accessToken: string,
    appId: string,
    contentVersionId: string,
    fileId: string,
    maxAttempts = 30
): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
        const response = await fetch(
            `${graphConfig.baseUrl}${graphConfig.win32Apps}/${appId}/microsoft.graph.win32LobApp/contentVersions/${contentVersionId}/files/${fileId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to get file info');
        }

        const file: ContentFile = await response.json();

        if (file.azureStorageUri) {
            return file.azureStorageUri;
        }

        // Wait 2 seconds before next attempt
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('Timeout waiting for Azure Storage URI');
}

/**
 * Uploads file content to Azure Storage in blocks
 */
export async function uploadToAzureStorage(
    storageUri: string,
    content: Blob,
    onProgress?: (progress: number) => void
): Promise<string[]> {
    const storageUrl = new URL(storageUri);

    // Unified Proxy Strategy for Vercel & Local
    // We send the full target URL as a query parameter to our proxy endpoint.
    // Vercel: /api/proxy?url=...
    // Local: /api/proxy?url=... (handled by Vite middleware)

    const targetUrl = `${storageUrl.origin}${storageUrl.pathname}${storageUrl.search}`;
    // Unified Proxy Strategy: /api/proxy?url=...

    const BLOCK_SIZE = 4 * 1024 * 1024; // 4MB blocks
    const blockIds: string[] = [];
    const totalBlocks = Math.ceil(content.size / BLOCK_SIZE);

    for (let i = 0; i < totalBlocks; i++) {
        const start = i * BLOCK_SIZE;
        const end = Math.min(start + BLOCK_SIZE, content.size);
        const block = content.slice(start, end);

        const blockId = btoa(String(i).padStart(6, '0'));
        blockIds.push(blockId);

        // Append block parameters to the *target* URL, which is encoded in the 'url' query param
        // Wait, the Vercel proxy expects: /api/proxy?url=FULL_TARGET_URL
        // The target URL for a block needs to be: BASE_SAS_URL + "&comp=block&blockid=..."

        const blockParams = `&comp=block&blockid=${encodeURIComponent(blockId)}`;
        const fullBlockUrl = `${targetUrl}${blockParams}`;

        // Final Proxy URL
        const blockUrl = `/api/proxy?url=${encodeURIComponent(fullBlockUrl)}`;

        const blockResponse = await fetch(blockUrl, {
            method: 'PUT',
            body: block,
        });

        if (!blockResponse.ok) {
            const errorBody = await blockResponse.text();
            console.error('Azure Storage upload failed:', errorBody);
            throw new Error(`Failed to upload block ${i + 1}/${totalBlocks}: ${errorBody}`);
        }

        onProgress?.(Math.round(((i + 1) / totalBlocks) * 100));
    }

    const blockListXml = `<?xml version="1.0" encoding="utf-8"?>
<BlockList>
${blockIds.map(id => `  <Latest>${id}</Latest>`).join('\n')}
</BlockList>`;

    const commitParams = `&comp=blocklist`;
    const fullCommitUrl = `${targetUrl}${commitParams}`;
    const commitUrl = `/api/proxy?url=${encodeURIComponent(fullCommitUrl)}`;

    const commitResponse = await fetch(commitUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/xml',
        },
        body: blockListXml,
    });

    if (!commitResponse.ok) {
        const errorBody = await commitResponse.text();
        console.error('Azure Storage commit failed:', errorBody);
        throw new Error(`Failed to commit blocks: ${errorBody}`);
    }

    return blockIds;
}

/**
 * Commits the file with encryption info
 */
export async function commitFile(
    accessToken: string,
    appId: string,
    contentVersionId: string,
    fileId: string,
    encryptionInfo: {
        encryptionKey: string;
        macKey: string;
        initializationVector: string;
        mac: string;
        profileIdentifier: string;
        fileDigest: string;
        fileDigestAlgorithm: string;
    }
): Promise<void> {
    const response = await fetch(
        `${graphConfig.baseUrl}${graphConfig.win32Apps}/${appId}/microsoft.graph.win32LobApp/contentVersions/${contentVersionId}/files/${fileId}/commit`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileEncryptionInfo: {
                    encryptionKey: encryptionInfo.encryptionKey,
                    macKey: encryptionInfo.macKey,
                    initializationVector: encryptionInfo.initializationVector,
                    mac: encryptionInfo.mac,
                    profileIdentifier: encryptionInfo.profileIdentifier,
                    fileDigest: encryptionInfo.fileDigest,
                    fileDigestAlgorithm: encryptionInfo.fileDigestAlgorithm,
                },
            }),
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to commit file: ${error}`);
    }
}

/**
 * Waits for file to be committed
 */
export async function waitForCommit(
    accessToken: string,
    appId: string,
    contentVersionId: string,
    fileId: string,
    maxAttempts = 60
): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
        const response = await fetch(
            `${graphConfig.baseUrl}${graphConfig.win32Apps}/${appId}/microsoft.graph.win32LobApp/contentVersions/${contentVersionId}/files/${fileId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to get file status');
        }

        const file = await response.json();

        if (file.uploadState === 'commitFileSuccess') {
            return;
        }

        if (file.uploadState === 'commitFileFailed') {
            console.error('Commit failed details:', file);
            throw new Error(`File commit failed. Status: ${JSON.stringify(file)}`);
        }

        // Wait 2 seconds before next attempt
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('Timeout waiting for file commit');
}

/**
 * Updates the app to use the committed content version
 */
export async function updateAppContentVersion(
    accessToken: string,
    appId: string,
    contentVersionId: string
): Promise<void> {
    let lastError;
    // Retry up to 3 times for 500/502/503/504 errors
    for (let attempt = 1; attempt <= 3; attempt++) {
        const response = await fetch(
            `${graphConfig.baseUrl}${graphConfig.win32Apps}/${appId}`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    '@odata.type': '#microsoft.graph.win32LobApp',
                    committedContentVersion: contentVersionId,
                }),
            }
        );

        if (response.ok) {
            return;
        }

        const errorText = await response.text();
        lastError = errorText;

        // If it's a server error (5xx), wait and retry
        if (response.status >= 500 && attempt < 3) {
            console.warn(`Update App failed with ${response.status}. Retrying (Attempt ${attempt}/3)...`);
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential-ish backoff
            continue;
        }

        throw new Error(`Failed to update app (Status ${response.status}): ${errorText}`);
    }

    // If we exit the loop, it means we failed all attempts
    // lastError should be populated
    throw new Error(`Failed to update app after 3 attempts: ${lastError || 'Unknown error'}`);
}

/**
 * Creates an app assignment
 */
export async function createAppAssignment(
    accessToken: string,
    appId: string,
    assignment: {
        target: {
            '@odata.type': string;
            groupId?: string;
        };
        intent: 'required' | 'available' | 'uninstall';
        settings?: {
            '@odata.type': string;
            notifications: 'showAll' | 'showReboot' | 'hideAll';
        };
    }
): Promise<void> {
    const response = await fetch(
        `${graphConfig.baseUrl}${graphConfig.win32Apps}/${appId}/assignments`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(assignment),
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create assignment: ${error}`);
    }
}

/**
 * Gets Azure AD groups for assignment selection
 */
export async function getAzureADGroups(
    accessToken: string,
    search?: string
): Promise<Array<{ id: string; displayName: string }>> {
    let url = 'https://graph.microsoft.com/v1.0/groups?$select=id,displayName&$top=50';

    if (search) {
        url += `&$filter=startswith(displayName,'${encodeURIComponent(search)}')`;
    }

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to get groups');
    }

    const data = await response.json();
    return data.value;
}

/**
 * Maps internal detection rules to Graph API format
 */
export function mapDetectionRules(rules: InternalDetectionRule[]): DetectionRule[] {
    return rules.map(rule => {
        switch (rule.type) {
            case 'msi':
                return {
                    '@odata.type': 'microsoft.graph.win32LobAppProductCodeRule',
                    ruleType: 'detection',
                    productCode: rule.productCode,
                    productVersion: rule.productVersion || null,
                    productVersionOperator: mapOperator(rule.productVersionOperator || 'greaterThanOrEqual'),
                };
            case 'registry': {
                const isExistenceCheck = rule.operator === 'exists' || rule.operator === 'notExists';
                return {
                    '@odata.type': 'microsoft.graph.win32LobAppRegistryRule',
                    ruleType: 'detection',
                    keyPath: rule.keyPath,
                    valueName: rule.valueName,
                    check32BitOn64System: rule.check32BitOn64System,
                    comparisonValue: isExistenceCheck ? null : (rule.expectedValue || null),
                    operationType: rule.operator === 'notExists' ? 'doesNotExist' : (isExistenceCheck ? 'exists' : 'string'),
                    operator: isExistenceCheck ? 'notConfigured' : mapOperator(rule.operator),
                };
            }
            case 'file': {
                const isExistenceCheck = rule.detectionType === 'exists' || rule.detectionType === 'notExists';
                return {
                    '@odata.type': 'microsoft.graph.win32LobAppFileSystemRule',
                    ruleType: 'detection',
                    path: rule.path,
                    fileOrFolderName: rule.fileOrFolderName,
                    check32BitOn64System: rule.check32BitOn64System,
                    operationType: mapFileOperationType(rule.detectionType),
                    operator: isExistenceCheck ? 'notConfigured' : mapOperator(rule.operator || 'equal'),
                    comparisonValue: isExistenceCheck ? null : (rule.expectedValue || null),
                };
            }
            case 'script':
                return {
                    '@odata.type': 'microsoft.graph.win32LobAppPowerShellScriptRule',
                    ruleType: 'detection',
                    scriptContent: btoa(rule.scriptContent),
                    enforceSignatureCheck: rule.enforceSignatureCheck,
                    runAs32Bit: rule.runAs32Bit,
                };
            default:
                // @ts-expect-error - Handle unexpected rule types gracefully
                throw new Error(`Unsupported detection rule type: ${rule.type}`);
        }
    });
}

function mapOperator(op: string): string {
    switch (op) {
        case 'equals': return 'equal';
        case 'notEquals': return 'notEqual';
        case 'greaterThan': return 'greaterThan';
        case 'greaterThanOrEqual': return 'greaterThanOrEqual';
        case 'lessThan': return 'lessThan';
        case 'lessThanOrEqual': return 'lessThanOrEqual';
        default: return op;
    }
}

function mapFileOperationType(type: string): string {
    switch (type) {
        case 'exists': return 'exists';
        case 'notExists': return 'doesNotExist';
        case 'version': return 'version';
        case 'size': return 'sizeInMB';
        case 'dateModified': return 'modifiedDate';
        default: return type;
    }
}
