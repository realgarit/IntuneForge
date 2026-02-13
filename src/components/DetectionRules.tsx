import { useState } from 'react';
import { Search, Plus, Trash2, FileCode, FolderSearch, Database, Code } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
        <Card className="border-border/40 shadow-sm bg-card/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-black">
                    <Search className="h-5 w-5 text-primary" />
                    Detection Logic
                </CardTitle>
                <CardDescription className="font-medium">
                    Define how Intune should detect if the application is installed
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="bg-muted/40 p-1.5 rounded-2xl border border-border/40">
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DetectionRuleType)}>
                        <TabsList className="grid w-full grid-cols-4 bg-transparent h-11">
                            <TabsTrigger value="registry" className="gap-2 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md font-bold">
                                <Database className="h-4 w-4" />
                                <span className="hidden sm:inline">Registry</span>
                            </TabsTrigger>
                            <TabsTrigger value="file" className="gap-2 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md font-bold">
                                <FolderSearch className="h-4 w-4" />
                                <span className="hidden sm:inline">File</span>
                            </TabsTrigger>
                            <TabsTrigger value="script" className="gap-2 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md font-bold">
                                <Code className="h-4 w-4" />
                                <span className="hidden sm:inline">Script</span>
                            </TabsTrigger>
                            <TabsTrigger value="msi" className="gap-2 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md font-bold">
                                <FileCode className="h-4 w-4" />
                                <span className="hidden sm:inline">MSI</span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        onClick={() => addRule(activeTab)}
                        className="gap-3 rounded-2xl border-dashed border-2 px-10 h-14 font-black hover:bg-primary/5 hover:border-primary/50 transition-all text-muted-foreground hover:text-primary active:scale-95"
                    >
                        <Plus className="h-5 w-5" />
                        Add New {activeTab.toUpperCase()} Rule
                    </Button>
                </div>

                {/* Display existing rules */}
                <div className="space-y-4">
                    {currentConfig.detectionRules.length === 0 ? (
                        <div className="text-center py-20 bg-muted/20 border-2 border-dashed rounded-[2rem] flex flex-col items-center">
                            <Search className="h-12 w-12 text-muted-foreground/20 mb-4" />
                            <p className="text-muted-foreground font-medium">No detection rules configured.</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">Add at least one rule to validate the installation.</p>
                        </div>
                    ) : (
                        currentConfig.detectionRules.map((rule, index) => (
                            <div
                                key={index}
                                className="p-6 border-2 border-border/40 rounded-3xl bg-background/50 space-y-5 animate-in slide-in-from-top-4 duration-300 relative group overflow-hidden shadow-sm"
                            >
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 font-medium">
                                        {getRuleIcon(rule.type)}
                                        <span className="capitalize">{rule.type} Detection</span>
                                    </div>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeRule(index)}
                                                aria-label="Remove rule"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="rounded-lg font-bold">Remove Rule</TooltipContent>
                                    </Tooltip>
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
