/**
 * IntuneWin Package Creator
 * 
 * This module creates .intunewin packages compatible with Microsoft Intune.
 * The format is:
 * 1. Inner ZIP containing the source files
 * 2. AES-256 encryption of the inner ZIP
 * 3. Outer ZIP containing:
 *    - IntuneWinPackage/Contents/<encrypted file>
 *    - IntuneWinPackage/Metadata/Detection.xml
 */

import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';

export interface PackageInfo {
    name: string;
    version: string;
    publisher: string;
    setupFile: string;
    file: File;
}

export interface PackageResult {
    intunewinBlob: Blob;
    encryptedPayload: Blob;
    metadata: IntuneWinMetadata;
}

export interface IntuneWinMetadata {
    applicationInfo: {
        name: string;
        unencryptedContentSize: number;
        fileName: string;
        setupFile: string;
        encryptionInfo: {
            encryptionKey: string;
            macKey: string;
            initializationVector: string;
            mac: string;
            profileIdentifier: string;
            fileDigest: string;
            fileDigestAlgorithm: string;
        };
    };
}

/**
 * Generates cryptographically secure random bytes
 */
async function generateRandomBytes(length: number): Promise<Uint8Array> {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
}

/**
 * Converts bytes to base64 string using browser-native methods
 */
function bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Computes SHA-256 hash of data
 */
async function computeSHA256(data: BufferSource): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return bytesToBase64(new Uint8Array(hashBuffer));
}

/**
 * Computes HMAC-SHA256 of data
 */
async function computeHMAC(key: Uint8Array, data: BufferSource): Promise<{ base64: string; bytes: Uint8Array }> {
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key as any,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
    const signatureBytes = new Uint8Array(signature);
    return {
        base64: bytesToBase64(signatureBytes),
        bytes: signatureBytes
    };
}

/**
 * Encrypts data using AES-256-CBC
 */
async function encryptAES256CBC(
    data: BufferSource,
    key: Uint8Array,
    iv: Uint8Array
): Promise<ArrayBuffer> {
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key as any,
        { name: 'AES-CBC' },
        false,
        ['encrypt']
    );

    return await crypto.subtle.encrypt(
        { name: 'AES-CBC', iv: iv as any },
        cryptoKey,
        data
    );
}

/**
 * Generates the Detection.xml metadata file content
 */
function generateDetectionXml(metadata: IntuneWinMetadata): string {
    const { applicationInfo } = metadata;
    const { encryptionInfo } = applicationInfo;

    // Updated ToolVersion to match newer standards
    return `<?xml version="1.0" encoding="utf-8"?>
<ApplicationInfo xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ToolVersion="1.8.5.0">
  <Name>${escapeXml(applicationInfo.name)}</Name>
  <UnencryptedContentSize>${applicationInfo.unencryptedContentSize}</UnencryptedContentSize>
  <FileName>${escapeXml(applicationInfo.fileName)}</FileName>
  <SetupFile>${escapeXml(applicationInfo.setupFile)}</SetupFile>
  <EncryptionInfo>
    <EncryptionKey>${encryptionInfo.encryptionKey}</EncryptionKey>
    <MacKey>${encryptionInfo.macKey}</MacKey>
    <InitializationVector>${encryptionInfo.initializationVector}</InitializationVector>
    <Mac>${encryptionInfo.mac}</Mac>
    <ProfileIdentifier>ProfileVersion1</ProfileIdentifier>
    <FileDigest>${encryptionInfo.fileDigest}</FileDigest>
    <FileDigestAlgorithm>SHA256</FileDigestAlgorithm>
  </EncryptionInfo>
</ApplicationInfo>`;
}

/**
 * Escapes special XML characters
 */
function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}


/**
 * Creates an .intunewin package from a source file
 */
