import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MyPackages } from '@/components/MyPackages';
import { PackageProvider } from '@/contexts/PackageContext';
import { TooltipProvider } from '@/components/ui/tooltip';

// Mock the context or provide a real one with initial data
const mockConfig = {
    id: 'test-id',
    name: 'Test App',
    displayName: 'Test App',
    publisher: 'Test Publisher',
    version: '1.0.0',
    packageType: 'MSI',
    updatedAt: new Date().toISOString(),
    detectionRules: [],
    assignments: [],
};

describe('MyPackages', () => {
    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem('intuneforge-configs', JSON.stringify([mockConfig]));
    });

    it('renders checkboxes for selection', () => {
        // We need to wrap with providers
        render(
            <TooltipProvider>
                <PackageProvider>
                    <MyPackages onEdit={() => {}} />
                </PackageProvider>
            </TooltipProvider>
        );

        // Check if the checkbox is present
        // In grid view it has aria-label="Select Test App"
        // Wait, default view mode is 'table' in MyPackages.tsx

        const checkbox = screen.getByLabelText('Select Test App');
        expect(checkbox).toBeDefined();
        expect(checkbox.tagName).toBe('INPUT');
        expect((checkbox as HTMLInputElement).type).toBe('checkbox');
    });

    it('toggles selection when checkbox is clicked', () => {
        render(
            <TooltipProvider>
                <PackageProvider>
                    <MyPackages onEdit={() => {}} />
                </PackageProvider>
            </TooltipProvider>
        );

        const checkbox = screen.getByLabelText('Select Test App') as HTMLInputElement;
        expect(checkbox.checked).toBe(false);

        fireEvent.click(checkbox);
        expect(checkbox.checked).toBe(true);
    });
});
