# IntuneForge 🔨

A modern, web-based tool for creating and deploying Win32 application packages to Microsoft Intune. No installation required - just visit the website and start packaging!

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🌐 **Web-Based** - Works in any modern browser, no installation needed
- 📦 **Create .intunewin Packages** - Package your .exe or .msi installers directly in the browser
- 🔐 **Azure AD Authentication** - Securely connect to your Intune tenant
- 🚀 **Deploy to Intune** - Upload packages and configure assignments
- 💾 **Save Configurations** - Save and reuse package configurations
- 🌙 **Dark Mode** - Beautiful dark theme by default
- 🔓 **Open Source** - MIT licensed, free to use and modify

## Quick Start

### Option 1: Use the Hosted Version
Visit [https://realgarit.github.io/intuneforge](https://realgarit.github.io/intuneforge) to use IntuneForge directly in your browser.

### Option 2: Run Locally
```bash
# Clone the repository
git clone https://github.com/realgarit/intuneforge.git
cd intuneforge

# Install dependencies
npm install

# Start development server
npm run dev
```

## Azure AD Setup

To deploy packages to Intune, you need to create an App Registration in Azure AD:

1. Go to [Azure AD App Registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. Click **New registration**
3. Name your app **"IntuneForge"**
4. Select **Accounts in this organizational directory only**
5. Click **Register**

### Configure API Permissions
1. Go to **API permissions**
2. Click **Add a permission** → **Microsoft Graph** → **Delegated permissions**
3. Add: `DeviceManagementApps.ReadWrite.All`
4. Click **Grant admin consent** for your organization

### Configure Authentication
1. Go to **Authentication**
2. Click **Add a platform** → **Single-page application**
3. Add redirect URI:
   - For local development: `http://localhost:5173`
   - For hosted version: `https://realgarit.github.io`
4. Click **Configure**

### Get Your Client and Tenant IDs
1. Go to the **Overview** tab
2. Copy the **Application (client) ID**
3. Copy the **Directory (tenant) ID**
4. Paste them in IntuneForge's Authentication settings

## How It Works

IntuneForge creates .intunewin packages entirely in your browser using the Web Crypto API:

1. **ZIP Compression** - Your installer is compressed into a ZIP archive
2. **AES-256 Encryption** - The ZIP is encrypted for secure transport
3. **XML Metadata** - Detection information is generated
4. **Package Assembly** - Everything is bundled into the .intunewin format

All processing happens locally - your files never leave your browser until you choose to deploy.

## Detection Rules

IntuneForge supports all standard Intune detection rule types:

| Type | Description |
|------|-------------|
| **Registry** | Check for registry keys or values |
| **File** | Check for file/folder existence, version, or size |
| **Script** | Custom PowerShell detection script |
| **MSI** | Check MSI product code and version |

## Technology Stack

- **React** + **TypeScript** - Modern frontend framework
- **Vite** - Fast build tooling
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **MSAL.js** - Microsoft authentication
- **JSZip** - ZIP file handling
- **Web Crypto API** - AES-256 encryption

## Legacy PowerShell Scripts

The original PowerShell scripts are preserved in the `legacy/` directory. These were the foundation for IntuneForge and can still be used for automation scenarios.

## Contributing

Contributions are welcome! Feel free to:

- 🐛 Report bugs
- 💡 Suggest features
- 🔧 Submit pull requests

## License

MIT License - see [LICENSE](LICENSE) for details.

## Credits

- Original PowerShell scripts inspired by [MSEndpointMgr/IntuneWin32App](https://github.com/MSEndpointMgr/IntuneWin32App)
- UI components from [shadcn/ui](https://ui.shadcn.com)

---

Made with 🔨 by [realgarit](https://github.com/realgarit)