export async function createIntuneWinPackage(
    packageInfo: PackageInfo,
    onProgress?: (stage: string, progress: number) => void
): Promise<PackageResult> {
    onProgress?.('Reading file...', 0);

    // Read the source file
    const fileBuffer = await packageInfo.file.arrayBuffer();
    const fileBytes = new Uint8Array(fileBuffer);

    onProgress?.('Creating inner ZIP...', 10);

    // Create the inner ZIP containing the source file
    const innerZip = new JSZip();
    innerZip.file(packageInfo.setupFile, fileBytes, { compression: 'DEFLATE' });

    const innerZipBlob = await innerZip.generateAsync({
        type: 'arraybuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 }
    });

    const unencryptedContentSize = innerZipBlob.byteLength;

    onProgress?.('Generating encryption keys...', 30);

    // Generate encryption keys (AES-256 = 32 bytes)
    const encryptionKey = await generateRandomBytes(32);
    const macKey = await generateRandomBytes(32);
    const iv = await generateRandomBytes(16);

    onProgress?.('Encrypting content...', 50);

    // Encrypt the inner ZIP
    const encryptedContent = await encryptAES256CBC(innerZipBlob, encryptionKey, iv);

    // Compute digest of UNENCRYPTED content (the Zip)
    const fileDigest = await computeSHA256(innerZipBlob);

    onProgress?.('Creating package structure...', 80);

    // Create the encrypted file with IV prepended (Payload logic layer 1)
    // Structure: [IV (16 bytes)] [Ciphertext (N bytes)]
    const ivCombinedPayload = new Uint8Array(iv.length + encryptedContent.byteLength);
    ivCombinedPayload.set(iv, 0);
    ivCombinedPayload.set(new Uint8Array(encryptedContent), iv.length);

    onProgress?.('Computing HMAC...', 85);

    // The MAC is computed over [IV + Ciphertext]
    const macResult = await computeHMAC(macKey, ivCombinedPayload);

    // Create the FINAL encrypted file with MAC prepended (Payload logic layer 2)
    // Structure: [MAC (32 bytes)] [IV (16 bytes)] [Ciphertext (N bytes)]
    // This matches the official Microsoft structure.
    const finalEncryptedPayload = new Uint8Array(macResult.bytes.length + ivCombinedPayload.length);
    finalEncryptedPayload.set(macResult.bytes, 0);
    finalEncryptedPayload.set(ivCombinedPayload, macResult.bytes.length);

    // Generate metadata
    const encryptedFileName = `${uuidv4()}.bin`;

    const metadata: IntuneWinMetadata = {
        applicationInfo: {
            name: packageInfo.name,
            unencryptedContentSize,
            fileName: encryptedFileName,
            setupFile: packageInfo.setupFile,
            encryptionInfo: {
                encryptionKey: bytesToBase64(encryptionKey),
                macKey: bytesToBase64(macKey),
                initializationVector: bytesToBase64(iv),
                mac: macResult.base64,
                profileIdentifier: 'ProfileVersion1',
                fileDigest,
                fileDigestAlgorithm: 'SHA256'
            }
        }
    };

    onProgress?.('Building .intunewin file...', 90);

    // Create the outer ZIP (the actual .intunewin file)
    const outerZip = new JSZip();
    const contentsFolder = outerZip.folder('IntuneWinPackage/Contents');
    const metadataFolder = outerZip.folder('IntuneWinPackage/Metadata');

    contentsFolder?.file(encryptedFileName, finalEncryptedPayload);
    metadataFolder?.file('Detection.xml', generateDetectionXml(metadata));

    const intunewinBlob = await outerZip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 }
    });

    onProgress?.('Complete!', 100);

    // Debug logging for encryption details
    console.log('[IntuneWin] Created package:', {
        unencryptedSize: unencryptedContentSize,
        finalPayloadSize: finalEncryptedPayload.byteLength,
        ivLength: iv.length,
        macLength: macResult.bytes.length,
        mac: macResult.base64,
        iv: bytesToBase64(iv).substring(0, 10) + '...'
    });

    return {
        intunewinBlob,
        // MAC FORMAT STRATEGY:
        // Inner Zip: DEFLATE
        // Payload: MAC (32) + IV (16) + Cipher
        // This MUST match the full structure found in valid packages.
        encryptedPayload: new Blob([finalEncryptedPayload]),
        metadata
    };
}

/**
 * Triggers a download of the .intunewin file
 */
export function downloadIntuneWin(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.intunewin') ? filename : `${filename}.intunewin`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
