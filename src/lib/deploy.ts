/**
 * Intune Deployment Orchestrator
 */

import {
    createWin32App,
    createContentVersion,
    createContentFile,
    waitForStorageUri,
    uploadToAzureStorage,
    commitFile,
    waitForCommit,
    updateAppContentVersion,
    createAppAssignment,
    mapDetectionRules,
    type Win32AppDeploymentStage,
    type Win32AppCreateRequest
} from './graph-api';
import { type PackageConfig, defaultReturnCodes } from './package-config';
import { type IntuneWinMetadata } from './intunewin';

export interface DeployOptions {
    accessToken: string;
    config: PackageConfig;
    intunewinBlob: Blob; // Kept for reference or download if needed, but not for upload
    encryptedPayload: Blob; // Added: The actual file to upload
    metadata: IntuneWinMetadata;
    onProgress?: (stage: Win32AppDeploymentStage, progress: number) => void;
}

/**
 * Orchestrates the full Win32 app deployment process to Intune
 */
export async function deployToIntune({
    accessToken,
    config,
    encryptedPayload,
    metadata,
    onProgress
}: DeployOptions): Promise<string> {
    try {
        // 1. Create the App metadata entry
        onProgress?.('creating_app', 0);
        const appPayload: Win32AppCreateRequest = {
            '@odata.type': '#microsoft.graph.win32LobApp',
            displayName: config.displayName,
            description: config.description || config.displayName,
            publisher: config.publisher,
            fileName: `${config.setupFileName}.intunewin`,
            setupFilePath: config.setupFileName,
            installCommandLine: config.installCommandLine,
            uninstallCommandLine: config.uninstallCommandLine,
            installExperience: {
                '@odata.type': 'microsoft.graph.win32LobAppInstallExperience',
                runAsAccount: config.installBehavior,
                deviceRestartBehavior: config.restartBehavior,
            },
            rules: mapDetectionRules(config.detectionRules),
            returnCodes: defaultReturnCodes,
            applicableArchitectures: 'x86,x64',
            minimumSupportedWindowsRelease: '1607',
        };

        const appResponse = await createWin32App(accessToken, appPayload);
        const appId = appResponse.id;

        // 2. Create Content Version
        onProgress?.('creating_content', 10);
        const contentVersion = await createContentVersion(accessToken, appId);
        const contentVersionId = contentVersion.id;

        // 3. Create Content File
        onProgress?.('creating_file', 20);
        const contentFile = await createContentFile(
            accessToken,
            appId,
            contentVersionId,
            `${config.setupFileName}.intunewin`,
            metadata.applicationInfo.unencryptedContentSize,
            encryptedPayload.size // Use the size of the RAW encrypted file
        );
        const fileId = contentFile.id;

        // 4. Wait for Azure Storage URI
        onProgress?.('getting_storage_uri', 30);
        const storageUri = await waitForStorageUri(accessToken, appId, contentVersionId, fileId);

        // 5. Upload to Azure Storage
        onProgress?.('uploading', 40);
        console.log(`[Deploy] Uploading encrypted payload. Size: ${encryptedPayload.size}, Type: ${encryptedPayload.type}`);

        await uploadToAzureStorage(storageUri, encryptedPayload, (progress) => {
            onProgress?.('uploading', 40 + (progress * 0.4)); // Map 0-100 to 40-80
        });

        // 6. Commit the file
        onProgress?.('committing', 80);
        const { encryptionInfo } = metadata.applicationInfo;

        console.log('[Deploy] Committing file with metadata:', {
            unencryptedContentSize: metadata.applicationInfo.unencryptedContentSize,
            encryptedPayloadSize: encryptedPayload.size,
            encryptionInfo
        });

        await commitFile(accessToken, appId, contentVersionId, fileId, {
            encryptionKey: encryptionInfo.encryptionKey,
            macKey: encryptionInfo.macKey,
            initializationVector: encryptionInfo.initializationVector,
            mac: encryptionInfo.mac,
            profileIdentifier: encryptionInfo.profileIdentifier,
            fileDigest: encryptionInfo.fileDigest,
            fileDigestAlgorithm: encryptionInfo.fileDigestAlgorithm,
        });

        // 7. Wait for commit to process
        onProgress?.('waiting_for_commit', 85);
        await waitForCommit(accessToken, appId, contentVersionId, fileId);

        // 8. Finalize the content version
        onProgress?.('finalizing', 90);
        await updateAppContentVersion(accessToken, appId, contentVersionId);

        // 9. Create Assignments if any
        if (config.assignments.length > 0) {
            onProgress?.('assigning', 95);
            for (const assignment of config.assignments) {
                const target: {
                    '@odata.type': string;
                    groupId?: string;
                } = {
                    '@odata.type': assignment.target === 'all-users'
                        ? '#microsoft.graph.allLicensedUsersAssignmentTarget'
                        : assignment.target === 'all-devices'
                            ? '#microsoft.graph.allDevicesAssignmentTarget'
                            : '#microsoft.graph.groupAssignmentTarget',
                };

                if (assignment.target === 'group' && assignment.groupId) {
                    target.groupId = assignment.groupId;
                }

                await createAppAssignment(accessToken, appId, {
                    target,
                    intent: assignment.intent,
                    settings: {
                        '@odata.type': '#microsoft.graph.win32LobAppAssignmentSettings',
                        notifications: assignment.notifications,
                    },
                });
            }
        }

        onProgress?.('complete', 100);
        return appId;

    } catch (error) {
        onProgress?.('error', 0);
        throw error;
    }
}
