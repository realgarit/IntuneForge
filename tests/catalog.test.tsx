import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { AppCatalog } from '../src/components/AppCatalog';
import { APP_CATALOG } from '../src/lib/app-catalog';
import { Dialog, DialogContent } from '../src/components/ui/dialog';
import { PackageProvider } from '../src/contexts/PackageContext';

describe('AppCatalog', () => {
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

    it('renders the catalog apps', async () => {
        const onSelect = vi.fn();
        renderInDialog(<AppCatalog onSelect={onSelect} />);

        // Wait for dialog content to be visible (it animates in)
        await waitFor(() => {
            expect(screen.getByText(APP_CATALOG[0].name)).toBeDefined();
        });
    });

    it('filters apps by search', async () => {
        const onSelect = vi.fn();
        renderInDialog(<AppCatalog onSelect={onSelect} />);

        await waitFor(() => {
             expect(screen.getByText(APP_CATALOG[0].name)).toBeDefined();
        });

        const input = screen.getByPlaceholderText('Search apps, vendors, categories...');
        fireEvent.change(input, { target: { value: 'Firefox' } });

        await waitFor(() => {
             expect(screen.getByText('Mozilla Firefox (ESR)')).toBeDefined();
             // 7-Zip should be hidden
             expect(screen.queryByText('7-Zip 23.01 (x64)')).toBeNull();
        });
    });

    it('handles app selection and download', async () => {
        const onSelect = vi.fn();

        // Mock fetch
        const mockBlob = new Blob(['fake installer content'], { type: 'application/octet-stream' });
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            blob: () => Promise.resolve(mockBlob),
        } as Response);

        renderInDialog(<AppCatalog onSelect={onSelect} />);

        await waitFor(() => {
             expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
        });

        const buttons = screen.getAllByRole('button');
        const configureButton = buttons.find(b => b.textContent?.includes('Configure'));

        if (!configureButton) throw new Error('Configure button not found');
        fireEvent.click(configureButton);

        // Should now be in customization view
        const startButton = await screen.findByText('Start Packaging');
        fireEvent.click(startButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/proxy?url='));
            expect(onSelect).toHaveBeenCalled();
        });

        // Verify the file argument
        const file = onSelect.mock.calls[0][1];
        expect(file).toBeInstanceOf(File);
        expect(file.size).toBeGreaterThan(0);
    });

    it('handles download error', async () => {
        const onSelect = vi.fn();

        // Mock fetch error
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

        renderInDialog(<AppCatalog onSelect={onSelect} />);

        await waitFor(() => {
             expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
        });

        const buttons = screen.getAllByRole('button');
        const configureButton = buttons.find(b => b.textContent?.includes('Configure'));

        if (!configureButton) throw new Error('Configure button not found');
        fireEvent.click(configureButton);

        // Should now be in customization view
        const startButton = await screen.findByText('Start Packaging');
        fireEvent.click(startButton);

        await waitFor(() => {
            expect(screen.getByText('Network error')).toBeDefined();
        });
    });
});
