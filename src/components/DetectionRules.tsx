import { useState } from 'react';
import { Search, Plus, Trash2, FileCode, FolderSearch, Database, Code } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePackage } from '@/contexts/PackageContext';
import type {
    DetectionRule,
    DetectionRuleType,
    RegistryDetectionRule,
    FileDetectionRule,
    ScriptDetectionRule,
    MsiDetectionRule
} from '@/lib/package-config';

const DEFAULT_DETECTION_SCRIPT = `# Detection script - Exit with code 0 if app is installed
$targetVersion = [version]"1.0.0"

# Check registry for installed version
$regPath = "HKLM:\\SOFTWARE\\YourApp"
if (Test-Path $regPath) {
    $installed = (Get-ItemProperty -Path $regPath -Name "Version").Version
    if ([version]$installed -ge $targetVersion) {
        Write-Output "Detected version $installed"
        exit 0
    }
}

exit 1  # Not detected`;

export function DetectionRules() {
    const { currentConfig, updateCurrentConfig } = usePackage();
    const [activeTab, setActiveTab] = useState<DetectionRuleType>('registry');

    if (!currentConfig) return null;

    const addRule = (type: DetectionRuleType) => {
        let newRule: DetectionRule;

        switch (type) {
            case 'registry':
                newRule = {
                    type: 'registry',
                    keyPath: 'HKLM\\SOFTWARE\\',
                    valueName: '',
                    operator: 'exists',
                    check32BitOn64System: false,
                } as RegistryDetectionRule;
                break;
            case 'file':
                newRule = {
                    type: 'file',
                    path: 'C:\\Program Files\\',
                    fileOrFolderName: '',
                    detectionType: 'exists',
                    check32BitOn64System: false,
                } as FileDetectionRule;
                break;
            case 'script':
                newRule = {
                    type: 'script',
                    scriptContent: DEFAULT_DETECTION_SCRIPT,
                    enforceSignatureCheck: false,
                    runAs32Bit: false,
                } as ScriptDetectionRule;
                break;
            case 'msi':
                newRule = {
                    type: 'msi',
                    productCode: '',
                    productVersion: '',
                    productVersionOperator: 'greaterThanOrEqual',
                } as MsiDetectionRule;
                break;
        }

        updateCurrentConfig({
            detectionRules: [...currentConfig.detectionRules, newRule],
        });
    };

    const updateRule = (index: number, updates: Partial<DetectionRule>) => {
        const updatedRules = [...currentConfig.detectionRules];
        updatedRules[index] = { ...updatedRules[index], ...updates } as DetectionRule;
        updateCurrentConfig({ detectionRules: updatedRules });
    };

    const removeRule = (index: number) => {
        updateCurrentConfig({
            detectionRules: currentConfig.detectionRules.filter((_, i) => i !== index),
        });
    };

    const getRuleIcon = (type: DetectionRuleType) => {
        switch (type) {
            case 'registry': return <Database className="h-4 w-4" />;
            case 'file': return <FolderSearch className="h-4 w-4" />;
            case 'script': return <Code className="h-4 w-4" />;
            case 'msi': return <FileCode className="h-4 w-4" />;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Detection Rules
                </CardTitle>
                <CardDescription>
                    Define how Intune should detect if the application is installed
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DetectionRuleType)}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="registry" className="gap-2">
                            <Database className="h-4 w-4" />
                            <span className="hidden sm:inline">Registry</span>
                        </TabsTrigger>
                        <TabsTrigger value="file" className="gap-2">
                            <FolderSearch className="h-4 w-4" />
                            <span className="hidden sm:inline">File</span>
                        </TabsTrigger>
                        <TabsTrigger value="script" className="gap-2">
                            <Code className="h-4 w-4" />
                            <span className="hidden sm:inline">Script</span>
                        </TabsTrigger>
                        <TabsTrigger value="msi" className="gap-2">
                            <FileCode className="h-4 w-4" />
                            <span className="hidden sm:inline">MSI</span>
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addRule(activeTab)}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Rule
                        </Button>
                    </div>
                </Tabs>

                {/* Display existing rules */}
                <div className="space-y-4">
                    {currentConfig.detectionRules.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No detection rules configured. Add at least one rule.
                        </div>
                    ) : (
                        currentConfig.detectionRules.map((rule, index) => (
                            <div
                                key={index}
                                className="p-4 border rounded-lg bg-muted/30 space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 font-medium">
                                        {getRuleIcon(rule.type)}
                                        <span className="capitalize">{rule.type} Detection</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeRule(index)}
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                {rule.type === 'registry' && (
                                    <RegistryRuleForm
                                        rule={rule as RegistryDetectionRule}
                                        onChange={(updates) => updateRule(index, updates)}
                                    />
                                )}

                                {rule.type === 'file' && (
                                    <FileRuleForm
                                        rule={rule as FileDetectionRule}
                                        onChange={(updates) => updateRule(index, updates)}
                                    />
                                )}

                                {rule.type === 'script' && (
                                    <ScriptRuleForm
                                        rule={rule as ScriptDetectionRule}
                                        onChange={(updates) => updateRule(index, updates)}
                                    />
                                )}

                                {rule.type === 'msi' && (
                                    <MsiRuleForm
                                        rule={rule as MsiDetectionRule}
                                        onChange={(updates) => updateRule(index, updates)}
                                    />
                                )}
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function RegistryRuleForm({
    rule,
    onChange
}: {
    rule: RegistryDetectionRule;
    onChange: (updates: Partial<RegistryDetectionRule>) => void;
}) {
    return (
        <div className="grid gap-3">
            <div className="space-y-2">
                <Label>Key Path</Label>
                <Input
                    placeholder="HKLM\SOFTWARE\MyApp"
                    value={rule.keyPath}
                    onChange={(e) => onChange({ keyPath: e.target.value })}
                    className="font-mono text-sm"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Label>Value Name</Label>
                    <Input
                        placeholder="Version"
                        value={rule.valueName}
                        onChange={(e) => onChange({ valueName: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Operator</Label>
                    <Select
                        value={rule.operator}
                        onValueChange={(v) => onChange({ operator: v as RegistryDetectionRule['operator'] })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="exists">Key/Value Exists</SelectItem>
                            <SelectItem value="notExists">Key/Value Does Not Exist</SelectItem>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="notEquals">Not Equals</SelectItem>
                            <SelectItem value="greaterThan">Greater Than</SelectItem>
                            <SelectItem value="lessThan">Less Than</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            {['equals', 'notEquals', 'greaterThan', 'lessThan'].includes(rule.operator) && (
                <div className="space-y-2">
                    <Label>Expected Value</Label>
                    <Input
                        placeholder="1.0.0"
                        value={rule.expectedValue || ''}
                        onChange={(e) => onChange({ expectedValue: e.target.value })}
                    />
                </div>
            )}
        </div>
    );
}

function FileRuleForm({
    rule,
    onChange
}: {
    rule: FileDetectionRule;
    onChange: (updates: Partial<FileDetectionRule>) => void;
}) {
    return (
        <div className="grid gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Label>Path</Label>
                    <Input
                        placeholder="C:\Program Files\MyApp"
                        value={rule.path}
                        onChange={(e) => onChange({ path: e.target.value })}
                        className="font-mono text-sm"
                    />
                </div>
                <div className="space-y-2">
                    <Label>File/Folder Name</Label>
                    <Input
                        placeholder="myapp.exe"
                        value={rule.fileOrFolderName}
                        onChange={(e) => onChange({ fileOrFolderName: e.target.value })}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label>Detection Type</Label>
                <Select
                    value={rule.detectionType}
                    onValueChange={(v) => onChange({ detectionType: v as FileDetectionRule['detectionType'] })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="exists">File/Folder Exists</SelectItem>
                        <SelectItem value="notExists">File/Folder Does Not Exist</SelectItem>
                        <SelectItem value="version">Version Comparison</SelectItem>
                        <SelectItem value="size">Size Comparison</SelectItem>
                        <SelectItem value="dateModified">Date Modified Comparison</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

function ScriptRuleForm({
    rule,
    onChange
}: {
    rule: ScriptDetectionRule;
    onChange: (updates: Partial<ScriptDetectionRule>) => void;
}) {
    return (
        <div className="space-y-3">
            <div className="space-y-2">
                <Label>PowerShell Script</Label>
                <Textarea
                    placeholder="# Your detection script here..."
                    value={rule.scriptContent}
                    onChange={(e) => onChange({ scriptContent: e.target.value })}
                    className="font-mono text-sm min-h-[200px]"
                />
            </div>
            <p className="text-xs text-muted-foreground">
                The script should exit with code 0 if the app is detected, or non-zero if not detected.
                Any output written to STDOUT is used for logging.
            </p>
        </div>
    );
}

function MsiRuleForm({
    rule,
    onChange
}: {
    rule: MsiDetectionRule;
    onChange: (updates: Partial<MsiDetectionRule>) => void;
}) {
    return (
        <div className="grid gap-3">
            <div className="space-y-2">
                <Label>Product Code (GUID)</Label>
                <Input
                    placeholder="{XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX}"
                    value={rule.productCode}
                    onChange={(e) => onChange({ productCode: e.target.value })}
                    className="font-mono text-sm"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Label>Product Version (Optional)</Label>
                    <Input
                        placeholder="1.0.0"
                        value={rule.productVersion || ''}
                        onChange={(e) => onChange({ productVersion: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Version Operator</Label>
                    <Select
                        value={rule.productVersionOperator || 'greaterThanOrEqual'}
                        onValueChange={(v) => onChange({ productVersionOperator: v as MsiDetectionRule['productVersionOperator'] })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="notEquals">Not Equals</SelectItem>
                            <SelectItem value="greaterThan">Greater Than</SelectItem>
                            <SelectItem value="lessThan">Less Than</SelectItem>
                            <SelectItem value="greaterThanOrEqual">Greater Than or Equal</SelectItem>
                            <SelectItem value="lessThanOrEqual">Less Than or Equal</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
