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
    downloadUrl: string;
    filename: string;
    installCommand: string;
    uninstallCommand: string;
    detectionRules: DetectionRule[];
    category: string;
    customizations?: AppCustomization[];
}

export const APP_CATALOG: CatalogApp[] = [
    {
        id: '7zip',
        name: '7-Zip 23.01 (x64)',
        publisher: 'Igor Pavlov',
        description: '7-Zip is a file archiver with a high compression ratio.',
        version: '23.01',
        downloadUrl: 'https://www.7-zip.org/a/7z2301-x64.msi',
        filename: '7z2301-x64.msi',
        installCommand: 'msiexec /i "7z2301-x64.msi" /q',
        uninstallCommand: 'msiexec /x {23170F69-40C1-2702-2301-000001000000} /q',
        detectionRules: [{
            type: 'msi',
            productCode: '{23170F69-40C1-2702-2301-000001000000}'
        }],
        category: 'Utilities'
    },
    {
        id: 'firefox',
        name: 'Mozilla Firefox (ESR)',
        publisher: 'Mozilla',
        description: 'Mozilla Firefox is a free and open-source web browser.',
        version: 'Latest',
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
        category: 'Browsers',
        customizations: [
            {
                id: 'no-desktop-shortcut',
                label: 'No Desktop Shortcut',
                arg: 'DESKTOP_SHORTCUT=false'
            }
        ]
    },
    {
        id: 'npp',
        name: 'Notepad++ 8.6',
        publisher: 'Don Ho',
        description: 'Notepad++ is a free source code editor and Notepad replacement.',
        version: '8.6',
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
        }],
        category: 'Development'
    },
    {
        id: 'vlc',
        name: 'VLC Media Player 3.0.20',
        publisher: 'VideoLAN',
        description: 'VLC is a free and open source cross-platform multimedia player.',
        version: '3.0.20',
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
        }],
        category: 'Multimedia'
    },
    {
        id: 'chrome',
        name: 'Google Chrome Enterprise',
        publisher: 'Google',
        description: 'Get the fast, free web browser that you can customize to fit your brand and business.',
        version: 'Latest',
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
        }],
        category: 'Browsers'
    },
    {
        id: 'adobe-reader',
        name: 'Adobe Acrobat Reader DC',
        publisher: 'Adobe',
        description: 'View, sign, collaborate on and annotate PDF files with our free Acrobat Reader software.',
        version: 'Latest',
        downloadUrl: 'https://ardownload2.adobe.com/pub/adobe/reader/win/AcrobatDC/2300620320/AcroRdrDC2300620320_en_US.exe',
        filename: 'AcroRdrDC2300620320_en_US.exe',
        installCommand: 'AcroRdrDC2300620320_en_US.exe /sAll /rs /msi EULA_ACCEPT=YES',
        uninstallCommand: 'msiexec /x {AC76BA86-7AD7-1033-7B44-AC0F074E4100} /qn',
        detectionRules: [{
            type: 'msi',
            productCode: '{AC76BA86-7AD7-1033-7B44-AC0F074E4100}'
        }],
        category: 'Productivity'
    },
    {
        id: 'vscode',
        name: 'Microsoft VS Code',
        publisher: 'Microsoft',
        description: 'Visual Studio Code is a code editor redefined and optimized for building and debugging modern web and cloud applications.',
        version: 'Latest',
        downloadUrl: 'https://code.visualstudio.com/sha/download?build=stable&os=win32-x64-user',
        filename: 'VSCodeSetup-x64.exe',
        installCommand: 'VSCodeSetup-x64.exe /verysilent /mergetasks=!runcode',
        uninstallCommand: '%LocalAppData%\\Programs\\Microsoft VS Code\\unins000.exe /verysilent',
        detectionRules: [{
            type: 'file',
            path: '%LocalAppData%\\Programs\\Microsoft VS Code',
            fileOrFolderName: 'Code.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }],
        category: 'Development',
        customizations: [
            {
                id: 'add-context-menu',
                label: 'Add "Open with Code" to Context Menu',
                arg: '/MERGETASKS="!runcode,desktopicon,quicklaunchicon,addcontextmenufiles,addcontextmenufolders"'
            }
        ]
    },
    {
        id: 'zoom',
        name: 'Zoom Client for Meetings',
        publisher: 'Zoom Video Communications',
        description: 'Zoom is the leader in modern enterprise video communications, with an easy, reliable cloud platform for video and audio conferencing.',
        version: 'Latest',
        downloadUrl: 'https://zoom.us/client/latest/ZoomInstallerFull.msi',
        filename: 'ZoomInstallerFull.msi',
        installCommand: 'msiexec /i "ZoomInstallerFull.msi" /qn',
        uninstallCommand: 'msiexec /x {PRODUCT-CODE-GUID} /qn',
        detectionRules: [{
            type: 'msi',
            productCode: '{PRODUCT-CODE-GUID}' // Note: Zoom MSI Product Code changes with versions
        }],
        category: 'Communication',
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
        id: 'git',
        name: 'Git for Windows',
        publisher: 'The Git Project',
        description: 'Git is a free and open source distributed version control system designed to handle everything from small to very large projects with speed and efficiency.',
        version: 'Latest',
        downloadUrl: 'https://github.com/git-for-windows/git/releases/download/v2.43.0.windows.1/Git-2.43.0-64-bit.exe',
        filename: 'Git-2.43.0-64-bit.exe',
        installCommand: 'Git-2.43.0-64-bit.exe /VERYSILENT /NORESTART',
        uninstallCommand: '%ProgramFiles%\\Git\\unins000.exe /VERYSILENT',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles%\\Git',
            fileOrFolderName: 'git-cmd.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }],
        category: 'Development'
    },
    {
        id: 'nodejs',
        name: 'Node.js LTS',
        publisher: 'OpenJS Foundation',
        description: 'Node.js is an open-source, cross-platform JavaScript runtime environment.',
        version: 'Latest LTS',
        downloadUrl: 'https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi',
        filename: 'node-v20.10.0-x64.msi',
        installCommand: 'msiexec /i "node-v20.10.0-x64.msi" /qn',
        uninstallCommand: 'msiexec /x {PRODUCT-CODE} /qn',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles%\\nodejs',
            fileOrFolderName: 'node.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }],
        category: 'Development'
    },
    {
        id: 'slack',
        name: 'Slack',
        publisher: 'Slack Technologies',
        description: 'Slack is a new way to communicate with your team. It is faster, better organized, and more secure than email.',
        version: 'Latest',
        downloadUrl: 'https://slack.com/ssb/download-win64-msi',
        filename: 'slack-standalone-x64.msi',
        installCommand: 'msiexec /i "slack-standalone-x64.msi" /qn',
        uninstallCommand: 'msiexec /x {PRODUCT-CODE} /qn',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles%\\Slack',
            fileOrFolderName: 'slack.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }],
        category: 'Communication'
    },
    {
        id: 'teamviewer',
        name: 'TeamViewer',
        publisher: 'TeamViewer',
        description: 'TeamViewer remote connectivity cloud platform enables you to secure remote access to any device, across platforms, from anywhere, anytime.',
        version: 'Latest',
        downloadUrl: 'https://download.teamviewer.com/download/TeamViewer_Setup_x64.exe',
        filename: 'TeamViewer_Setup_x64.exe',
        installCommand: 'TeamViewer_Setup_x64.exe /S',
        uninstallCommand: '%ProgramFiles%\\TeamViewer\\uninstall.exe /S',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles%\\TeamViewer',
            fileOrFolderName: 'TeamViewer.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }],
        category: 'Utilities'
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
    }
];
