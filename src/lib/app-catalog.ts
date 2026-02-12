import type { DetectionRule } from './package-config';

export interface AppCustomization {
    id: string;
    label: string;
    description?: string;
    arg: string;
}

export interface CatalogApp {
    id: string;
    name: string;
    publisher: string;
    description: string;
    version: string;
    category: string;
    downloadUrl: string;
    filename: string;
    installCommand: string;
    uninstallCommand: string;
    detectionRules: DetectionRule[];
    customizations?: AppCustomization[];
}

export const APP_CATALOG: CatalogApp[] = [
    {
        id: '7zip',
        name: '7-Zip 23.01 (x64)',
        publisher: 'Igor Pavlov',
        description: '7-Zip is a file archiver with a high compression ratio.',
        version: '23.01',
        category: 'Utilities',
        downloadUrl: 'https://www.7-zip.org/a/7z2301-x64.msi',
        filename: '7z2301-x64.msi',
        installCommand: 'msiexec /i "7z2301-x64.msi" /q',
        uninstallCommand: 'msiexec /x {23170F69-40C1-2702-2301-000001000000} /q',
        detectionRules: [{
            type: 'msi',
            productCode: '{23170F69-40C1-2702-2301-000001000000}'
        }]
    },
    {
        id: 'firefox',
        name: 'Mozilla Firefox (ESR)',
        publisher: 'Mozilla',
        description: 'Mozilla Firefox is a free and open-source web browser.',
        version: 'Latest',
        category: 'Browsers',
        downloadUrl: 'https://download.mozilla.org/?product=firefox-esr-msi-latest-ssl&os=win64&lang=en-US',
        filename: 'Firefox Setup.msi',
        installCommand: 'msiexec /i "Firefox Setup.msi" /qn',
        uninstallCommand: 'msiexec /x "Firefox Setup.msi" /qn',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles%\\Mozilla Firefox',
            fileOrFolderName: 'firefox.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }],
        customizations: [
            {
                id: 'no-desktop-shortcut',
                label: 'No Desktop Shortcut',
                arg: 'DESKTOP_SHORTCUT=false'
            }
        ]
    },
    {
        id: 'chrome',
        name: 'Google Chrome Enterprise',
        publisher: 'Google',
        description: 'Get the fast, free web browser that you can customize to fit your brand and business.',
        version: 'Latest',
        category: 'Browsers',
        downloadUrl: 'https://dl.google.com/tag/s/appguid%3D%7B8A69D345-D564-463C-AFF1-A69D9E530F96%7D%26iid%3D%7B36C87828-0904-9721-3642-120532594646%7D%26lang%3Den%26browser%3D4%26usagestats%3D0%26appname%3DGoogle%2520Chrome%26needsadmin%3Dprefers%26ap%3Dx64-stable-statsdef_1%26brand%3DGCEB/dl/chrome/install/googlechromestandaloneenterprise64.msi',
        filename: 'googlechromestandaloneenterprise64.msi',
        installCommand: 'msiexec /i "googlechromestandaloneenterprise64.msi" /qn',
        uninstallCommand: 'msiexec /x "googlechromestandaloneenterprise64.msi" /qn',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles%\\Google\\Chrome\\Application',
            fileOrFolderName: 'chrome.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }]
    },
    {
        id: 'npp',
        name: 'Notepad++ 8.6',
        publisher: 'Don Ho',
        description: 'Notepad++ is a free source code editor and Notepad replacement.',
        version: '8.6',
        category: 'Development',
        downloadUrl: 'https://github.com/notepad-plus-plus/notepad-plus-plus/releases/download/v8.6/npp.8.6.Installer.x64.exe',
        filename: 'npp.8.6.Installer.x64.exe',
        installCommand: 'npp.8.6.Installer.x64.exe /S',
        uninstallCommand: '%ProgramFiles%\\Notepad++\\uninstall.exe /S',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles%\\Notepad++',
            fileOrFolderName: 'notepad++.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }]
    },
    {
        id: 'vlc',
        name: 'VLC Media Player 3.0.20',
        publisher: 'VideoLAN',
        description: 'VLC is a free and open source cross-platform multimedia player.',
        version: '3.0.20',
        category: 'Media',
        downloadUrl: 'https://get.videolan.org/vlc/3.0.20/win64/vlc-3.0.20-win64.exe',
        filename: 'vlc-3.0.20-win64.exe',
        installCommand: 'vlc-3.0.20-win64.exe /L=1033 /S',
        uninstallCommand: '%ProgramFiles%\\VideoLAN\\VLC\\uninstall.exe /S',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles%\\VideoLAN\\VLC',
            fileOrFolderName: 'vlc.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }]
    },
    {
        id: 'zoom',
        name: 'Zoom Workplace',
        publisher: 'Zoom Video Communications',
        description: 'Zoom is a unified communication and collaboration platform.',
        version: 'Latest',
        category: 'Communication',
        downloadUrl: 'https://zoom.us/client/latest/ZoomInstallerFull.msi',
        filename: 'ZoomInstallerFull.msi',
        installCommand: 'msiexec /i "ZoomInstallerFull.msi" /qn /norestart',
        uninstallCommand: 'msiexec /x {ProductCode} /qn', // Note: Needs actual product code or dynamic detection
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles%\\Zoom\\bin',
            fileOrFolderName: 'Zoom.exe',
            detectionType: 'exists',
            check32BitOn64System: true // Zoom is often 32-bit
        }],
        customizations: [
            {
                id: 'disable-auto-update',
                label: 'Disable Auto Update',
                arg: 'ZoomAutoUpdate="false"'
            },
            {
                id: 'no-desktop-icon',
                label: 'No Desktop Icon',
                arg: 'ZConfig="DesktopIcon=0"'
            }
        ]
    },
    {
        id: 'slack',
        name: 'Slack (Machine-Wide)',
        publisher: 'Slack Technologies',
        description: 'Slack is a new way to communicate with your team.',
        version: 'Latest',
        category: 'Communication',
        downloadUrl: 'https://downloads.slack-edge.com/releases/windows/4.36.136/prod/x64/SlackSetup.msi', // This might break if version updates, but for demo it's fine. Ideally use a "latest" endpoint.
        filename: 'SlackSetup.msi',
        installCommand: 'msiexec /i "SlackSetup.msi" /qn /norestart',
        uninstallCommand: 'msiexec /x {ProductCode} /qn',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles%\\Slack',
            fileOrFolderName: 'slack.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }]
    },
    {
        id: 'vscode',
        name: 'Visual Studio Code (System)',
        publisher: 'Microsoft',
        description: 'Code editing. Redefined.',
        version: 'Latest',
        category: 'Development',
        downloadUrl: 'https://code.visualstudio.com/sha/download?build=stable&os=win32-x64', // This redirects to exe
        filename: 'VSCodeUserSetup-x64.exe', // Usually it's an exe
        installCommand: 'VSCodeSetup-x64.exe /VERYSILENT /MERGETASKS=!runcode',
        uninstallCommand: '%ProgramFiles%\\Microsoft VS Code\\unins000.exe /VERYSILENT',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles%\\Microsoft VS Code',
            fileOrFolderName: 'Code.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }],
        customizations: [
            {
                id: 'add-context-menu',
                label: 'Add "Open with Code" to Context Menu',
                arg: '/MERGETASKS="!runcode,desktopicon,quicklaunchicon,addcontextmenufiles,addcontextmenufolders"'
            }
        ]
    },
    {
        id: 'powertoys',
        name: 'Microsoft PowerToys',
        publisher: 'Microsoft',
        description: 'Microsoft PowerToys is a set of utilities for power users to tune and streamline their Windows experience.',
        version: 'Latest',
        category: 'Utilities',
        downloadUrl: 'https://github.com/microsoft/PowerToys/releases/download/v0.79.0/PowerToysSetup-0.79.0-x64.exe', // Hardcoded version for safety
        filename: 'PowerToysSetup.exe',
        installCommand: 'PowerToysSetup.exe /install /quiet /norestart',
        uninstallCommand: '%ProgramFiles%\\PowerToys\\uninstall.exe /quiet',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles%\\PowerToys',
            fileOrFolderName: 'PowerToys.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }]
    },
    {
        id: 'adobe-reader',
        name: 'Adobe Acrobat Reader DC',
        publisher: 'Adobe',
        description: 'The free global standard for reliably viewing, printing, and signing PDF documents.',
        version: 'Latest',
        category: 'Productivity',
        downloadUrl: 'https://ardownload2.adobe.com/pub/adobe/reader/win/AcrobatDC/2300620320/AcroRdrDC2300620320_en_US.exe',
        filename: 'AcroRdrDC.exe',
        installCommand: 'AcroRdrDC.exe /sPB /rs /msi EULA_ACCEPT=YES',
        uninstallCommand: 'msiexec /x {AC76BA86-7AD7-1033-7B44-AC0F074E4100} /qn',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles(x86)%\\Adobe\\Acrobat Reader DC\\Reader',
            fileOrFolderName: 'AcroRd32.exe',
            detectionType: 'exists',
            check32BitOn64System: true
        }]
    }
];
