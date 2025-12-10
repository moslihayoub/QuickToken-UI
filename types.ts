// Raw Figma Variable Structure
export interface FigmaColorValue {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FigmaVariableResolvedValue {
  resolvedValue: FigmaColorValue | number | string;
  alias: string | null;
  aliasName?: string;
}

export interface FigmaVariable {
  id: string;
  name: string;
  description: string;
  type: 'COLOR' | 'FLOAT' | 'STRING';
  valuesByMode: Record<string, any>;
  resolvedValuesByMode: Record<string, FigmaVariableResolvedValue>;
  scopes: string[];
  hiddenFromPublishing: boolean;
  codeSyntax: any;
}

export interface FigmaExport {
  id: string;
  name: string;
  modes: Record<string, string>;
  variableIds: string[];
  variables: FigmaVariable[];
}

// App Internal Structure
export interface TokenItem {
  id: string;
  name: string; // Full name "Color/Primary/500"
  group: string; // "Color"
  subGroup: string; // "Primary"
  label: string; // "500"
  type: 'COLOR' | 'FLOAT' | 'STRING' | 'UNKNOWN';
  value: any; // The raw resolved value
  displayValue: string; // Hex code, "16px", etc.
  cssValue: string; // Valid CSS string
  originalData: FigmaVariable;
}
