# Edit Listing Feature - Tab-Based UI Plan

## Overview
Transform the current single-scroll EditListing screen into a tab-based interface similar to the web-template, with horizontal tab chips at the top and swipeable tab content below.

## Reference Implementation
- **Web Template**: `web-template-main/src/containers/EditListingPage/EditListingWizard/EditListingWizard.js`
- **Tab Logic**: `web-template-main/src/containers/EditListingPage/EditListingWizard/EditListingWizardTab.js`

## Tab Structure

### Available Tabs (from web-template)
1. **DETAILS** - Listing type, category, title, description, custom fields
2. **PRICING** - Price configuration (for booking process)
3. **PRICING_AND_STOCK** - Price and stock management (for purchase process)
4. **DELIVERY** - Delivery options (pickup/shipping)
5. **LOCATION** - Location/address
6. **AVAILABILITY** - Availability schedule (for booking process)
7. **PHOTOS** - Listing images
8. **STYLE** - Card style (alternative to photos)

### Tab Selection Logic
Tabs are determined by:
- **Transaction Process** (booking, purchase, negotiation, inquiry)
- **Listing Type Configuration** (from `config.listing.listingTypes`)

**Process-based tab arrays:**
- `default-booking`: [DETAILS, LOCATION (maybe), PRICING, AVAILABILITY, PHOTOS/STYLE]
- `default-purchase`: [DETAILS, PRICING_AND_STOCK, DELIVERY (maybe), PHOTOS/STYLE]
- `default-negotiation`: [DETAILS, LOCATION (maybe), PRICING (maybe), PHOTOS/STYLE]
- `default-inquiry`: [DETAILS, LOCATION (maybe), PRICING (maybe), PHOTOS/STYLE]

**Conditional tabs:**
- LOCATION: Only if `displayLocation(listingTypeConfig)` is true
- PRICING: Only if `displayPrice(listingTypeConfig)` is true
- DELIVERY: Only if `displayDeliveryPickup` or `displayDeliveryShipping` is true
- PHOTOS vs STYLE: Based on `requireListingImage(listingTypeConfig)`

## Tab Disabled/Clickable Logic

### Key Functions (from web-template)

#### `tabsActive(isNew, listing, tabs, config)`
Determines which tabs are active/clickable:
- **Edit Mode**: All tabs are active (user can navigate freely)
- **New Listing Flow**: Tab is active only if:
  - It's the first tab (DETAILS), OR
  - The previous tab is completed (`tabCompleted(previousTab, listing, config)`)

#### `tabCompleted(tab, listing, config)`
Checks if a tab's required data is present:

- **DETAILS**: `title`, `description`, `listingType`, `transactionProcessAlias`, `unitType`, and all required custom fields
- **PRICING**: `price` exists
- **PRICING_AND_STOCK**: `price` exists
- **DELIVERY**: `shippingEnabled` or `pickupEnabled` is true
- **LOCATION**: `geolocation` and `publicData.location.address` exist
- **AVAILABILITY**: `availabilityPlan` exists
- **PHOTOS**: `images.length > 0`
- **STYLE**: `cardStyle` exists

### Implementation Notes
- Disabled tabs should be visually distinct (grayed out, reduced opacity)
- Disabled tabs should not be clickable
- In new listing flow, users can only access tabs sequentially
- In edit mode, all tabs are accessible

## UI Structure

