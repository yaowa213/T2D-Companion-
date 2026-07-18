import { describe, it, expect } from 'vitest';
import { assertSafeCopy } from './copyGuard';

describe('copyGuard', () => {
  it('allows safe neutral copy', () => {
    const safe = "Welcome to your companion.";
    expect(assertSafeCopy(safe)).toBe(safe);
  });

  it('throws on banned phrases (urgency)', () => {
    expect(() => assertSafeCopy("This is an urgent emergency!")).toThrow();
  });

  it('throws on clinical claims', () => {
    expect(() => assertSafeCopy("We can diagnose your condition.")).toThrow();
    expect(() => assertSafeCopy("Lower your glucose level today.")).toThrow();
  });

  it('strips HTML from input', () => {
    const input = "<strong>Safe</strong> message";
    expect(assertSafeCopy(input)).toBe("Safe message");
  });

  it('normalizes whitespace', () => {
    const input = "  Safe    text  ";
    expect(assertSafeCopy(input)).toBe("Safe text");
  });
});
