# intune-packager

This repository contains a full automated script for packaging and deploying applications using **Microsoft Intune**. The solution includes a streamlined PowerShell script to package Win32 app and manage installation arguments.

---

## Table of Contents
- [Credits](#credits)
- [Features](#features)
- [Authentication](#authentication)
  - [Why is This Needed?](#why-is-this-needed)
  - [How to Set Up Authentication](#how-to-set-up-authentication)
    - [Step 1: Create an App Registration](#step-1-create-an-app-registration)
    - [Step 2: Configure API Permissions](#step-2-configure-api-permissions)
    - [Step 3: Configure Authentication](#step-3-configure-authentication)
    - [Step 4: Retrieve the Client ID](#step-4-retrieve-the-client-id)
    - [Step 5: Add Authentication Parameters to Your Script](#step-5-add-authentication-parameters-to-your-script)
- [Usage](#Usage)

---

## Credits

This project is based on the excellent work from the [MSEndpointMgr/IntuneWin32App](https://github.com/MSEndpointMgr/IntuneWin32App) repository.

- Original script by: [MSEndpointMgr](https://github.com/MSEndpointMgr)
- License: [LICENSE](https://github.com/MSEndpointMgr/IntuneWin32App/blob/master/LICENSE)

---

## Features

- 🛠 **Automated Packaging:** Automate packaging of `.exe` or `.msi` installers for deployment via Intune.
- ⚙️ **Custom Installation & Uninstallation:** Use customizable installation and uninstallation arguments.

> :bulb: **Pro Tip**: If you need to force an Intune sync, run the following PowerShell command. It retrieves the scheduled task named PushLaunch and starts it, effectively initiating an Intune sync:
> 
> ```powershell
> Get-ScheduledTask | Where-Object { $_.TaskName -eq 'PushLaunch' } | Start-ScheduledTask
> ```

---

## Authentication

### Why is This Needed?

Based on research in May 2024, Microsoft updated authentication methods for the **Graph SDK-based PowerShell module**. As a result, the global **Microsoft Intune PowerShell application (client) ID** based authentication method has been **removed**. You can read more about this change [here](https://learn.microsoft.com/en-us/samples/microsoftgraph/powershell-intune-samples/important/).

For example, the command `Connect-MSGraph` previously used the global **Intune PowerShell application ID** (`d1ddf0e4-d672-4dae-b554-9d5bdfd93547`), but this method is now deprecated. To continue using the Intune APIs with PowerShell, you need to **create your own app registration** with the required permissions and connect via that new registration app.

### How to Set Up Authentication

To successfully authenticate and use this script for Intune automation, you will need to set up an **App Registration** in Azure Active Directory (EntraID) and configure the necessary API permissions. Follow these steps:

### Step 1: Create an App Registration
1. **Go to Azure Active Directory**:
   - In the Azure portal, navigate to **Azure Active Directory (EntraID)**.
   
2. **Create a New App Registration**:
   - Click on **App registrations** from the sidebar.
   - Click **New registration**.
   - Name your app **"Intune Powershell"**.
   - Choose the **Supported account types** that match your environment (usually "Accounts in this organizational directory only").
   - Click **Register**.

### Step 2: Configure API Permissions
1. **Add API Permissions**:
   - After creating the app, go to the **API permissions** section.
   - Click **Add a permission**.
   - Select **Microsoft Graph**.
   - Choose **Delegated permissions**.
   - Search for and select **DeviceManagementApps.ReadWrite.All**.
   - Click **Add permissions**.
   
2. **Grant Admin Consent**:
   - Once the permission is added, click **Grant admin consent** for your tenant to allow the app to use these permissions on behalf of users.

### Step 3: Configure Authentication
1. **Go to Authentication Settings**:
   - In the **App registration** page, navigate to the **Authentication** section from the sidebar.

2. **Add a Platform**:
   - Click **Add a platform**.
   - Select **Mobile and desktop applications**.

3. **Add the MSAL Redirect URI**:
   - Scroll down to the **Redirect URIs** section.
   - Add **MSAL Redirect URI**,
   - Click **Configure**.
   - It should look this:
   - ![image](https://github.com/user-attachments/assets/c052161f-7109-4a37-9e6e-91285799d0c6)
     
4. **Copy the Redirect URI**:
   - The redirect URI is essential for the PowerShell script to authenticate. Copy this for use in your script.

### Step 4: Retrieve the Client ID
1. **Get the Client ID**:
   - Go to the **Overview** tab of the App Registration.
   - Copy the **Client ID** (also known as the Application ID). This will be used as a parameter in your script.

### Step 5: Add Authentication Parameters to Your Script
Once you have the **Client ID** and **Redirect URI**, add them as parameters to your PowerShell script to enable authentication.

---

## Usage

1. Clone Repository:
    ```bash
    git clone https://github.com/realgarit/intune-packager
    cd intune-packager
    ```
2. Open `intune-packager-arguments.ps1`
3. Update the parameters (e.g. change PackageType to MSI or EXE) according to your software
4. Run `intune-packager-arguments.ps1`
