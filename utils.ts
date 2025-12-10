import { FigmaColorValue, TokenItem } from './types';

export const toHex = (n: number): string => {
  const hex = Math.round(n * 255).toString(16);
  return hex.length === 1 ? '0' + hex : hex;
};

export const figmaColorToHex = (color: FigmaColorValue): string => {
  const r = toHex(color.r);
  const g = toHex(color.g);
  const b = toHex(color.b);
  const a = color.a < 1 ? toHex(color.a) : '';
  return `#${r}${g}${b}${a}`;
};

export const figmaColorToRgba = (color: FigmaColorValue): string => {
  return `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, ${color.a.toFixed(2)})`;
};

// Determine if text on top of color should be black or white
export const getContrastColor = (color: FigmaColorValue): string => {
  // Calculate luminance
  const luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

export const downloadBlob = (content: string, filename: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const jsonToCSV = (items: TokenItem[]): string => {
  const headers = ['Group', 'Name', 'Value', 'Type', 'CSS Value'];
  const rows = items.map(item => [
    `"${item.group}"`,
    `"${item.name}"`,
    `"${item.displayValue}"`,
    `"${item.type}"`,
    `"${item.cssValue}"`
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};
