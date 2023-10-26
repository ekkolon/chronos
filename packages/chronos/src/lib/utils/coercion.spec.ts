import { coerceCssPixelValue } from './coercion';

describe('utils:coercion:coerceCssPixelValue', () => {
  it('should return an empty string when value is null', () => {
    expect(coerceCssPixelValue(null)).toBe('');
  });

  it('should return an empty string when value is undefined', () => {
    expect(coerceCssPixelValue(undefined)).toBe('');
  });

  it('should return an empty string when value is an empty string', () => {
    expect(coerceCssPixelValue('')).toBe('');
  });

  it('should return a CSS pixel value when value is a number', () => {
    expect(coerceCssPixelValue(100)).toBe('100px');
  });

  it('should return the same string when value is already a string', () => {
    expect(coerceCssPixelValue('50px')).toBe('50px');
  });

  it('should handle zero correctly', () => {
    expect(coerceCssPixelValue(0)).toBe('0px');
  });
});
