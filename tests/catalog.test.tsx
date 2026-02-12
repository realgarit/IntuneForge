import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AppCatalog } from '../src/components/AppCatalog';
import { APP_CATALOG } from '../src/lib/app-catalog';
import { Dialog, DialogContent } from '../src/components/ui/dialog';

// Mock ResizeObserver for ScrollArea/Dialog
global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

describe('AppCatalog', () => {
    const renderInDialog = (ui: React.ReactNode) => {
        return render(
            <Dialog open={true}>
                <DialogContent>
                    {ui}
                </DialogContent>
            </Dialog>
        );
    };

    beforeEach(() => {
        global.fetch = vi.fn();
    });

    it('renders the catalog apps', async () => {
        const onSelect = vi.fn();
        renderInDialog(<AppCatalog onSelect={onSelect} />);

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

        const input = screen.getByPlaceholderText('Search apps...');
        fireEvent.change(input, { target: { value: 'Firefox' } });

        await waitFor(() => {
             expect(screen.getByText('Mozilla Firefox (ESR)')).toBeDefined();
             // 7-Zip should be hidden
             expect(screen.queryByText('7-Zip 23.01 (x64)')).toBeNull();
        });
    });

    it('handles single app selection and download', async () => {
        const onSelect = vi.fn();

        // Mock fetch
        const mockBlob = new Blob(['fake installer content'], { type: 'application/octet-stream' });
        (global.fetch as any).mockResolvedValue({
            ok: true,
            blob: () => Promise.resolve(mockBlob),
        } as Response);

        renderInDialog(<AppCatalog onSelect={onSelect} />);

        await waitFor(() => {
             expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
        });

        // Find "Package" buttons
        const allPackageButtons = screen.getAllByRole('button', { name: /package/i });
        fireEvent.click(allPackageButtons[0]);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/proxy?url='));
            expect(onSelect).toHaveBeenCalled();
        });

        // Verify the file argument
        const args = onSelect.mock.calls[0];
        expect(args[0]).toHaveLength(1);
        expect(args[1]).toBe(true);
        expect(args[2]).toBeInstanceOf(File);
    });

    it('handles bulk selection', async () => {
        const onSelect = vi.fn();
        renderInDialog(<AppCatalog onSelect={onSelect} />);

        await waitFor(() => {
            expect(screen.getByText(APP_CATALOG[0].name)).toBeDefined();
        });

        // Find checkboxes. They are inputs with type checkbox.
        // Note: My implementation uses <input type="checkbox" /> so getByRole('checkbox') should work
        const checkboxes = screen.getAllByRole('checkbox');

        // Click first two checkboxes
        fireEvent.click(checkboxes[0]);
        fireEvent.click(checkboxes[1]);

        // Find "Add 2 to Library" button
        const addButton = screen.getByRole('button', { name: /Add 2 to Library/i });
        fireEvent.click(addButton);

        expect(onSelect).toHaveBeenCalled();
        const args = onSelect.mock.calls[0];
        expect(args[0]).toHaveLength(2); // 2 apps
        expect(args[1]).toBe(false); // immediateDownload = false
        expect(args[2]).toBeUndefined(); // no file
    });

    it('handles download error', async () => {
        const onSelect = vi.fn();

        // Mock fetch error
        (global.fetch as any).mockRejectedValue(new Error('Network error'));

        renderInDialog(<AppCatalog onSelect={onSelect} />);

        await waitFor(() => {
             expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
        });

        const allPackageButtons = screen.getAllByRole('button', { name: /package/i });
        fireEvent.click(allPackageButtons[0]);

        await waitFor(() => {
            expect(screen.getByText('Network error')).toBeDefined();
        });
    });
});
