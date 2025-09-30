# Challenge Button Flow

## Step 1: Tap [Challenge] Button
```
< Back                 Club Rankings                    [🔍]

┌─────────────────────────────────────────────────────┐
│ 4. [👤] Lisa Park           58% (7-5)    [Challenge] │ ← Tapped
└─────────────────────────────────────────────────────┘
```

## Step 2A: Singles Challenge Modal
```
┌─────────────────────────────────────────────────────┐
│                Challenge Lisa Park                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Match Type                                          │
│ (•) Singles    ( ) Doubles                         │
│                                                     │
│ When would you like to play?                        │
│ ( ) Today      (•) Tomorrow    ( ) This Weekend     │
│ ( ) Next Week  ( ) Flexible                        │
│                                                     │
│ Message (Optional)                                  │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Hey Lisa! Want to play a match?                │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│           [Cancel]        [Send Challenge]          │
└─────────────────────────────────────────────────────┘
```

## Step 2B: Doubles Challenge Modal
```
┌─────────────────────────────────────────────────────┐
│                 Doubles Challenge                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Match Type                                          │
│ ( ) Singles    (•) Doubles                         │
│                                                     │
│ Select 3 players for doubles:                       │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ☑ Lisa Park                                     │ │
│ │ ☑ Mike Chen                                     │ │
│ │ ☑ Sarah Wilson                                  │ │
│ │ ☐ Tom Anderson                                  │ │
│ │ ☐ Alex Johnson                                  │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Partners will be decided when you meet up.          │
│                                                     │
│ When would you like to play?                        │
│ ( ) Today      (•) Tomorrow    ( ) This Weekend     │
│ ( ) Next Week  ( ) Flexible                        │
│                                                     │
│ Message (Optional)                                  │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Want to play doubles tomorrow? We'll figure     │ │
│ │ out teams when we get there!                   │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│           [Cancel]        [Send Invites]            │
└─────────────────────────────────────────────────────┘
```

## Step 3: Confirmation
```
┌─────────────────────────────────────────────────────┐
│                    ✅ Challenge Sent!               │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Your challenge has been sent to Lisa Park.         │
│ You'll be notified when they respond.              │
│                                                     │
│                      [OK]                           │
└─────────────────────────────────────────────────────┘
```

## Step 4A: Lisa Receives Singles Challenge
```
🔴 New Challenge from John Smith

┌─────────────────────────────────────────────────────┐
│ John Smith wants to play singles tomorrow           │
│ "Hey Lisa! Want to play a match?"                  │
│                                                     │
│                   [Decline]    [Accept]             │
└─────────────────────────────────────────────────────┘
```

## Step 4B: Players Receive Doubles Invitation
```
🔴 Doubles Invitation from John Smith

┌─────────────────────────────────────────────────────┐
│ John wants to play doubles tomorrow with:           │
│ • You, Mike Chen, and Sarah Wilson                  │
│ "Want to play doubles tomorrow? We'll figure        │
│ out teams when we get there!"                      │
│                                                     │
│                   [Decline]    [Accept]             │
└─────────────────────────────────────────────────────┘
```

## Step 5A: If Lisa Accepts Singles Challenge
```
✅ Match Confirmed!

Singles Match
📅 Tomorrow
👥 John Smith vs Lisa Park

Contact: John Smith - (555) 123-4567

📋 Community Reminder:
Please honor your commitment. No-shows and unsportsmanlike
behavior can be reported by other players.

[Cancel Match]    [Record Result]
```

## Step 5B: When All 3 Players Accept Doubles Invitation
```
✅ Doubles Match Confirmed!

Doubles Match
📅 Tomorrow
👥 John Smith, Lisa Park, Mike Chen, Sarah Wilson

Teams will be decided when you meet up.

Contacts: 
• John Smith - (555) 123-4567
• Lisa Park - (555) 234-5678  
• Mike Chen - (555) 345-6789
• Sarah Wilson - (555) 456-7890

📋 Community Reminder:
Please honor your commitment. No-shows and unsportsmanlike
behavior can be reported by other players.

[Cancel Match]    [Record Result]
```

## Step 6: If Lisa Declines (Singles or Doubles)
```
┌─────────────────────────────────────────────────────┐
│                Decline Challenge                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Optional: Let John know why                         │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Sorry, I'm traveling tomorrow. Maybe next week? │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│           [Cancel]        [Send Decline]            │
└─────────────────────────────────────────────────────┘
```

## Step 7: John Receives Decline Notification
```
❌ Challenge Declined

Lisa Park declined your challenge.

"Sorry, I'm traveling tomorrow. Maybe next week?"

You can:
• Try challenging again later
• Post in "Looking to Play" instead
• Challenge a different player

                        [OK]
```

## Step 8: Match Cancellation Flow
```
Cancel Match with Lisa Park

Singles Match - Tomorrow

Reason (Optional)
┌─────────────────────────────────────────────────┐
│ Something came up at work, sorry!               │
└─────────────────────────────────────────────────┘

Lisa will be notified immediately.

                        [Keep Match]    [Cancel Match]
```

## Key Features:

**Quick Setup**
- Pre-fills challenger's info
- Smart defaults (singles, tomorrow)
- Optional message field
- Shows target player's current stats for level assessment

**Doubles Support**
- Challenger selects 3 other players for doubles match
- All 3 players receive invitation and must accept
- Teams are decided when players meet up (flexible pairing)
- Automatic contact sharing for all 4 players

**Simple Response Options**
- Accept or Decline only (no complex counter-offers)
- Clear contact sharing after confirmation
- Graceful handling of declined challenges
- Partner invitations handled seamlessly

**Streamlined Flow**
- Bypasses the full "Looking to Play" posting system
- Direct player-to-player invitation
- Reduces friction for spontaneous matches
- Perfect for using rankings to find compatible opponents
- Supports both singles and doubles workflows

**Cancellation**
- Graceful cancellation with optional reason
- Immediate notifications to affected players
- Maintains good etiquette in tennis community
- Simple binary choice: keep or cancel (no rescheduling complexity)

**Integration Points**
- Creates confirmed match in "Looking to Play" section once accepted
- Sends in-app notifications for all status changes
- Shares phone numbers automatically after acceptance (all 4 for doubles)
- Updates player activity feeds
- Links to match recording after completion