### Layout
```
┌─────────────────────────────────────┐
│  [Tab Chip] [Tab Chip] [Tab Chip]  │ ← Horizontal ScrollView (chips)
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │                               │ │
│  │   Tab Content (Full Width)    │ │ ← Horizontal FlatList (content)
│  │                               │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

### Components Needed

1. **Tab Chips Container**
   - Horizontal `ScrollView` at top
   - Each chip shows tab label
   - Visual indicators:
     - Active tab: Highlighted/selected state
     - Completed tab: Checkmark or filled indicator
     - Disabled tab: Grayed out, non-clickable
   - Chips scroll horizontally if needed

2. **Tab Content Container**
   - Horizontal `FlatList` below chips
   - Each item is screen width
   - `pagingEnabled={true}` for snap-to-page behavior
   - `showsHorizontalScrollIndicator={false}`
   - `scrollEnabled={true}` for swipe navigation
   - Sync with tab chip selection
   - **Lazy Loading**: Use `useLazyLoadingTabs` hook to only render visible tabs
     - First tab loads immediately
     - Other tabs load when they become viewable (user scrolls to them)
     - Improves initial render performance
     - Reduces memory usage

3. **Tab Content Components**
   - Each existing component becomes a tab content item:
     - `EditListingDetailsTab` (combines: SelectListingType, SelectListingCategory, EditListingTitle, EditListingDescription, EditListingCustomFields)
     - `EditListingPricingTab` (EditListingPricing, EditListingPriceVariations)
     - `EditListingPricingAndStockTab` (EditListingPricingAndStock)
     - `EditListingDeliveryTab` (EditListingDelivery)
     - `EditListingLocationTab` (EditListingLocation)
     - `EditListingAvailabilityTab` (EditListingAvailability)
     - `EditListingPhotosTab` (EditListingPhotos)
     - `EditListingStyleTab` (if needed)

## Implementation Steps

### Phase 1: Core Tab Infrastructure
1. **Create Tab Constants**
   - Define tab constants: `DETAILS`, `PRICING`, `PRICING_AND_STOCK`, `DELIVERY`, `LOCATION`, `AVAILABILITY`, `PHOTOS`, `STYLE`
   - File: `src/features/editListing/constants/tabs.ts`

2. **Create Tab Utility Functions**
   - `tabsForListingType(processName, listingTypeConfig)` - Determine which tabs to show
   - `tabCompleted(tab, listing, config)` - Check if tab is completed
   - `tabsActive(isNew, listing, tabs, config)` - Determine which tabs are active
   - `tabLabelAndSubmit(intl, tab, isNewListingFlow, isPriceDisabled, processName)` - Get tab labels
   - File: `src/features/editListing/editListingTabs.helper.ts` (parallel to `editListing.helper.ts`)

3. **Create Tab Chip Component**
   - Component: `src/features/editListing/components/TabChip.tsx`
   - Props: `label`, `isActive`, `isCompleted`, `isDisabled`, `onPress`
   - Styling: Active, completed, disabled states

4. **Create Tab Chips Container**
   - Component: `src/features/editListing/components/TabChipsContainer.tsx`
   - Horizontal ScrollView with TabChip components
   - Handles chip selection and scrolling to active chip

### Phase 2: Tab Content Structure
5. **Refactor EditListing Screen**
   - Update `src/features/editListing/screens/EditListing.tsx`
   - Remove current ScrollView with all components
   - Add:
     - TabChipsContainer at top
     - Horizontal FlatList for tab content
     - State management for active tab index
   - **Integrate `useLazyLoadingTabs` hook**:
     ```typescript
     import useLazyLoadingTabs from '@hooks/useLazyLoadingTabs';
     
     // Define tab components array
     const tabComponents = [
       EditListingDetailsTab,
       EditListingPricingTab,
       // ... other tabs based on listing type
     ];
     
     // Use lazy loading hook
     const {
       data: lazyTabsData,
       viewabilityConfigCallbackPairs,
       getItemLayout,
     } = useLazyLoadingTabs({
       tabs: tabComponents,
       extraFnInViewable: (viewableElement) => {
         // Sync active tab when tab becomes viewable
         setActiveTabIndex(viewableElement.index);
       },
     });
     
     // In FlatList renderItem:
     const renderTabItem = ({ item, index }) => {
       // Handle placeholder (value === 1)
       if (item === 1) {
         return <TabPlaceholder />; // Loading placeholder
       }
       // Render actual tab component
       const TabComponent = item;
       return <TabComponent />;
     };
     ```
   - Sync FlatList scroll with chip selection

6. **Create Tab Content Wrapper**
   - Component: `src/features/editListing/components/TabContentWrapper.tsx`
   - Wraps each tab's content in a ScrollView
   - Ensures proper width (screen width)
   - Handles form submission per tab
   - **Handles lazy loading placeholder**: 
     - Render loading/placeholder state when value is `1` (placeholder from hook)
     - Render actual tab content when tab data is available
     - Optional: Show skeleton loader while tab is loading

7. **Create Individual Tab Content Components**
   - `EditListingDetailsTab.tsx` - Combines details-related components
   - `EditListingPricingTab.tsx` - Pricing components
   - `EditListingPricingAndStockTab.tsx` - Pricing and stock
   - `EditListingDeliveryTab.tsx` - Delivery options
   - `EditListingLocationTab.tsx` - Location
   - `EditListingAvailabilityTab.tsx` - Availability (already exists, may need wrapper)
   - `EditListingPhotosTab.tsx` - Photos
   - `EditListingStyleTab.tsx` - Style (if needed)

### Phase 3: Tab Navigation & State
8. **Implement Tab Navigation Logic**
   - Handle tab chip press → scroll FlatList to corresponding index
   - Handle FlatList scroll → update active chip
   - Prevent navigation to disabled tabs
   - Auto-scroll to active chip if it's off-screen

9. **Implement Tab Completion Logic**
   - Track completed tabs based on form data
   - Update chip visual state (completed indicator)
   - Enable next tab when current tab is completed

10. **Implement Tab Save/Submit Logic**
    - Each tab can save independently
    - In new listing flow: Save draft → navigate to next tab
    - In edit mode: Save and stay on current tab
    - Last tab: Publish listing (for new listings)

### Phase 4: Integration & Polish
11. **Integrate with Existing Components**
    - Ensure all existing components work within tab structure
    - Update form submission handlers
    - Maintain form state across tabs

12. **Add Loading States**
    - Show loading indicator during tab save operations
    - Disable navigation during save

13. **Add Error Handling**
    - Display errors per tab
    - Prevent navigation if current tab has errors

14. **Add Animations**
    - Smooth transitions between tabs
    - Chip selection animations
    - Tab completion animations

## Technical Considerations

### Lazy Loading Implementation
- **Hook Behavior**:
  - `useLazyLoadingTabs` returns data array where first item is actual tab, rest are placeholders (`1`)
  - When a tab becomes viewable (via `viewabilityConfigCallbackPairs`), placeholder is replaced with actual tab component
  - `getItemLayout` is pre-calculated for screen width, optimizing FlatList performance
  - `minimumViewTime: 100ms` prevents premature loading during fast scrolling
  - `itemVisiblePercentThreshold: 90%` ensures tab is mostly visible before loading
  
- **Placeholder Handling**:
  - Check if `item === 1` in `renderItem` to detect placeholder
  - Show loading skeleton or empty state for placeholders
  - Tab components only mount when their placeholder is replaced

- **Performance Benefits**:
  - Initial render only includes first tab
  - Reduces memory usage (unused tabs not in memory)
  - Faster initial load time
  - Smooth scrolling with pre-calculated layouts

### State Management
- Use React Hook Form context (already in place)
- Track active tab index in component state
- Track completed tabs (derived from form data)
- Track disabled tabs (derived from `tabsActive` logic)
- Sync active tab state in `extraFnInViewable` callback from lazy loading hook

### Navigation
- Use `useRef` for FlatList to programmatically scroll
- Use `onMomentumScrollEnd` to detect tab changes from swipe
- Use `scrollToIndex` to navigate to specific tab
- **Lazy Loading Integration**:
  - `useLazyLoadingTabs` provides `viewabilityConfigCallbackPairs` for FlatList
  - Hook automatically handles tab loading when tabs become viewable
  - Use `extraFnInViewable` callback to sync active tab state when tab loads
  - Hook provides `getItemLayout` for optimized FlatList rendering

### Form Handling
- Each tab can have its own submit handler
- Form state persists across tabs (React Hook Form)
- Validation per tab before allowing navigation

### Performance
- **Lazy Loading**: Use `useLazyLoadingTabs` hook for optimal performance
  - Only first tab renders initially
  - Tabs load on-demand when they become viewable
  - Reduces initial render time and memory usage
  - Automatically handles placeholder rendering
- Use `FlatList` with `removeClippedSubviews={true}` for better performance
- Use `getItemLayout` from hook for FlatList optimization (pre-calculated layouts)
- Memoize tab completion calculations
- Tab content components only mount when tab becomes visible

## Files to Create/Modify

### New Files
- `src/features/editListing/constants/tabs.ts`
- `src/features/editListing/editListingTabs.helper.ts` - Tab utility functions (parallel to `editListing.helper.ts`)
- `src/features/editListing/components/TabChip.tsx`
- `src/features/editListing/components/TabChipsContainer.tsx`
- `src/features/editListing/components/TabContentWrapper.tsx`
- `src/features/editListing/components/tabs/EditListingDetailsTab.tsx`
- `src/features/editListing/components/tabs/EditListingPricingTab.tsx`
- `src/features/editListing/components/tabs/EditListingPricingAndStockTab.tsx`
- `src/features/editListing/components/tabs/EditListingDeliveryTab.tsx`
- `src/features/editListing/components/tabs/EditListingLocationTab.tsx`
- `src/features/editListing/components/tabs/EditListingPhotosTab.tsx`

### Modified Files
- `src/features/editListing/screens/EditListing.tsx` - Major refactor
- Existing component files may need minor adjustments for tab structure

## Dependencies
- React Native `FlatList`, `ScrollView`
- React Hook Form (already in use)
- **`useLazyLoadingTabs` hook** from `@hooks/useLazyLoadingTabs` (already available)
- Existing hooks: `useIsShowAvailability`, `useIsShowPricing`, etc.
- Configuration context (already in use)
- Screen width helper from `@helpers` (used by `useLazyLoadingTabs`)

## Testing Considerations
- Test tab navigation (chip press, swipe)
- Test disabled tab logic (new vs edit flow)
- Test tab completion detection
- Test form submission per tab
- Test tab save and navigation flow
- Test with different listing types and processes

## Future Enhancements
- Tab progress indicator (e.g., "Step 2 of 5")
- Tab validation feedback
- Tab auto-save
- Tab undo/redo
- Tab preview mode

---

## Implementation Decisions & Notes

### Phase 1 Implementation (Completed)

#### Decision 1: Form Data Structure for Tab Completion
**Decision**: Adapted `tabCompleted` function to work with form data instead of listing entity.
- **Rationale**: We're using React Hook Form, so we check form values directly rather than a listing entity
- **Implementation**: Created form data extraction logic that separates public/private fields from the `fields` object
- **Note**: Custom fields are stored in the `fields` object with prefixes (`pub_` or `priv_`)

#### Decision 2: Tab Component Mapping
**Decision**: Created a mapping object for tab components instead of a switch statement.
- **Rationale**: More flexible and easier to extend as new tabs are added
- **Implementation**: Used a `Record<TabType, React.ComponentType | null>` pattern
- **Note**: Only DETAILS tab is implemented initially; other tabs return `null` until implemented

#### Decision 3: Screen Width Handling
**Decision**: Used `useWindowDimensions` hook instead of importing a `width` constant.
- **Rationale**: The `width` helper import path was unclear; `useWindowDimensions` is a standard React Native hook
- **Implementation**: Applied in both `EditListingDetailsTab` and main `EditListing` screen
- **Note**: Each tab component uses `useWindowDimensions` to ensure proper width

#### Decision 4: Tab State Calculation
**Decision**: Used `useMemo` for tab states calculation to optimize performance.
- **Rationale**: Tab states depend on form data, listing type, and config - memoization prevents unnecessary recalculations
- **Implementation**: Combined `tabsActive` and `tabCompleted` results into a single `tabStates` memo
- **Note**: States are recalculated when form data, tabs array, or config changes

#### Decision 5: Lazy Loading Integration
**Decision**: Integrated `useLazyLoadingTabs` hook directly in the main screen component.
- **Rationale**: Keeps lazy loading logic centralized and makes it easy to sync with tab navigation
- **Implementation**: 
  - Used `extraFnInViewable` callback to sync active tab index when tabs become viewable
  - Created `TabPlaceholder` component for unloaded tabs (shows loading spinner)
  - Applied `getItemLayout` and `viewabilityConfigCallbackPairs` to FlatList
- **Note**: Placeholder value is `1` (number), checked with `item === 1` in renderItem

#### Decision 6: Tab Navigation Sync
**Decision**: Implemented bidirectional sync between tab chips and FlatList.
- **Rationale**: Users can navigate via chip press or swipe - both should stay in sync
- **Implementation**:
  - Chip press → `scrollToIndex` on FlatList
  - FlatList scroll → `onMomentumScrollEnd` updates active index
  - Added `onScrollToIndexFailed` handler for edge cases
- **Note**: Used `Math.round(offsetX / width)` to calculate index from scroll position

#### Decision 7: Publish Button Placement
**Decision**: Show publish button only on the last tab for new listings.
- **Rationale**: Matches web-template behavior - publish happens after completing all tabs
- **Implementation**: Conditional rendering based on `isNewListing` and `activeTabIndex === tabs.length - 1`
- **Note**: Button is placed below the FlatList in a container with border

#### Decision 8: Initial Tab State
**Decision**: Show only DETAILS tab initially when listing type is not selected.
- **Rationale**: Matches web-template behavior - other tabs depend on listing type configuration
- **Implementation**: `tabsForListingType` returns `[DETAILS]` when listing type is undefined
- **Note**: Tabs array updates when listing type is selected via `useMemo` dependency

#### Decision 9: File Structure for Tab Helpers
**Decision**: Created `editListingTabs.helper.ts` parallel to `editListing.helper.ts` instead of `utils/tabHelpers.ts`.
- **Rationale**: Maintains consistency with existing file structure pattern (helper files at feature root level)
- **Implementation**: Moved all tab utility functions to `editListingTabs.helper.ts` and updated imports
- **Note**: This follows the same naming convention as `editListing.helper.ts` for better discoverability

#### Decision 10: Draft Listing Detection for `isNewListing` Calculation
**Decision**: Created `selectIsNewListingFlow` selector to centralize the logic for determining new listing flow.
- **Rationale**: 
  - In web-template: `isNewListingFlow = isNewURI || isDraftURI` (both new and draft are treated as new listing flow)
  - Drafts have a `listingId` but `state === 'draft'`, so they should be treated as new listing flow
  - Published listings have `listingId` and `state !== 'draft'`, so they should be treated as edit mode
  - Moving logic to selector makes it reusable, testable, and follows Redux best practices
- **Implementation**: 
  - Created `selectIsNewListingFlow(state, wizardKey, listingId)` selector in `editListing.slice.ts`
  - Selector checks: `!listingId || (currentListing?.attributes?.state === 'draft')`
  - Component uses: `const isNewListing = useTypedSelector(state => selectIsNewListingFlow(state, wizardKey, listingId))`
- **Behavior**:
  - New listings (no `listingId`): `isNewListing = true` → tabs active only if previous tab completed
  - Draft listings (has `listingId` but `state === 'draft'`): `isNewListing = true` → tabs active only if previous tab completed
  - Published listings (has `listingId` and `state !== 'draft'`): `isNewListing = false` → tabs active if `hasListingType` (edit mode)
- **Note**: This ensures drafts follow the same tab activation logic as new listings (sequential completion), while published listings allow free navigation between tabs. The selector pattern makes this logic reusable across the codebase.

### Files Created
1. ✅ `src/features/editListing/constants/tabs.ts` - Tab constants
2. ✅ `src/features/editListing/editListingTabs.helper.ts` - Tab utility functions (parallel to `editListing.helper.ts`)
3. ✅ `src/features/editListing/components/TabChip.tsx` - Individual tab chip component
4. ✅ `src/features/editListing/components/TabChipsContainer.tsx` - Container for tab chips
5. ✅ `src/features/editListing/components/tabs/EditListingDetailsTab.tsx` - First tab implementation

### Files Modified
1. ✅ `src/features/editListing/screens/EditListing.tsx` - Major refactor to use tabs and lazy loading

### Next Steps
- [ ] Create remaining tab components (PRICING, PRICING_AND_STOCK, DELIVERY, LOCATION, AVAILABILITY, PHOTOS, STYLE)
- [ ] Add tab-specific save/submit handlers
- [ ] Implement tab validation before allowing navigation
- [ ] Add i18n support for tab labels
- [ ] Test with different listing types and processes
- [ ] Add error handling per tab
- [ ] Add loading states during tab save operations
