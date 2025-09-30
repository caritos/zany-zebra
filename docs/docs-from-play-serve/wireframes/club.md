# Club Page Wireframe

## Overview
The Club page is the main hub for tennis club discovery, membership management, and club creation. It follows the Wimbledon-themed design system with green and purple accents.

## Layout Structure

```
┌─────────────────────────────────────┐
│         Status Bar                  │
├─────────────────────────────────────┤
│                                     │
│    🎾  Welcome Banner (Optional)    │
│         First time user info        │
│         [View FAQ]  [Dismiss X]     │
│                                     │
├─────────────────────────────────────┤
│                                     │
│    MY CLUBS (count)                 │
│    ─────────────────                │
│                                     │
│    ┌─────────────────────────────┐ │
│    │ 🎾 Club Name            📍 │ │
│    │ Member since: date          │ │
│    │ Members: 42 • Ranking: #3   │ │
│    │ [View Club] [Leave]         │ │
│    └─────────────────────────────┘ │
│                                     │
│    ┌─────────────────────────────┐ │
│    │ 🎾 Another Club        📍  │ │
│    │ Member since: date          │ │
│    │ Members: 28 • Ranking: #7   │ │
│    │ [View Club] [Leave]         │ │
│    └─────────────────────────────┘ │
│                                     │
│    + Show more clubs...            │
│                                     │
├─────────────────────────────────────┤
│                                     │
│    DISCOVER CLUBS NEAR YOU          │
│    ─────────────────────           │
│                                     │
│    Sort by: [Distance ▼]           │
│    Filter: [All Clubs ▼]           │
│                                     │
│    ┌─────────────────────────────┐ │
│    │ 🎾 Nearby Club       0.5mi │ │
│    │ Public • 156 members        │ │
│    │ ⭐ 4.8 rating               │ │
│    │ Courts: 6 • Level: All      │ │
│    │ [Join Club]                 │ │
│    └─────────────────────────────┘ │
│                                     │
│    ┌─────────────────────────────┐ │
│    │ 🎾 Local Tennis Club  1.2mi │ │
│    │ Private • 89 members        │ │
│    │ ⭐ 4.6 rating               │ │
│    │ Courts: 4 • Level: Inter.   │ │
│    │ [Request to Join]           │ │
│    └─────────────────────────────┘ │
│                                     │
│    [Load More Clubs]               │
│                                     │
├─────────────────────────────────────┤
│                                     │
│    Can't find your club?           │
│    Create a new one for your       │
│    community.                      │
│                                     │
│    ┌─────────────────────────────┐ │
│    │   ➕ Create Club            │ │
│    └─────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│         Tab Navigation              │
│    🎾 Clubs    👤 Profile          │
└─────────────────────────────────────┘
```

## Component Details

### 1. Welcome Banner (First-time users only)
- **Purpose**: Onboard new users to the club functionality
- **Content**: 
  - Welcome message
  - Brief description of features
  - Link to FAQ
  - Dismiss button (X)
- **Behavior**: Shows once, can be dismissed permanently

### 2. My Clubs Section
- **Purpose**: Display clubs user has joined
- **Content per club card**:
  - Club icon/logo (tennis ball as default)
  - Club name
  - Distance indicator (if location enabled)
  - Member since date
  - Total members count
  - Club ranking (if applicable)
  - Action buttons: View Club, Leave Club
- **States**:
  - Empty state: "You haven't joined any clubs yet. Discover clubs near you below!"
  - Collapsed: Shows first 2 clubs + "Show more"
  - Expanded: Shows all clubs

### 3. Discover Clubs Section
- **Purpose**: Find and join new clubs
- **Controls**:
  - Sort dropdown: Distance (default), Members, Rating, Name
  - Filter dropdown: All Clubs, Public Only, Private Only, Accepting Members
