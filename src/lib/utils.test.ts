import { describe, it, expect } from 'vitest';
import { toHex, figmaColorToHex, figmaColorToRgba, getContrastColor } from './utils';

describe('utils', () => {
  it('toHex should correctly convert a 0-1 number to a 2-digit hex', () => {
    expect(toHex(0)).toBe('00');
    expect(toHex(1)).toBe('ff');
    expect(toHex(0.5)).toBe('80');
  });

  it('figmaColorToHex should format correctly without alpha', () => {
    const color = { r: 1, g: 0.5, b: 0, a: 1 };
    expect(figmaColorToHex(color)).toBe('#ff8000');
  });

  it('figmaColorToHex should format correctly with alpha', () => {
    const color = { r: 1, g: 0.5, b: 0, a: 0.5 };
    expect(figmaColorToHex(color)).toBe('#ff800080');
  });

  it('figmaColorToRgba should format correctly', () => {
    const color = { r: 1, g: 0.5, b: 0, a: 0.5 };
    expect(figmaColorToRgba(color)).toBe('rgba(255, 128, 0, 0.50)');
  });

  it('getContrastColor should return #000000 for bright colors', () => {
    const color = { r: 1, g: 1, b: 1, a: 1 };
    expect(getContrastColor(color)).toBe('#000000');
  });

  it('getContrastColor should return #FFFFFF for dark colors', () => {
    const color = { r: 0, g: 0, b: 0, a: 1 };
    expect(getContrastColor(color)).toBe('#FFFFFF');
  });
});
