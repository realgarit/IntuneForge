import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser';
import type { AccountInfo } from '@azure/msal-browser';
import { createMsalConfig, loginRequest } from '@/lib/msal-config';
import { loadAuthConfig, saveAuthConfig, clearAuthConfig } from '@/lib/package-config';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    account: AccountInfo | null;
    clientId: string | null;
    tenantId: string | null;
    error: string | null;
    setClientId: (clientId: string) => void;
    setTenantId: (tenantId: string) => void;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    getAccessToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null);
    const [account, setAccount] = useState<AccountInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [clientId, setClientIdState] = useState<string | null>(() => loadAuthConfig()?.clientId || null);
    const [tenantId, setTenantIdState] = useState<string | null>(() => loadAuthConfig()?.tenantId || null);
    const [error, setError] = useState<string | null>(null);

    const initializingRef = useRef<string | null>(null);

    // Initialize MSAL when clientId or tenantId changes
    useEffect(() => {
        const configKey = `${clientId}-${tenantId}`;

        if (!clientId) {
            setMsalInstance(null);
            setAccount(null);
            setIsLoading(false);
            initializingRef.current = null;
            return;
        }

        // If we are already initialized or initializing with the same config, skip
        if (initializingRef.current === configKey) {
            return;
        }

        setIsLoading(true);
        initializingRef.current = configKey;

        const initMsal = async () => {
            try {
                const config = createMsalConfig(clientId, tenantId || undefined);
                const instance = new PublicClientApplication(config);
                await instance.initialize();

                // Handle redirect promise to clear any stuck interaction states
                const response = await instance.handleRedirectPromise();
                if (response) {
                    setAccount(response.account);
                    setError(null);
                }

                // Check for existing accounts
                const accounts = instance.getAllAccounts();
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                }

                setMsalInstance(instance);
                setError(null);
            } catch (err) {
                console.error('MSAL initialization failed:', err);
                setError('Failed to initialize authentication');
                initializingRef.current = null;
            } finally {
                setIsLoading(false);
            }
        };

        initMsal();
    }, [clientId, tenantId, msalInstance]);

    const setClientId = useCallback((newClientId: string) => {
        setClientIdState(newClientId || null);
        if (!newClientId && !tenantId) {
            clearAuthConfig();
        } else {
            saveAuthConfig({ clientId: newClientId, tenantId: tenantId || undefined });
        }
    }, [tenantId]);

    const setTenantId = useCallback((newTenantId: string) => {
        setTenantIdState(newTenantId || null);
        if (!clientId && !newTenantId) {
            clearAuthConfig();
        } else {
            saveAuthConfig({ clientId: clientId || '', tenantId: newTenantId });
        }
    }, [clientId]);

    const login = useCallback(async () => {
        if (!msalInstance) {
            throw new Error('Client ID not configured');
        }

        try {
            setIsLoading(true);
            // Redirect flow - this will reload the page
            await msalInstance.loginRedirect(loginRequest);
        } catch (err) {
            console.error('Login failed:', err);
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(`Login failed: ${message}`);
            setIsLoading(false);
        }
    }, [msalInstance]);

    const logout = useCallback(async () => {
        if (!msalInstance || !account) return;

        try {
            await msalInstance.logoutRedirect({
                account,
            });
            setAccount(null);
        } catch (err) {
            console.error('Logout failed:', err);
        }
    }, [msalInstance, account]);

    const getAccessToken = useCallback(async (): Promise<string> => {
        if (!msalInstance || !account) {
            throw new Error('Not authenticated');
        }

        try {
            const response = await msalInstance.acquireTokenSilent({
                ...loginRequest,
                account,
            });
            return response.accessToken;
        } catch (err) {
            if (err instanceof InteractionRequiredAuthError) {
                // Token expired, need interactive login
                await msalInstance.acquireTokenRedirect(loginRequest);
                // This line won't be reached due to redirect
                return '';
            }
            throw err;
        }
    }, [msalInstance, account]);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: !!account,
                isLoading,
                account,
                clientId,
                tenantId,
                error,
                setClientId,
                setTenantId,
                login,
                logout,
                getAccessToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
