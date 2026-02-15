## 2025-05-15 - [Tooltip Accessibility and Testing]
**Learning:** Adding shadcn/ui `Tooltip` components to improve icon-only button accessibility requires wrapping the component tree in `TooltipProvider`. While this is often handled at the root in the main app, it must be explicitly included in unit tests that render these components to avoid runtime errors.
**Action:** When adding tooltips to components, ensure related tests are updated to include a `TooltipProvider` in the render wrapper.

## 2025-05-16 - [Keyboard Shortcuts for Search Accessibility]
**Learning:** Adding a global keyboard shortcut (like '/') to focus the search input significantly improves the experience for keyboard-centric users. Abstracting this logic into a custom hook ensures consistency across different views (App Catalog, My Packages) and simplifies component code.
**Action:** Use the `useSearchShortcut` hook for any new search-heavy views and provide a visual hint (like a `<kbd>` tag) to discover the shortcut.
