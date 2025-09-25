// Types for detailed tennis match scoring

export interface TieBreaker {
  team1_points: number;
  team2_points: number;
}

export interface SetScore {
  team1_games: number;
  team2_games: number;
  tie_breaker: TieBreaker | null;
}

export interface GameScores {
  sets: SetScore[];
  match_format: 'best_of_3' | 'best_of_5';
}

export interface MatchResult {
  team1_sets_won: number;
  team2_sets_won: number;
  winner: 1 | 2 | null;
  game_scores: GameScores;
}

// Helper functions for tennis scoring
export class TennisScoring {
  static isValidSetScore(team1Games: number, team2Games: number): boolean {
    // For amateur play, any score is valid as long as it's non-negative
    // and at least one team has scored
    return team1Games >= 0 && team2Games >= 0 && (team1Games > 0 || team2Games > 0);
  }

  static needsTieBreaker(team1Games: number, team2Games: number): boolean {
    return team1Games === 6 && team2Games === 6;
  }

  static isValidTieBreaker(team1Points: number, team2Points: number): boolean {
    // In amateur tennis, tie breakers can end in ties, so any score is valid
    // as long as at least one team has some points
    return team1Points >= 0 && team2Points >= 0 && (team1Points > 0 || team2Points > 0);
  }

  static getSetWinner(set: SetScore): 1 | 2 | null {
    if (set.tie_breaker) {
      if (set.tie_breaker.team1_points > set.tie_breaker.team2_points) return 1;
      if (set.tie_breaker.team2_points > set.tie_breaker.team1_points) return 2;
      return null; // Tied tie breaker
    }
    if (set.team1_games > set.team2_games) return 1;
    if (set.team2_games > set.team1_games) return 2;
    return null; // Tied set (shouldn't happen with valid tennis scores, but for safety)
  }

  static calculateMatchResult(sets: SetScore[], matchFormat: 'best_of_3' | 'best_of_5'): MatchResult {
    let team1SetsWon = 0;
    let team2SetsWon = 0;

    sets.forEach(set => {
      const setWinner = this.getSetWinner(set);
      if (setWinner === 1) {
        team1SetsWon++;
      } else if (setWinner === 2) {
        team2SetsWon++;
      }
      // If setWinner is null (tied set), neither team gets a point
    });

    const setsNeededToWin = matchFormat === 'best_of_3' ? 2 : 3;
    let winner: 1 | 2 | null;
    if (team1SetsWon >= setsNeededToWin) {
      winner = 1;
    } else if (team2SetsWon >= setsNeededToWin) {
      winner = 2;
    } else {
      winner = team1SetsWon > team2SetsWon ? 1 : team2SetsWon > team1SetsWon ? 2 : null;
    }

    return {
      team1_sets_won: team1SetsWon,
      team2_sets_won: team2SetsWon,
      winner,
      game_scores: {
        sets,
        match_format: matchFormat
      }
    };
  }

  static formatSetScore(set: SetScore): string {
    const baseScore = `${set.team1_games}-${set.team2_games}`;
    if (set.tie_breaker) {
      const winnerPoints = Math.max(set.tie_breaker.team1_points, set.tie_breaker.team2_points);
      const loserPoints = Math.min(set.tie_breaker.team1_points, set.tie_breaker.team2_points);
      return `${baseScore}(${loserPoints})`;
    }
    return baseScore;
  }
}