# IntuneForge 🔨

Create and deploy Win32 apps to Microsoft Intune directly from your browser. No installation needed—just visit the site and start packaging.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- Works entirely in any modern browser
- Packages .exe and .msi installers into .intunewin format
- Connects securely to your Intune tenant via Entra
- Uploads packages and handles assignments automatically
- Saves your configurations for later use
- Comes with a built-in dark theme
- Open Source and MIT licensed

## Quick Start

### Hosted Version
You can use the tool right away at [realgarit.github.io/intuneforge](https://realgarit.github.io/intuneforge).

### Run Locally
If you prefer running it yourself:

```bash
git clone https://github.com/realgarit/intuneforge.git
cd intuneforge
npm install
npm run dev
```

## Entra Setup

To deploy apps, you'll need to register an application in Entra ID.

1.  Go to [Entra ID App Registrations](https://entra.microsoft.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade/quickStartType~/null/sourceType/Microsoft_AAD_IAM).
2.  Create a **New registration** named **"IntuneForge"**.
3.  Choose **Accounts in this organizational directory only**.
4.  Under **API permissions**, add `DeviceManagementApps.ReadWrite.All` and `Group.Read.All` (**Delegated permissions**) and grant admin consent.
5.  Under **Authentication**, add **Single-page application** platform with these redirect URIs:
    - `http://localhost:5173` (for local dev)
    - `https://realgarit.github.io/IntuneForge/` (for the hosted site)
6.  Copy the **Client ID** and **Tenant ID** from the Overview tab, you'll need them to log in.

## How It Works

IntuneForge handles everything locally on your machine using the browser's Web Crypto API.

When you add an installer, it gets compressed into a ZIP, encrypted with AES-256, and bundled with the required XML metadata. The final .intunewin file is assembled right in your browser memory. Your files never leave your computer until you hit deploy, which sends them directly to your Intune tenant.

## Detection Rules

We support all the standard detection methods:

| Type | Checks for |
|------|-------------|
| **Registry** | Keys or values |
| **File** | Existence, version, or size |
| **Script** | Custom PowerShell logic |
| **MSI** | Product codes |

## Tech Stack

- **React** & **TypeScript**
- **Vite** for building
- **Tailwind CSS** & **shadcn/ui** for styling
- **MSAL.js** for authentication
- **JSZip** & **Web Crypto API** for the heavy lifting

## Legacy Scripts

If you're looking for the original PowerShell automation scripts, check the `legacy/` directory. They're still there if you need them.

## Contributing

Found a bug or have an idea? Feel free to open an issue or submit a pull request.

## License

See [LICENSE](LICENSE).

## Credits

- Inspired by [MSEndpointMgr/IntuneWin32App](https://github.com/MSEndpointMgr/IntuneWin32App)
- UI components by [shadcn/ui](https://ui.shadcn.com)