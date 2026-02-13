## 2025-05-15 - [Tooltip Accessibility and Testing]
**Learning:** Adding shadcn/ui `Tooltip` components to improve icon-only button accessibility requires wrapping the component tree in `TooltipProvider`. While this is often handled at the root in the main app, it must be explicitly included in unit tests that render these components to avoid runtime errors.
**Action:** When adding tooltips to components, ensure related tests are updated to include a `TooltipProvider` in the render wrapper.
