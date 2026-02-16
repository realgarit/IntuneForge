# App Catalog Logo Fix Plan

## Problem Analysis

### Current Issues
1. **Shared State Bug**: `iconErrors` and `iconFallbacks` are component-level state that persists across re-renders
2. **Race Conditions**: Async state updates in `handleIconError` cause cascading failures
3. **No Proper Cleanup**: Error states aren't reset when filtered apps change
4. **Unreliable Fallback**: Google favicon service can also fail

### Root Cause
```tsx
// These states are shared across ALL app cards
const [iconErrors, setIconErrors] = useState<Set<string>>(new Set());
const [iconFallbacks, setIconFallbacks] = useState<Map<string, string>>(new Map());
```

When filtering occurs, React reuses component instances, but the error state persists from previous apps.

## Solution Architecture

### 1. Create `AppIcon` Component
A self-contained component that manages its own error state:

```tsx
interface AppIconProps {
  app: CatalogApp;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

Features:
- Local error state (not shared)
- Multi-level fallback chain
- Loading placeholder
- Proper unmount cleanup

### 2. Fallback Strategy
1. **Primary**: Original `app.iconUrl`
2. **Fallback 1**: DuckDuckGo favicon (`https://icons.duckduckgo.com/ip3/{domain}.ico`)
3. **Fallback 2**: UI avatar with app initials

### 3. Update AppCatalog.tsx
Replace inline icon rendering with `<AppIcon />` component in:
- Grid view cards
- Table view rows  
- Customize view header

### 4. Icon URL Audit
Review and update unreliable URLs in `app-catalog.ts`:
- Replace GitHub raw URLs with more reliable sources
- Add backup URLs for critical apps
- Consider local icon assets for popular apps

## Implementation Steps

1. Create `src/components/AppIcon.tsx`
2. Update `AppCatalog.tsx` to use new component
3. Audit and fix icon URLs in `app-catalog.ts`
4. Test with all apps in the catalog

## Testing Checklist

- [ ] All apps display icons initially
- [ ] Icons show fallback when primary fails
- [ ] Filtering doesn't break icons
- [ ] No "switching" behavior when navigating
- [ ] Customize view shows correct icon
- [ ] Table view shows correct icons
