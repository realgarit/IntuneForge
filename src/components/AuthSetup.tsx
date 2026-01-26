import { useState } from 'react';
import { Key, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export function AuthSetup() {
    const { clientId, tenantId, setClientId, setTenantId, isAuthenticated, login, logout, isLoading, error } = useAuth();
    const [clientIdInput, setClientIdInput] = useState(clientId || '');
    const [tenantIdInput, setTenantIdInput] = useState(tenantId || '');

    const handleClientIdChange = (value: string) => {
        setClientIdInput(value);
        setClientId(value.trim());
    };

    const handleTenantIdChange = (value: string) => {
        setTenantIdInput(value);
        setTenantId(value.trim());
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Azure AD Authentication
                </CardTitle>
                <CardDescription>
                    Configure your App Registration to deploy packages to Intune
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="client-id">Application (Client) ID</Label>
                    <Input
                        id="client-id"
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        value={clientIdInput}
                        onChange={(e) => handleClientIdChange(e.target.value)}
                        className="font-mono text-sm"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tenant-id">Directory (Tenant) ID</Label>
                    <Input
                        id="tenant-id"
                        placeholder="Optional: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        value={tenantIdInput}
                        onChange={(e) => handleTenantIdChange(e.target.value)}
                        className="font-mono text-sm"
                    />
                </div>

                <div className="flex flex-col gap-3">
                    {isAuthenticated ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                <CheckCircle2 className="h-4 w-4" />
                                Connected to Microsoft Graph
                            </div>
                            <Button variant="outline" size="sm" onClick={logout}>
                                Sign Out
                            </Button>
                        </div>
                    ) : (
                        clientId && (
                            <div className="flex items-center gap-3">
                                <Button onClick={login} className="gap-2" disabled={isLoading}>
                                    Sign in with Microsoft
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setClientId('');
                                        setTenantId('');
                                        setClientIdInput('');
                                        setTenantIdInput('');
                                    }}
                                >
                                    Clear Configuration
                                </Button>
                            </div>
                        )
                    )}

                    {error && (
                        <span className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </span>
                    )}
                </div>

                <div className="p-4 rounded-lg bg-muted/50 space-y-3 text-sm">
                    <p className="font-medium">Setup Instructions:</p>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                        <li>
                            Go to{' '}
                            <a
                                href="https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline inline-flex items-center gap-1"
                            >
                                Azure AD App Registrations
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </li>
                        <li>Create a new registration named "IntuneForge"</li>
                        <li>Add API permissions:
                            <ul className="list-disc list-inside ml-4 mt-1">
                                <li><code className="bg-muted px-1 rounded">DeviceManagementApps.ReadWrite.All</code></li>
                                <li><code className="bg-muted px-1 rounded">Group.Read.All</code></li>
                            </ul>
                        </li>
                        <li>In Authentication, add platform "Single-page application"</li>
                        <li>
                            Set redirect URI (SPA): <code className="bg-muted px-1 rounded">{window.location.origin}</code>
                        </li>
                        <li>Grant admin consent for your organization</li>
                        <li>Copy the Application (Client) ID and Directory (Tenant) ID and paste them above</li>
                    </ol>
                </div>
            </CardContent>
        </Card>
    );
}
