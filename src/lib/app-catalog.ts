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
    iconUrl?: string;
    installCommand: string;
    uninstallCommand: string;
    detectionRules: DetectionRule[];
    customizations?: AppCustomization[];
}

export const APP_CATALOG: CatalogApp[] = [
    {
        id: '7zip',
        name: '7-Zip 26.00 (x64)',
        publisher: 'Igor Pavlov',
        description: '7-Zip is a file archiver with a high compression ratio.',
        version: '26.00',
        category: 'Utilities',
        downloadUrl: 'https://www.7-zip.org/a/7z2600-x64.msi',
        filename: '7z2600-x64.msi',
        iconUrl: 'https://www.7-zip.org/7ziplogo.png',
        installCommand: 'msiexec /i "7z2600-x64.msi" /q',
        uninstallCommand: 'msiexec /x {23170F69-40C1-2702-2600-000001000000} /q',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles%\\7-Zip',
            fileOrFolderName: '7zFM.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }],
        customizations: [
            {
                id: 'no-desktop-shortcut',
                label: 'No Desktop Shortcut',
                arg: 'INSTALL_DESKTOP_SHORTCUT=0'
            },
            {
                id: 'add-context-menu',
                label: 'Add to Context Menu',
                arg: 'INTEGRATE_SHELL=1'
            }
        ]
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
        iconUrl: 'https://raw.githubusercontent.com/walkxcode/dashboard-icons/master/png/firefox.png',
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
            },
            {
                id: 'close-app',
                label: 'Close app before install',
                description: 'Ensures the application is not running before installation begins.',
                arg: '--kill'
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
        iconUrl: 'https://raw.githubusercontent.com/walkxcode/dashboard-icons/master/png/google-chrome.png',
        installCommand: 'msiexec /i "googlechromestandaloneenterprise64.msi" /qn',
        uninstallCommand: 'msiexec /x "googlechromestandaloneenterprise64.msi" /qn',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles%\\Google\\Chrome\\Application',
            fileOrFolderName: 'chrome.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }],
        customizations: [
            {
                id: 'close-app',
                label: 'Close app before install',
                description: 'Ensures the application is not running before installation begins.',
                arg: '--kill'
            }
        ]
    },
    {
        id: 'npp',
        name: 'Notepad++ 8.9.1',
        publisher: 'Don Ho',
        description: 'Notepad++ is a free source code editor and Notepad replacement.',
        version: '8.9.1',
        category: 'Development',
        downloadUrl: 'https://github.com/notepad-plus-plus/notepad-plus-plus/releases/download/v8.9.1/npp.8.9.1.Installer.x64.exe',
        filename: 'npp.8.9.1.Installer.x64.exe',
        iconUrl: 'https://notepad-plus-plus.org/images/logo.svg',
        installCommand: 'npp.8.9.1.Installer.x64.exe /S',
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
        name: 'VLC Media Player 3.0.21',
        publisher: 'VideoLAN',
        description: 'VLC is a free and open source cross-platform multimedia player.',
        version: '3.0.21',
        category: 'Media',
        downloadUrl: 'https://get.videolan.org/vlc/3.0.21/win64/vlc-3.0.21-win64.exe?direct',
        filename: 'vlc-3.0.21-win64.exe',
        iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/VLC_Icon.svg/120px-VLC_Icon.svg.png',
        installCommand: 'vlc-3.0.21-win64.exe /L=1033 /S',
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
        iconUrl: 'https://raw.githubusercontent.com/homarr-labs/dashboard-icons/main/png/zoom.png',
        installCommand: 'msiexec /i "ZoomInstallerFull.msi" /qn /norestart',
        uninstallCommand: 'msiexec /x {ProductCode} /qn',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles%\\Zoom\\bin',
            fileOrFolderName: 'Zoom.exe',
            detectionType: 'exists',
            check32BitOn64System: true
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
            },
            {
                id: 'close-app',
                label: 'Close app before install',
                description: 'Ensures the application is not running before installation begins.',
                arg: '--kill'
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
        downloadUrl: 'https://downloads.slack-edge.com/releases/windows/4.36.136/prod/x64/SlackSetup.msi',
        filename: 'SlackSetup.msi',
        iconUrl: 'https://raw.githubusercontent.com/homarr-labs/dashboard-icons/main/png/slack.png',
        installCommand: 'msiexec /i "SlackSetup.msi" /qn /norestart',
        uninstallCommand: 'msiexec /x {ProductCode} /qn',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles%\\Slack',
            fileOrFolderName: 'slack.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }],
        customizations: [
            {
                id: 'close-app',
                label: 'Close app before install',
                description: 'Ensures the application is not running before installation begins.',
                arg: '--kill'
            }
        ]
    },
    {
        id: 'vscode',
        name: 'Visual Studio Code (System)',
        publisher: 'Microsoft',
        description: 'Code editing. Redefined.',
        version: 'Latest',
        category: 'Development',
        downloadUrl: 'https://code.visualstudio.com/sha/download?build=stable&os=win32-x64',
        filename: 'VSCodeUserSetup-x64.exe',
        iconUrl: 'https://raw.githubusercontent.com/homarr-labs/dashboard-icons/main/png/visual-studio-code.png',
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
        version: '0.97.2',
        category: 'Utilities',
        downloadUrl: 'https://github.com/microsoft/PowerToys/releases/download/v0.97.2/PowerToysSetup-0.97.2-x64.exe',
        filename: 'PowerToysSetup.exe',
        iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/2020_PowerToys_Icon.svg',
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
        iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Adobe_Acrobat_Reader_icon_%282020%29.svg',
        installCommand: 'AcroRdrDC.exe /sPB /rs /msi EULA_ACCEPT=YES',
        uninstallCommand: 'msiexec /x {AC76BA86-1033-FF00-7760-BC15014EA700} /qn',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles(x86)%\\Adobe\\Acrobat Reader DC\\Reader',
            fileOrFolderName: 'AcroRd32.exe',
            detectionType: 'exists',
            check32BitOn64System: true
        }]
    },
    {
        id: 'discord',
        name: 'Discord',
        publisher: 'Discord Inc.',
        description: 'Discord is the easiest way to talk over voice, video, and text.',
        version: 'Latest',
        category: 'Communication',
        downloadUrl: 'https://discord.com/api/downloads/distributions/app/installers/latest?channel=stable&platform=win&arch=x64',
        filename: 'DiscordSetup.exe',
        iconUrl: 'https://raw.githubusercontent.com/homarr-labs/dashboard-icons/main/png/discord.png',
        installCommand: 'DiscordSetup.exe /S',
        uninstallCommand: '%LocalAppData%\\Discord\\Update.exe --uninstall',
        detectionRules: [{
            type: 'file',
            path: '%LocalAppData%\\Discord',
            fileOrFolderName: 'Update.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }],
        customizations: [
            {
                id: 'close-app',
                label: 'Close app before install',
                description: 'Ensures the application is not running before installation begins.',
                arg: '--kill'
            }
        ]
    },
    {
        id: 'dropbox',
        name: 'Dropbox',
        publisher: 'Dropbox, Inc.',
        description: 'Dropbox is a modern workspace designed to reduce busywork-so you can focus on the things that matter.',
        version: 'Latest',
        category: 'Utilities',
        downloadUrl: 'https://www.dropbox.com/download?plat=win&type=full',
        filename: 'DropboxOfflineInstall.exe',
        iconUrl: 'https://raw.githubusercontent.com/homarr-labs/dashboard-icons/main/png/dropbox.png',
        installCommand: 'DropboxOfflineInstall.exe /S',
        uninstallCommand: '%ProgramFiles(x86)%\\Dropbox\\Client\\DropboxUninstaller.exe /S',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles(x86)%\\Dropbox\\Client',
            fileOrFolderName: 'Dropbox.exe',
            detectionType: 'exists',
            check32BitOn64System: true
        }]
    },
    {
        id: 'evernote',
        name: 'Evernote',
        publisher: 'Evernote Corporation',
        description: 'Evernote helps you capture and prioritize ideas, projects and to-do lists, so nothing falls through the cracks.',
        version: 'Latest',
        category: 'Productivity',
        downloadUrl: 'https://www.evernote.com/download/get.php?plat=win',
        filename: 'Evernote-latest.exe',
        iconUrl: 'https://raw.githubusercontent.com/homarr-labs/dashboard-icons/main/png/evernote.png',
        installCommand: 'Evernote-latest.exe /S',
        uninstallCommand: '%ProgramFiles%\\Evernote\\Uninstall.exe /S',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles%\\Evernote',
            fileOrFolderName: 'Evernote.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }]
    },
    {
        id: 'powerbi',
        name: 'Microsoft Power BI Desktop (x64)',
        publisher: 'Microsoft',
        description: 'Power BI Desktop puts visual analytics at your fingertips.',
        version: 'Latest',
        category: 'Productivity',
        downloadUrl: 'https://go.microsoft.com/fwlink/?LinkId=220261',
        filename: 'PBIDesktopSetup_x64.exe',
        iconUrl: 'https://raw.githubusercontent.com/homarr-labs/dashboard-icons/main/png/powerbi.png',
        installCommand: 'PBIDesktopSetup_x64.exe -quiet -norestart ACCEPT_EULA=1',
        uninstallCommand: 'PBIDesktopSetup_x64.exe -uninstall -quiet',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles%\\Microsoft Power BI Desktop\\bin',
            fileOrFolderName: 'PBIDesktop.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }]
    },
    {
        id: 'teams',
        name: 'Microsoft Teams (Work or School)',
        publisher: 'Microsoft',
        description: 'Microsoft Teams is the ultimate messaging app for your organization.',
        version: 'Latest',
        category: 'Communication',
        downloadUrl: 'https://statics.teams.cdn.office.net/production-windows-x64/lkg/MicrosoftTeams-x64.msix',
        filename: 'MicrosoftTeams-x64.msix',
        iconUrl: 'https://raw.githubusercontent.com/homarr-labs/dashboard-icons/main/png/microsoft-teams.png',
        installCommand: 'powershell -Command "Add-AppxPackage -Path .\\MicrosoftTeams-x64.msix"',
        uninstallCommand: 'powershell -Command "Get-AppxPackage -Name MicrosoftTeams | Remove-AppxPackage"',
        detectionRules: [{
            type: 'file',
            path: '%LocalAppData%\\Microsoft\\WindowsApps',
            fileOrFolderName: 'ms-teams.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }]
    },
    {
        id: 'winrar',
        name: 'WinRAR 7.20 (x64)',
        publisher: 'win.rar GmbH',
        description: 'WinRAR is a powerful archive manager. It can backup your data and reduce the size of email attachments.',
        version: '7.20',
        category: 'Utilities',
        downloadUrl: 'https://www.rarlab.com/rar/winrar-x64-720.exe',
        filename: 'winrar-x64-720.exe',
        iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/22/WinRAR_icon.png',
        installCommand: 'winrar-x64-720.exe /S',
        uninstallCommand: '%ProgramFiles%\\WinRAR\\uninstall.exe /S',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles%\\WinRAR',
            fileOrFolderName: 'WinRAR.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }]
    },
    {
        id: 'putty',
        name: 'PuTTY 0.83 (x64)',
        publisher: 'Simon Tatham',
        description: 'PuTTY is a free and open-source terminal emulator, serial console and network file transfer application.',
        version: '0.83',
        category: 'Development',
        downloadUrl: 'https://the.earth.li/~sgtatham/putty/latest/w64/putty-64bit-0.83-installer.msi',
        filename: 'putty-64bit-0.83-installer.msi',
        iconUrl: 'https://raw.githubusercontent.com/homarr-labs/dashboard-icons/main/png/putty.png',
        installCommand: 'msiexec /i "putty-64bit-0.83-installer.msi" /qn',
        uninstallCommand: 'msiexec /x {ProductCode} /qn',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles%\\PuTTY',
            fileOrFolderName: 'putty.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }]
    },
    {
        id: 'git',
        name: 'Git for Windows',
        publisher: 'The Git Development Community',
        description: 'Git is a free and open source distributed version control system.',
        version: '2.53.0',
        category: 'Development',
        downloadUrl: 'https://github.com/git-for-windows/git/releases/download/v2.53.0.windows.1/Git-2.53.0-64-bit.exe',
        filename: 'Git-64-bit.exe',
        iconUrl: 'https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png',
        installCommand: 'Git-64-bit.exe /VERYSILENT /NORESTART',
        uninstallCommand: '%ProgramFiles%\\Git\\unins000.exe /VERYSILENT',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles%\\Git\\bin',
            fileOrFolderName: 'git.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }]
    },
    {
        id: 'docker',
        name: 'Docker Desktop 4.60.1',
        publisher: 'Docker Inc.',
        description: 'Docker Desktop is an easy-to-install application that enables you to build and share containerized applications and microservices.',
        version: '4.60.1',
        category: 'Development',
        downloadUrl: 'https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe',
        filename: 'Docker Desktop Installer.exe',
        iconUrl: 'https://raw.githubusercontent.com/homarr-labs/dashboard-icons/main/png/docker.png',
        installCommand: '"Docker Desktop Installer.exe" install --quiet',
        uninstallCommand: '"Docker Desktop Installer.exe" uninstall --quiet',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles%\\Docker\\Docker',
            fileOrFolderName: 'Docker Desktop.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }]
    },
    {
        id: 'spotify',
        name: 'Spotify',
        publisher: 'Spotify AB',
        description: 'Spotify is a digital music service that gives you access to millions of songs.',
        version: 'Latest',
        category: 'Media',
        downloadUrl: 'https://download.scdn.co/SpotifySetup.exe',
        filename: 'SpotifySetup.exe',
        iconUrl: 'https://raw.githubusercontent.com/homarr-labs/dashboard-icons/main/png/spotify.png',
        installCommand: 'SpotifySetup.exe /silent',
        uninstallCommand: '%LocalAppData%\\Spotify\\Spotify.exe --uninstall --silent',
        detectionRules: [{
            type: 'file',
            path: '%LocalAppData%\\Spotify',
            fileOrFolderName: 'Spotify.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }]
    },
    {
        id: 'adobe-acrobat-pro',
        name: 'Adobe Acrobat (64-bit Unified)',
        publisher: 'Adobe',
        description: 'The complete PDF solution for today’s multi-device world. Unified installer for Reader and Pro.',
        version: '24.001.20604',
        category: 'Productivity',
        downloadUrl: 'https://ardownload2.adobe.com/pub/adobe/reader/win/AcrobatDC/2400120604/AcroRdrDC2400120604_en_US.exe',
        filename: 'AcroRdrDC2400120604_en_US.exe',
        iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Adobe_Acrobat_Reader_icon_%282020%29.svg',
        installCommand: 'AcroRdrDC2400120604_en_US.exe /sAll /rs /msi EULA_ACCEPT=YES',
        uninstallCommand: 'msiexec /x {AC76BA86-1033-FF00-7760-BC15014EA700} /qn',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles%\\Adobe\\Acrobat DC\\Acrobat',
            fileOrFolderName: 'Acrobat.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }]
    },
    {
        id: 'anydesk',
        name: 'AnyDesk',
        publisher: 'AnyDesk Software GmbH',
        description: 'Remote desktop software for reliable remote access.',
        version: 'Latest',
        category: 'Utilities',
        downloadUrl: 'https://download.anydesk.com/AnyDesk.exe',
        filename: 'AnyDesk.exe',
        iconUrl: 'https://raw.githubusercontent.com/walkxcode/dashboard-icons/master/png/anydesk.png',
        installCommand: 'AnyDesk.exe --install "%ProgramFiles(x86)%\\AnyDesk" --silent',
        uninstallCommand: '"%ProgramFiles(x86)%\\AnyDesk\\AnyDesk.exe" --uninstall --silent',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles(x86)%\\AnyDesk',
            fileOrFolderName: 'AnyDesk.exe',
            detectionType: 'exists',
            check32BitOn64System: true
        }]
    },
    {
        id: 'logi-options-plus',
        name: 'Logi Options+',
        publisher: 'Logitech',
        description: 'Next-gen app for Logitech mice and keyboards.',
        version: 'Latest',
        category: 'Utilities',
        downloadUrl: 'https://download01.logi.com/web/ftp/pub/techsupport/optionsplus/logioptionsplus_installer.exe',
        filename: 'logioptionsplus_installer.exe',
        iconUrl: 'https://raw.githubusercontent.com/homarr-labs/dashboard-icons/main/png/logitech.png',
        installCommand: 'logioptionsplus_installer.exe /quiet /analytics no /sso no /update no',
        uninstallCommand: 'msiexec /x {ProductCode} /qn',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles%\\LogiOptionsPlus',
            fileOrFolderName: 'logioptionsplus.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }]
    },
    {
        id: 'pdf24-creator',
        name: 'PDF24 Creator',
        publisher: 'geek software GmbH',
        description: 'Free and easy-to-use PDF solution with many tools.',
        version: 'Latest',
        category: 'Productivity',
        downloadUrl: 'https://www.pdf24.org/products/pdf-creator/download/pdf24-creator-x64.msi',
        filename: 'pdf24-creator-x64.msi',
        iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c0/PDF24_Creator_application_logo_256x256.png',
        installCommand: 'msiexec /i "pdf24-creator-x64.msi" /qn',
        uninstallCommand: 'msiexec /x "pdf24-creator-x64.msi" /qn',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles%\\PDF24',
            fileOrFolderName: 'pdf24-creator.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }]
    },
    {
        id: 'nodejs-lts',
        name: 'Node.js LTS (v24.13.1)',
        publisher: 'Node.js Foundation',
        description: 'A JavaScript runtime built on Chrome\'s V8 JavaScript engine.',
        version: '24.13.1',
        category: 'Development',
        downloadUrl: 'https://nodejs.org/dist/v24.13.1/node-v24.13.1-x64.msi',
        filename: 'node-v24.13.1-x64.msi',
        iconUrl: 'https://raw.githubusercontent.com/walkxcode/dashboard-icons/master/png/nodejs.png',
        installCommand: 'msiexec /i "node-v24.13.1-x64.msi" /qn',
        uninstallCommand: 'msiexec /x "node-v24.13.1-x64.msi" /qn',
        detectionRules: [{
            type: 'file',
            path: '%ProgramFiles%\\nodejs',
            fileOrFolderName: 'node.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }]
    },
    {
        id: 'telegram-desktop',
        name: 'Telegram Desktop',
        publisher: 'Telegram FZ-LLC',
        description: 'Fast and secure desktop messaging app.',
        version: 'Latest',
        category: 'Communication',
        downloadUrl: 'https://telegram.org/dl/desktop/win64',
        filename: 'tsetup.exe',
        iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg',
        installCommand: 'tsetup.exe /VERYSILENT /NORESTART',
        uninstallCommand: '%AppData%\\Telegram Desktop\\unins000.exe /VERYSILENT',
        detectionRules: [{
            type: 'file',
            path: '%AppData%\\Telegram Desktop',
            fileOrFolderName: 'Telegram.exe',
            detectionType: 'exists',
            check32BitOn64System: false
        }]
    }
];
