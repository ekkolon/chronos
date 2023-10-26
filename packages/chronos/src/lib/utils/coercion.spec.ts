import { ElementRef } from '@angular/core';

import { coerceCssPixelValue, coerceElement } from './coercion';

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

describe('utils:coercion:coerceElement', () => {
  it('should return the native element from an ElementRef', () => {
    const nativeElement = document.createElement('div');
    const elementRef = new ElementRef(nativeElement);
    expect(coerceElement(elementRef)).toBeInstanceOf(HTMLElement);
  });

  it('should return the element itself if it is not an ElementRef', () => {
    const element = document.createElement('div');
    expect(coerceElement(element)).toBe(element);
  });

  it('should return the provided element if it is not an ElementRef or a DOM element', () => {
    const nonElement = 'not an element';
    expect(coerceElement(nonElement)).toBe(nonElement);
  });

  it('should return null for a null input', () => {
    expect(coerceElement(null)).toBeNull();
  });
});
