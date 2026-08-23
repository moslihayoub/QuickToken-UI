import { z } from 'zod';
import {
  FigmaColorValueSchema,
  FigmaVariableResolvedValueSchema,
  FigmaVariableSchema,
  FigmaExportSchema,
  TokenItemSchema
} from '../lib/schemas';

// Raw Figma Variable Structure
export type FigmaColorValue = z.infer<typeof FigmaColorValueSchema>;
export type FigmaVariableResolvedValue = z.infer<typeof FigmaVariableResolvedValueSchema>;
export type FigmaVariable = z.infer<typeof FigmaVariableSchema>;
export type FigmaExport = z.infer<typeof FigmaExportSchema>;

// App Internal Structure
export type TokenItem = z.infer<typeof TokenItemSchema>;
