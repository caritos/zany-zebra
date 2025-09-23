import {
  getNextScore,
  formatTennisScore,
  checkGameWinner,
  formatMatchDuration,
  type TennisScore,
  type GameScore,
} from '@/utils/tennis-scoring';

describe('Tennis Scoring Utilities', () => {
  describe('getNextScore', () => {
    it('should progress from 0 to 15', () => {
      expect(getNextScore(0)).toBe(15);
    });

    it('should progress from 15 to 30', () => {
      expect(getNextScore(15)).toBe(30);
    });

    it('should progress from 30 to 40', () => {
      expect(getNextScore(30)).toBe(40);
    });

    it('should stay at AD when at 40', () => {
      expect(getNextScore(40)).toBe('AD');
    });

    it('should stay at AD when already at AD', () => {
      expect(getNextScore('AD')).toBe('AD');
    });
  });

  describe('formatTennisScore', () => {
    it('should format numeric scores as strings', () => {
      expect(formatTennisScore(0)).toBe('0');
      expect(formatTennisScore(15)).toBe('15');
      expect(formatTennisScore(30)).toBe('30');
      expect(formatTennisScore(40)).toBe('40');
    });

    it('should format advantage as AD', () => {
      expect(formatTennisScore('AD')).toBe('AD');
    });
  });

  describe('checkGameWinner', () => {
    it('should return null when no winner', () => {
      const score: GameScore = { player1: 15, player2: 30 };
      expect(checkGameWinner(score)).toBeNull();
    });

    it('should return player1 when player1 wins with 40', () => {
      const scenarios: GameScore[] = [
        { player1: 40, player2: 0 },
        { player1: 40, player2: 15 },
        { player1: 40, player2: 30 },
      ];

      scenarios.forEach(score => {
        expect(checkGameWinner(score)).toBe('player1');
      });
    });

    it('should return player2 when player2 wins with 40', () => {
      const scenarios: GameScore[] = [
        { player1: 0, player2: 40 },
        { player1: 15, player2: 40 },
        { player1: 30, player2: 40 },
      ];

      scenarios.forEach(score => {
        expect(checkGameWinner(score)).toBe('player2');
      });
    });

    it('should return player1 when player1 has advantage', () => {
      const score: GameScore = { player1: 'AD', player2: 40 };
      expect(checkGameWinner(score)).toBe('player1');
    });

    it('should return player2 when player2 has advantage', () => {
      const score: GameScore = { player1: 40, player2: 'AD' };
      expect(checkGameWinner(score)).toBe('player2');
    });

    it('should return null at deuce (40-40)', () => {
      const score: GameScore = { player1: 40, player2: 40 };
      expect(checkGameWinner(score)).toBeNull();
    });
  });

  describe('formatMatchDuration', () => {
    it('should format minutes less than 60', () => {
      expect(formatMatchDuration(0)).toBe('0m');
      expect(formatMatchDuration(30)).toBe('30m');
      expect(formatMatchDuration(59)).toBe('59m');
    });

    it('should format exactly 60 minutes as 1h 0m', () => {
      expect(formatMatchDuration(60)).toBe('1h 0m');
    });

    it('should format hours and minutes correctly', () => {
      expect(formatMatchDuration(75)).toBe('1h 15m');
      expect(formatMatchDuration(120)).toBe('2h 0m');
      expect(formatMatchDuration(145)).toBe('2h 25m');
    });

    it('should handle large durations', () => {
      expect(formatMatchDuration(300)).toBe('5h 0m');
      expect(formatMatchDuration(425)).toBe('7h 5m');
    });
  });
});
