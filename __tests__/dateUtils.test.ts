import {
  compareDates,
  formatDate,
  formatPeriod,
} from '@/src/utils/dateUtils';

describe('formatDate', () => {
  it('formats a valid ISO date correctly', () => {
    expect(formatDate('2024-01-15')).toBe('Jan 15, 2024');
    expect(formatDate('2023-12-25')).toBe('Dec 25, 2023');
    expect(formatDate('2024-07-04')).toBe('Jul 4, 2024');
  });

  it('returns "Invalid Date" for invalid input', () => {
    expect(formatDate('invalid')).toBe('Invalid Date');
    expect(formatDate('')).toBe('Invalid Date');
    expect(formatDate('not-a-date')).toBe('Invalid Date');
  });

  it('handles edge case dates', () => {
    expect(formatDate('2024-02-29')).toBe('Feb 29, 2024'); // Leap year
    expect(formatDate('2000-01-01')).toBe('Jan 1, 2000');
  });
});

describe('formatPeriod', () => {
  it('formats same month period correctly', () => {
    const result = formatPeriod('2024-01-01', '2024-01-31');
    expect(result).toBe('Jan 1 – 31, 2024');
  });

  it('formats same year, different month period correctly', () => {
    const result = formatPeriod('2024-01-01', '2024-02-15');
    expect(result).toBe('Jan 1 – Feb 15, 2024');
  });

  it('formats different year period correctly', () => {
    const result = formatPeriod('2023-12-15', '2024-01-15');
    expect(result).toBe('Dec 15, 2023 – Jan 15, 2024');
  });

  it('returns "Invalid Period" for invalid dates', () => {
    expect(formatPeriod('invalid', '2024-01-31')).toBe('Invalid Period');
    expect(formatPeriod('2024-01-01', 'invalid')).toBe('Invalid Period');
    expect(formatPeriod('invalid', 'also-invalid')).toBe('Invalid Period');
  });
});

describe('compareDates', () => {
  it('sorts dates ascending by default', () => {
    const dates = ['2024-03-15', '2024-01-01', '2024-06-30'];
    const sorted = dates.sort((a, b) => compareDates(a, b));
    expect(sorted).toEqual(['2024-01-01', '2024-03-15', '2024-06-30']);
  });

  it('sorts dates ascending when specified', () => {
    const dates = ['2024-03-15', '2024-01-01', '2024-06-30'];
    const sorted = dates.sort((a, b) => compareDates(a, b, true));
    expect(sorted).toEqual(['2024-01-01', '2024-03-15', '2024-06-30']);
  });

  it('sorts dates descending when specified', () => {
    const dates = ['2024-03-15', '2024-01-01', '2024-06-30'];
    const sorted = dates.sort((a, b) => compareDates(a, b, false));
    expect(sorted).toEqual(['2024-06-30', '2024-03-15', '2024-01-01']);
  });

  it('handles dates across different years', () => {
    const dates = ['2023-12-31', '2024-01-01', '2022-06-15'];
    const sorted = dates.sort((a, b) => compareDates(a, b, true));
    expect(sorted).toEqual(['2022-06-15', '2023-12-31', '2024-01-01']);
  });

  it('handles equal dates', () => {
    expect(compareDates('2024-01-15', '2024-01-15')).toBe(0);
  });
});

