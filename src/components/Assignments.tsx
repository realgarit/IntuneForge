import { useState } from 'react';
import { Users, Plus, Trash2, Search, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { usePackage } from '@/contexts/PackageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getAzureADGroups } from '@/lib/graph-api';
import { type PackageAssignment, type AssignmentTarget } from '@/lib/package-config';

export function Assignments() {
    const { currentConfig, updateCurrentConfig } = usePackage();
    const { isAuthenticated, getAccessToken } = useAuth();
    const [isSearching, setIsSearching] = useState(false);
    const [groupSearch, setGroupSearch] = useState('');
    const [foundGroups, setFoundGroups] = useState<Array<{ id: string; displayName: string }>>([]);

    if (!currentConfig) return null;

    const addAssignment = () => {
        const newAssignment: PackageAssignment = {
            target: 'all-users',
            intent: 'available',
            notifications: 'showAll',
        };

        updateCurrentConfig({
            assignments: [...currentConfig.assignments, newAssignment],
        });
    };

    const updateAssignment = (index: number, updates: Partial<PackageAssignment>) => {
        const updated = [...currentConfig.assignments];
        updated[index] = { ...updated[index], ...updates };
        updateCurrentConfig({ assignments: updated });
    };

    const removeAssignment = (index: number) => {
        updateCurrentConfig({
            assignments: currentConfig.assignments.filter((_, i) => i !== index),
        });
    };

    const searchGroups = async (query: string) => {
        if (!query || query.length < 3 || !isAuthenticated) return;

        setIsSearching(true);
        try {
            const token = await getAccessToken();
            const groups = await getAzureADGroups(token, query);
            setFoundGroups(groups);
        } catch (error) {
            console.error('Failed to search groups:', error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Assignments
                </CardTitle>
                <CardDescription>
                    Deploy this application to users or devices in your organization
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button variant="outline" size="sm" onClick={addAssignment} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Assignment
                </Button>

                <div className="space-y-4 mt-4">
                    {currentConfig.assignments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                            No assignments configured. The app will be created without deployment.
                        </div>
                    ) : (
                        currentConfig.assignments.map((assignment, index) => (
                            <div key={index} className="p-4 border rounded-lg bg-muted/30 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm">Assignment #{index + 1}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeAssignment(index)}
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Intent</Label>
                                        <Select
                                            value={assignment.intent}
                                            onValueChange={(v) => updateAssignment(index, { intent: v as 'required' | 'available' | 'uninstall' })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="required">Required</SelectItem>
                                                <SelectItem value="available">Available</SelectItem>
                                                <SelectItem value="uninstall">Uninstall</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Target</Label>
                                        <Select
                                            value={assignment.target}
                                            onValueChange={(v) => updateAssignment(index, { target: v as AssignmentTarget })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all-users">All Users</SelectItem>
                                                <SelectItem value="all-devices">All Devices</SelectItem>
                                                <SelectItem value="group">Specific Group</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Notifications</Label>
                                        <Select
                                            value={assignment.notifications}
                                            onValueChange={(v) => updateAssignment(index, { notifications: v as 'showAll' | 'showReboot' | 'hideAll' })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="showAll">Show All</SelectItem>
                                                <SelectItem value="showReboot">Only Reboot</SelectItem>
                                                <SelectItem value="hideAll">Hide All</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {assignment.target === 'group' && (
                                    <div className="space-y-3 pt-2 border-t border-border/50">
                                        <Label>Azure AD Group</Label>
                                        {assignment.groupId ? (
                                            <div className="flex items-center justify-between bg-background p-2 rounded border">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{assignment.groupName}</span>
                                                    <span className="text-[10px] font-mono text-muted-foreground">{assignment.groupId}</span>
                                                </div>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => updateAssignment(index, { groupId: undefined, groupName: undefined })}
                                                >
                                                    Change Group
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="relative">
                                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Search groups (min 3 chars)..."
                                                        className="pl-8"
                                                        value={groupSearch}
                                                        onChange={(e) => {
                                                            setGroupSearch(e.target.value);
                                                            searchGroups(e.target.value);
                                                        }}
                                                    />
                                                    {isSearching && (
                                                        <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                                                    )}
                                                </div>
                                                {foundGroups.length > 0 && groupSearch.length >= 3 && (
                                                    <div className="border rounded-md max-h-40 overflow-y-auto bg-background">
                                                        {foundGroups.map((group) => (
                                                            <button
                                                                key={group.id}
                                                                className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors border-b last:border-0"
                                                                onClick={() => {
                                                                    updateAssignment(index, {
                                                                        groupId: group.id,
                                                                        groupName: group.displayName
                                                                    });
                                                                    setGroupSearch('');
                                                                    setFoundGroups([]);
                                                                }}
                                                            >
                                                                <div className="font-medium">{group.displayName}</div>
                                                                <div className="text-[10px] font-mono text-muted-foreground">{group.id}</div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                                {!isAuthenticated && (
                                                    <p className="text-xs text-destructive">Sign in to search Azure AD groups</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
