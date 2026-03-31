import { calculateProgress, truncateText, cn, formatDuration } from './helpers';

describe('helpers', () => {
  it('calculates progress percentage', () => {
    expect(calculateProgress(0, 0)).toBe(0);
    expect(calculateProgress(3, 6)).toBe(50);
    expect(calculateProgress(1, 4)).toBe(25);
  });

  it('truncates text when over max length', () => {
    expect(truncateText('short', 10)).toBe('short');
    expect(truncateText('this is a long sentence', 7)).toBe('this is...');
  });

  it('formats durations correctly', () => {
    expect(formatDuration(500)).toBe('500ms');
    expect(formatDuration(1500)).toBe('1s');
    expect(formatDuration(65000)).toBe('1m 5s');
  });

  it('joins class names safely', () => {
    expect(cn('a', undefined, 'b', false, null, 'c')).toBe('a b c');
  });
});
