import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TemplatesManager } from '../src/components/TemplatesManager';
import { PackageProvider } from '../src/contexts/PackageContext';
import { Dialog, DialogContent } from '../src/components/ui/dialog';
import { createEmptyPackageConfig } from '../src/lib/package-config';

describe('TemplatesManager', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    const renderInDialog = (ui: React.ReactNode) => {
        return render(
            <PackageProvider>
                <Dialog open={true}>
                    <DialogContent>
                        {ui}
                    </DialogContent>
                </Dialog>
            </PackageProvider>
        );
    };

    it('renders empty state initially', async () => {
        const onSelect = vi.fn();
        renderInDialog(<TemplatesManager onSelect={onSelect} />);

        await waitFor(() => {
            expect(screen.getByText('No Templates Saved')).toBeDefined();
        });
    });

    it('renders saved templates', async () => {
        const onSelect = vi.fn();

        // Pre-populate localStorage
        const mockTemplate = {
            ...createEmptyPackageConfig(),
            id: 'template-1',
            name: 'Test Template',
            publisher: 'Test Publisher',
        };
        window.localStorage.setItem('intuneforge-templates', JSON.stringify([mockTemplate]));

        renderInDialog(<TemplatesManager onSelect={onSelect} />);

        await waitFor(() => {
            expect(screen.getByText('Test Template')).toBeDefined();
            expect(screen.getByText(/Test Publisher/)).toBeDefined();
        });
    });

    it('loads a template', async () => {
        const onSelect = vi.fn();

        const mockTemplate = {
            ...createEmptyPackageConfig(),
            id: 'template-1',
            name: 'Test Template',
        };
        window.localStorage.setItem('intuneforge-templates', JSON.stringify([mockTemplate]));

        renderInDialog(<TemplatesManager onSelect={onSelect} />);

        await waitFor(() => {
            expect(screen.getByText('Load')).toBeDefined();
        });

        fireEvent.click(screen.getByText('Load'));

        expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({
            id: 'template-1',
            name: 'Test Template'
        }));
    });

    it('deletes a template', async () => {
        const onSelect = vi.fn();

        const mockTemplate = {
            ...createEmptyPackageConfig(),
            id: 'template-1',
            name: 'Test Template',
        };
        window.localStorage.setItem('intuneforge-templates', JSON.stringify([mockTemplate]));

        renderInDialog(<TemplatesManager onSelect={onSelect} />);

        await waitFor(() => {
            expect(screen.getByText('Test Template')).toBeDefined();
        });

        // Find delete button (Trash2 icon)
        const buttons = screen.getAllByRole('button');
        const deleteButton = buttons.find(b => !b.textContent?.includes('Load'));

        if (deleteButton) {
            fireEvent.click(deleteButton);
        } else {
            throw new Error('Delete button not found');
        }

        await waitFor(() => {
            expect(screen.queryByText('Test Template')).toBeNull();
            expect(screen.getByText('No Templates Saved')).toBeDefined();
        });

        expect(JSON.parse(window.localStorage.getItem('intuneforge-templates') || '[]')).toHaveLength(0);
    });
});
