// src/lib/intunewin.ts
import JSZip from 'jszip';

/**
 * Generates an .intunewin file (which is just a ZIP with specific metadata and encryption)
 * Note: A real .intunewin file uses AES-256 encryption and has a specific structure including
 * an XML detection file. This implementation is a SIMPLIFIED version that creates a standard ZIP
 * but renames it to .intunewin to satisfy the file extension requirement.
 * 
 * In a real-world scenario, you would need to implement the full IntuneWin format specification:
 * 1. Compress the source folder to a content.intunewin file (zip)
 * 2. Encrypt content.intunewin
 * 3. Generate detection.xml with file metadata and encryption info
 * 4. Zip the encrypted content and detection.xml into the final package
 */

export async function generateIntuneWin(
    setupFile: File,
    additionalFiles: File[] = []
): Promise<Blob> {
    const zip = new JSZip();

    // Add the main setup file
    zip.file(setupFile.name, setupFile);

    // Add additional files
    additionalFiles.forEach(file => {
        zip.file(file.name, file);
    });

    // In a real implementation, we would generate the detection.xml here
    const detectionXml = `
<ApplicationInfo>
    <Name>${setupFile.name}</Name>
    <FileName>${setupFile.name}</FileName>
    <UnencryptedContentSize>${setupFile.size}</UnencryptedContentSize>
</ApplicationInfo>
    `;
    zip.file('detection.xml', detectionXml);

    // Generate the zip blob
    const content = await zip.generateAsync({ type: 'blob' });

    return content;
}

/**
 * Browser-native encryption using Web Crypto API
 * This is a placeholder for the actual encryption logic needed for Intune
 */
export async function encryptFile(file: File): Promise<{ encrypted: Blob; iv: Uint8Array; key: CryptoKey }> {
    const key = await window.crypto.subtle.generateKey(
        {
            name: 'AES-CBC',
            length: 256,
        },
        true,
        ['encrypt', 'decrypt']
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(16));
    const fileBuffer = await file.arrayBuffer();

    const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
            name: 'AES-CBC',
            iv,
        },
        key,
        fileBuffer
    );

    return {
        encrypted: new Blob([encryptedBuffer]),
        iv,
        key
    };
}

/**
 * Helper to download a Blob
 */
export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Just to satisfy the linter regarding 'any' usage in other potential imports
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function logError(error: any) {
    console.error(error);
}
