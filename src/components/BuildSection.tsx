import { useState } from 'react';
import { Hammer, Download, Upload, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePackage } from '@/contexts/PackageContext';
import { useAuth } from '@/contexts/AuthContext';
import { createIntuneWinPackage, downloadIntuneWin, type IntuneWinMetadata } from '@/lib/intunewin';
import { deployToIntune } from '@/lib/deploy';
import type { Win32AppDeploymentStage } from '@/lib/graph-api';

type BuildStage = 'idle' | 'packaging' | 'uploading' | 'complete' | 'error' | Win32AppDeploymentStage;

interface BuildProgress {
    stage: BuildStage;
    message: string;
    progress: number;
}

export function BuildSection() {
    const { currentConfig, selectedFile, saveCurrentConfig } = usePackage();
    const { isAuthenticated, getAccessToken } = useAuth();
    const [buildProgress, setBuildProgress] = useState<BuildProgress>({
        stage: 'idle',
        message: '',
        progress: 0,
    });
    const [intunewinBlob, setIntunewinBlob] = useState<Blob | null>(null);
    const [encryptedPayload, setEncryptedPayload] = useState<Blob | null>(null);
    const [packageMetadata, setPackageMetadata] = useState<IntuneWinMetadata | null>(null);

    const validateConfig = (): string[] => {
        const errors: string[] = [];

        if (!selectedFile) {
            errors.push('No installer file selected');
        }
        if (!currentConfig?.displayName) {
            errors.push('Display name is required');
        }
        if (!currentConfig?.publisher) {
            errors.push('Publisher is required');
        }
        if (!currentConfig?.version) {
            errors.push('Version is required');
        }
        if (!currentConfig?.installCommandLine) {
            errors.push('Install command is required');
        }
        if (!currentConfig?.uninstallCommandLine) {
            errors.push('Uninstall command is required');
        }
        if (!currentConfig?.detectionRules.length) {
            errors.push('At least one detection rule is required');
        }

        return errors;
    };

    const handleBuildPackage = async () => {
        if (!selectedFile || !currentConfig) return;

        const errors = validateConfig();
        if (errors.length > 0) {
            setBuildProgress({
                stage: 'error',
                message: errors.join(', '),
                progress: 0,
            });
            return;
        }

        try {
            setBuildProgress({
                stage: 'packaging',
                message: 'Creating .intunewin package...',
                progress: 0,
            });

            const result = await createIntuneWinPackage(
                {
                    name: currentConfig.displayName,
                    version: currentConfig.version,
                    publisher: currentConfig.publisher,
                    setupFile: selectedFile.name,
                    file: selectedFile,
                },
                (stage, progress) => {
                    setBuildProgress({
                        stage: 'packaging',
                        message: stage,
                        progress,
                    });
                }
            );

            setIntunewinBlob(result.intunewinBlob);
            setEncryptedPayload(result.encryptedPayload);
            setPackageMetadata(result.metadata);
            saveCurrentConfig();

            setBuildProgress({
                stage: 'complete',
                message: 'Package created successfully!',
                progress: 100,
            });
        } catch (error) {
            console.error('Build failed:', error);
            setBuildProgress({
                stage: 'error',
                message: error instanceof Error ? error.message : 'Build failed',
                progress: 0,
            });
        }
    };

    const handleDownload = () => {
        if (!intunewinBlob || !currentConfig) return;

        const fileName = `${currentConfig.displayName.replace(/[^a-zA-Z0-9]/g, '_')}_${currentConfig.version}`;
        downloadIntuneWin(intunewinBlob, fileName);
    };

    const handleDeployToIntune = async () => {
        if (!intunewinBlob || !packageMetadata || !currentConfig) return;

        try {
            const accessToken = await getAccessToken();

            await deployToIntune({
                accessToken,
                config: currentConfig,
                intunewinBlob: intunewinBlob!,
                encryptedPayload: encryptedPayload! || intunewinBlob!, // Fallback to intunewinBlob if encryptedPayload is missing (should verify safety)
                metadata: packageMetadata,
                onProgress: (stage, progress) => {
                    let message = '';
                    switch (stage) {
                        case 'creating_app': message = 'Creating app in Intune...'; break;
                        case 'creating_content': message = 'Creating content version...'; break;
                        case 'creating_file': message = 'Initializing file entry...'; break;
                        case 'getting_storage_uri': message = 'Requesting upload URL...'; break;
                        case 'uploading': message = `Uploading package... (${Math.round(progress)}%)`; break;
                        case 'committing': message = 'Committing file...'; break;
                        case 'waiting_for_commit': message = 'Waiting for Intune to process file...'; break;
                        case 'finalizing': message = 'Finalizing deployment...'; break;
                        case 'assigning': message = 'Creating assignments...'; break;
                        case 'complete': message = 'Deployment successful!'; break;
                        case 'error': message = 'Deployment failed'; break;
                        default: message = stage;
                    }

                    setBuildProgress({
                        stage,
                        message,
                        progress,
                    });
                }
            });

        } catch (error) {
            console.error('Deployment failed:', error);
            setBuildProgress({
                stage: 'error',
                message: error instanceof Error ? error.message : 'Deployment failed',
                progress: 0,
            });
        }
    };

    const errors = currentConfig ? validateConfig() : [];
    const canBuild = errors.length === 0;

    return (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Hammer className="h-5 w-5" />
                    Build & Deploy
                </CardTitle>
                <CardDescription>
                    Create your .intunewin package and deploy to Intune
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Validation Status */}
                {errors.length > 0 && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <div className="flex items-start gap-2 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium">Please fix the following:</p>
                                <ul className="list-disc list-inside mt-1 space-y-0.5">
                                    {errors.map((error, i) => (
                                        <li key={i}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Progress */}
                {buildProgress.stage !== 'idle' && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            {(buildProgress.stage === 'packaging' ||
                                buildProgress.stage === 'creating_app' ||
                                buildProgress.stage === 'uploading') && (
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                )}
                            {buildProgress.stage === 'complete' && (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                            {buildProgress.stage === 'error' && (
                                <AlertCircle className="h-4 w-4 text-destructive" />
                            )}
                            <span className="text-sm">{buildProgress.message}</span>
                        </div>
                        {(buildProgress.stage === 'packaging' ||
                            buildProgress.stage === 'uploading' ||
                            buildProgress.stage === 'waiting_for_commit') && (
                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-300"
                                        style={{ width: `${buildProgress.progress}%` }}
                                    />
                                </div>
                            )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                    <Button
                        onClick={handleBuildPackage}
                        disabled={!canBuild || buildProgress.stage === 'packaging'}
                        className="gap-2"
                    >
                        {buildProgress.stage === 'packaging' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Hammer className="h-4 w-4" />
                        )}
                        Build Package
                    </Button>

                    {intunewinBlob && (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleDownload}
                                className="gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Download .intunewin
                            </Button>

                            <Button
                                variant="secondary"
                                onClick={handleDeployToIntune}
                                disabled={!isAuthenticated || buildProgress.stage === 'uploading'}
                                className="gap-2"
                            >
                                {buildProgress.stage === 'uploading' ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Upload className="h-4 w-4" />
                                )}
                                Deploy to Intune
                                {!isAuthenticated && (
                                    <span className="text-xs">(Sign in first)</span>
                                )}
                            </Button>
                        </>
                    )}
                </div>

                {/* File size info */}
                {intunewinBlob && (
                    <p className="text-xs text-muted-foreground">
                        Package size: {(intunewinBlob.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
