# Club Matches Tab Wireframe

## Layout Structure

```
┌─────────────────────────────────────────┐
│                                         │
│  ┌───────────────────────────────────┐  │
│  │    [+] Record Match               │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Match History                          │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Today, 3:30 PM                    │  │
│  │                                   │  │
│  │ 🇪🇸 M. Granollers [5]      3 7 7 │  │
│  │ 🇫🇮 H. Zeballos [5]    ✓         │  │
│  │                                   │  │
│  │ 🇬🇧 J. Salisbury [6]      6 6 5 │  │
│  │ 🇬🇧 N. Skupski [6]              │  │
│  │                                   │  │
│  │ Mixed Doubles • Court 3          │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Yesterday, 5:00 PM               │  │
│  │                                   │  │
│  │ 🇺🇸 S. Williams         6 7    │  │
│  │                                   │  │
│  │ 🇯🇵 N. Osaka       ✓   7 9    │  │
│  │                                   │  │
│  │ Singles • Court 1               │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Dec 15, 2:15 PM                  │  │
│  │                                   │  │
│  │ 🇦🇺 Team Blue          6 4 6   │  │
│  │                                   │  │
│  │ 🇦🇺 Team Red      ✓   4 6 7   │  │
│  │                                   │  │
│  │ Doubles • Court 2               │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

## Component Details

### 1. Record Match Button
- **Style**: Primary action button with plus icon
- **Position**: Top of the tab, full width with padding
- **Action**: Opens match recording form/modal
- **Color**: Brand green (#4CAF50) or Wimbledon green

### 2. Match Cards
Each match card contains:

#### Header Section
- **Date/Time**: Top left, relative format (Today, Yesterday) or actual date for older
- **Font**: Small, secondary color

#### Players Section
- **Layout**: Vertical list of players/teams
- **Elements**:
  - Country flag emoji (optional)
  - Player name
  - Seed number in brackets [n] if applicable
  - Winner indicator: ✓ checkmark on winning side
  - Score display: Right-aligned, separated by spaces

#### Score Display Format
- **Singles**: `6 7` (two sets)
- **Doubles/Mixed**: `3 7 7` or `6 6 5` (three sets)
- **Tiebreak**: Can show as `7` when tiebreak won
- **Alignment**: Right-aligned, monospace font for consistency
- **Winner highlight**: Winning scores in bold or brand color

#### Footer Section
- **Match Type**: Singles/Doubles/Mixed Doubles
- **Court**: Court number
- **Separator**: Bullet point • between type and court

### 3. Sorting & Filtering (Optional Enhancement)
```
┌─────────────────────────────────────────┐
│  [All Matches ▼] [All Types ▼]         │
└─────────────────────────────────────────┘
```

### 4. Empty State
```
┌─────────────────────────────────────────┐
│                                         │
│            🎾                           │
│                                         │
│      No matches recorded yet            │
│                                         │
│   Record your first match to see        │
│         it appear here                  │
│                                         │
└─────────────────────────────────────────┘
```

## Interaction States

### Match Card - Pressed
- Light background color change
- Opens match details view

### Record Match Button - Pressed
- Darker shade of primary color
- Opens recording interface

## Typography

- **Date/Time**: 12px, #666
- **Player Names**: 16px, #000
- **Seed Numbers**: 14px, #666
- **Scores**: 18px, monospace, #000 (winner bold)
- **Match Type/Court**: 14px, #666
- **Winner Checkmark**: 20px, green (#4CAF50)

## Spacing

- Card padding: 16px
- Card margin bottom: 12px
- Score number spacing: 8px between sets
- Line height for players: 1.5

## Color Scheme

- Background: #F5F5F5
- Card background: #FFFFFF
- Primary action: #4CAF50 (Wimbledon green)
- Text primary: #000000
- Text secondary: #666666
- Winner indicator: #4CAF50
- Card border: #E0E0E0 (1px, subtle)