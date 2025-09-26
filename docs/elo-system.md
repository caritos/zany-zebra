# Advanced ELO Rating System

This document describes the sophisticated ELO rating system implemented in the tennis club app, based on the system from the `~/src/tennis` app but running entirely in the database for security and consistency.

## Overview

The ELO system provides dynamic player ratings that adjust based on match results, considering factors like:
- **Experience level** (K-factors)
- **Match dominance** (score differential multipliers)
- **Player strength differences** (expected score calculations)
- **Match type** (singles vs doubles)

## Key Features

### 1. Experience-Based K-Factors
Players have different K-factors based on games played:
- **New players** (< 10 games): K = 40 (faster rating changes)
- **Mid-level** (10-29 games): K = 30
- **Established** (30+ games): K = 20 (more stable ratings)

### 2. Score Differential Multipliers
Match dominance affects rating changes:
- **Dominant wins** (6-0, 6-1): 1.5x multiplier (50% bonus)
- **Strong wins** (6-2, 6-3): 1.25x multiplier (25% bonus)
- **Normal wins** (6-4): 1.1x multiplier (10% bonus)
- **Close wins** (7-6, tiebreaks): 0.75x multiplier (reduced points)

### 3. Rating Tiers
- **Elite**: 1600+ (Gold)
- **Advanced**: 1400-1599 (Silver)
- **Intermediate**: 1200-1399 (Bronze)
- **Beginner**: 1000-1199 (Green)
- **New Player**: < 1000 (Blue)

## Database Functions

### Core Functions

#### `calculate_elo_ratings(winner_rating, winner_games, loser_rating, loser_games, match_scores)`
Main ELO calculation function that returns:
- `winner_new_rating`, `loser_new_rating`
- `winner_rating_change`, `loser_rating_change`

#### `record_match_with_elo(...)`
Atomic function that:
1. Records the match in `match_records`
2. Inserts sets in `match_sets`
3. Updates player ratings in `user_ratings`
4. Returns success/failure and rating changes

### Helper Functions

- `get_k_factor(games_played)` - Returns K-factor based on experience
- `get_expected_score(player_rating, opponent_rating)` - Probability calculation
- `get_score_differential_multiplier(scores)` - Dominance multiplier
- `get_rating_tier(rating)` - Returns tier name and color
- `get_initial_rating()` - Returns 1200 (starting rating)

## Test Results

The system has been tested with various scenarios:

```
Basic match (1200 vs 1200): Winner +20, Loser -20
Dominant win (6-0, 6-1): Winner +30, Loser -30 (1.5x multiplier)
Close match (tiebreaks): Winner +15, Loser -15 (0.75x multiplier)
Upset (1000 beats 1400): Winner +36, Loser -36
Experience diff: Established +9, New player -18
```

## Usage

### Recording Matches with ELO Updates

```sql
SELECT record_match_with_elo(
  club_id := 1,
  match_type := 'singles',
  team1_player1_user_id := 'uuid1',
  team1_player1_guest_name := NULL,
  team1_player2_user_id := NULL,
  team1_player2_guest_name := NULL,
  team2_player1_user_id := 'uuid2',
  team2_player1_guest_name := NULL,
  team2_player2_user_id := NULL,
  team2_player2_guest_name := NULL,
  winner := 1,
  game_scores := '{"sets": [{"set_number": 1, "team1_games": 6, "team2_games": 4}]}',
  notes := 'Great match!'
);
```

### Testing ELO Calculations

```sql
SELECT * FROM calculate_elo_ratings(1200, 5, 1200, 5, '6-4,6-3');
```

## Implementation Details

### Security
- All functions use `SECURITY DEFINER` for consistent permissions
- User authorization checked via `club_users` table
- Atomic transactions prevent partial updates

### Performance
- Immutable functions for caching
- Indexed lookups on `user_ratings(user_id, club_id)`
- Batch operations for match recording

### Data Consistency
- Rating updates happen atomically with match recording
- Rollback on any failure prevents inconsistent state
- Match sets automatically generated from game scores

## Migration Status

✅ **Applied**: Migration `042_advanced_elo_rating_system.sql`
✅ **Tested**: All calculation functions working correctly
🔄 **Pending**: Integration with match recording UI components

## Next Steps

1. Update `RecordMatchForm` to use `record_match_with_elo()`
2. Display rating changes in match results
3. Add rating history tracking
4. Implement doubles ELO updates (currently simplified)