// Tennis scoring utility functions

export type TennisScore = 0 | 15 | 30 | 40 | 'AD';
export type GameScore = {
  player1: TennisScore;
  player2: TennisScore;
};

/**
 * Get the next tennis score in sequence
 */
export function getNextScore(currentScore: TennisScore): TennisScore {
  switch (currentScore) {
    case 0:
      return 15;
    case 15:
      return 30;
    case 30:
      return 40;
    case 40:
    case 'AD':
      return 'AD';
    default:
      return 0;
  }
}

/**
 * Convert tennis score to display string
 */
export function formatTennisScore(score: TennisScore): string {
  if (score === 'AD') {
    return 'AD';
  }
  return score.toString();
}

/**
 * Check if a player has won the game
 */
export function checkGameWinner(score: GameScore): 'player1' | 'player2' | null {
  const { player1, player2 } = score;

  // Regular win conditions
  if (player1 === 40 && (player2 === 0 || player2 === 15 || player2 === 30)) {
    if (player1 === 40) return 'player1';
  }
  if (player2 === 40 && (player1 === 0 || player1 === 15 || player1 === 30)) {
    if (player2 === 40) return 'player2';
  }

  // Advantage win
  if (player1 === 'AD') return 'player1';
  if (player2 === 'AD') return 'player2';

  return null;
}

/**
 * Calculate match duration in formatted string
 */
export function formatMatchDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}
