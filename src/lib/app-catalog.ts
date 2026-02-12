import type { DetectionRule } from './package-config';

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
        }]
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
        }]
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
        }]
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
        }]
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
        }]
    }
];
