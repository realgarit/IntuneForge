/**
 * MSAL Configuration for Azure AD Authentication
 * 
 * Users need to create their own App Registration in Azure AD
 * with the following permissions:
 * - DeviceManagementApps.ReadWrite.All (Delegated)
 */

import { LogLevel } from '@azure/msal-browser';
import type { Configuration } from '@azure/msal-browser';

// Default redirect URI
const getRedirectUri = () => {
    if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        // GitHub Pages requires the subdirectory path
        if (host === 'realgarit.github.io') {
            return 'https://realgarit.github.io/IntuneForge/';
        }
        // Vercel and Localhost serve from root, so origin is sufficient
        return window.location.origin;
    }
    return 'http://localhost:5173';
};

/**
 * Creates MSAL configuration for the given client ID
 */
export const createMsalConfig = (clientId: string, tenantId?: string): Configuration => ({
    auth: {
        clientId,
        authority: `https://login.microsoftonline.com/${tenantId || 'common'}`,
        redirectUri: getRedirectUri(),
        postLogoutRedirectUri: getRedirectUri(),
    },
    cache: {
        cacheLocation: 'localStorage',
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) return;
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        break;
                    case LogLevel.Warning:
                        console.warn(message);
                        break;
                    case LogLevel.Info:
                        console.info(message);
                        break;
                    case LogLevel.Verbose:
                        console.debug(message);
                        break;
                }
            },
            logLevel: LogLevel.Warning,
        },
    },
});

/**
 * Scopes required for Intune Win32 app management
 */
export const intuneScopes = {
    // Required for Win32 app creation and management
    graphScopes: [
        'https://graph.microsoft.com/DeviceManagementApps.ReadWrite.All',
        'https://graph.microsoft.com/Group.Read.All'
    ],
};

/**
 * Login request configuration
 */
export const loginRequest = {
    scopes: intuneScopes.graphScopes,
};

/**
 * Graph API endpoints
 */
export const graphConfig = {
    baseUrl: 'https://graph.microsoft.com/beta',
    win32Apps: '/deviceAppManagement/mobileApps',
};
