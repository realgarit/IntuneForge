## 2025-05-15 - [Tooltip Accessibility and Testing]
**Learning:** Adding shadcn/ui `Tooltip` components to improve icon-only button accessibility requires wrapping the component tree in `TooltipProvider`. While this is often handled at the root in the main app, it must be explicitly included in unit tests that render these components to avoid runtime errors.
**Action:** When adding tooltips to components, ensure related tests are updated to include a `TooltipProvider` in the render wrapper.

## 2025-05-16 - [Accessible Selection Pattern]
**Learning:** Custom selection indicators (like those built with `div` and icons) often lack keyboard accessibility and screen reader support. Replacing these with a hidden but semantic `<input type="checkbox">` that overlays the custom visual maintains the design while providing native accessibility features (tab focus, space/enter toggle, and state announcement). For "select all" headers, ensure the native `indeterminate` property is set via a `ref` so screen readers accurately announce the partial selection state.
**Action:** Use hidden native checkboxes for custom selection UIs and manage `indeterminate` state via React refs for header checkboxes.