- **Content per club card**:
  - Club icon/logo
  - Club name
  - Distance from user
  - Public/Private status
  - Member count
  - Rating (stars)
  - Number of courts
  - Skill level
  - Join button (varies by club type):
    - Public clubs: "Join Club" (instant)
    - Private clubs: "Request to Join"
    - Full clubs: "Join Waitlist"
- **States**:
  - Loading: Skeleton cards
  - Empty: "No clubs found in your area. Try expanding your search radius or create a new club!"
  - Error: "Unable to load clubs. Please try again."
  - Pagination: "Load More" button or infinite scroll

### 4. Create Club CTA
- **Purpose**: Allow users to create new clubs
- **Design**: Prominent button with plus icon
- **Action**: Navigate to club creation flow

## User Flows

### Flow 1: Joining a Public Club
1. User browses "Discover Clubs"
2. Taps "Join Club" on a public club
3. Confirmation modal: "Join [Club Name]?"
4. Success feedback
5. Club moves to "My Clubs" section

### Flow 2: Requesting Private Club Access
1. User browses "Discover Clubs"
2. Taps "Request to Join" on private club
3. Optional: Fill out request form (reason for joining)
4. Submit request
5. Confirmation: "Request sent. You'll be notified when approved."

### Flow 3: Creating a New Club
1. User taps "Create Club"
2. Navigate to creation form:
   - Club name
   - Description
   - Location
   - Public/Private
   - Court details
   - Membership rules
3. Review & Submit
4. Club created, user is admin

### Flow 4: Viewing Club Details
1. User taps "View Club" from My Clubs
2. Navigate to club detail page:
   - Club info
   - Members list
   - Rankings/Leaderboard
   - Upcoming matches
   - Club chat/forum

## Design Tokens (Wimbledon Theme)

### Colors
- Primary Green: `$green9` (#1a4d3a)
- Secondary Purple: `$purple9`
- Gold accent: `$gold9`
- Background: `$background`
- Card background: `$neutral1`
- Borders: `$neutral4`

### Spacing
- Page padding: `$lg`
- Card padding: `$md`
- Gap between sections: `$xl`
- Gap between cards: `$md`

### Typography
- Section headers: `H2`, `$heading` font
- Club names: `H3`, `$heading` font
- Body text: `$body` font
- Small text: `$1` size

### Border Radius
- Cards: `$racket`
- Buttons: `$racket`

## Responsive Behavior

### Portrait Mode (Default)
- Single column layout
- Full-width cards
- Stacked sections

### Landscape Mode
- Two-column grid for club cards
- Side-by-side My Clubs and Discover sections

### Tablet
- Wider cards with more horizontal space
- Possible three-column grid for clubs
- More information visible per card

## Accessibility

- All interactive elements have touch targets ≥ 44x44pt
- Color contrast ratios meet WCAG AA standards
- Screen reader labels for all icons
- Keyboard navigation support
- Focus indicators on all interactive elements

## Performance Considerations

- Lazy load club cards as user scrolls
- Cache club data for offline viewing
- Optimistic UI updates for join/leave actions
- Skeleton screens during loading
- Pagination or virtual scrolling for large lists

## State Management

### Data Requirements
- User's club memberships
- Available clubs (filtered by location/preferences)
- Club details (members, courts, ratings)
- Pending join requests

### Cache Strategy
- Cache user's clubs for offline access
- Refresh nearby clubs on app focus
- Real-time updates for club member counts

## Error Handling

- Network errors: Show cached data with refresh option
- Location errors: Allow manual location entry
- Join failures: Clear error messages with retry option
- Rate limiting: Queue actions and notify user

## Future Enhancements

1. **Club Search**: Add search bar for finding clubs by name
2. **Map View**: Toggle between list and map view
3. **Club Recommendations**: ML-based club suggestions
4. **Social Features**: See which friends are in clubs
5. **Club Events**: Show upcoming tournaments/events
6. **Advanced Filters**: Filter by amenities, coaching, price
7. **Club Reviews**: Allow members to rate and review clubs
8. **Notifications**: Push notifications for club updates