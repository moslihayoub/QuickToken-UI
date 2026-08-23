import { z } from 'zod';

export const FigmaColorValueSchema = z.object({
  r: z.number(),
  g: z.number(),
  b: z.number(),
  a: z.number(),
});

export const FigmaVariableResolvedValueSchema = z.object({
  resolvedValue: z.union([FigmaColorValueSchema, z.number(), z.string()]),
  alias: z.string().nullable().optional(),
  aliasName: z.string().optional(),
});

export const FigmaVariableSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['COLOR', 'FLOAT', 'STRING']),
  valuesByMode: z.record(z.string(), z.unknown()).optional(),
  resolvedValuesByMode: z.record(z.string(), FigmaVariableResolvedValueSchema),
  scopes: z.array(z.string()).optional(),
  hiddenFromPublishing: z.boolean().optional(),
  codeSyntax: z.unknown().optional(),
});

export const FigmaExportSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  modes: z.record(z.string(), z.string()),
  variableIds: z.array(z.string()).optional(),
  variables: z.array(FigmaVariableSchema),
});

export const TokenItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  group: z.string(),
  subGroup: z.string(),
  label: z.string(),
  type: z.enum(['COLOR', 'FLOAT', 'STRING', 'UNKNOWN']),
  value: z.unknown(),
  displayValue: z.string(),
  cssValue: z.string(),
  originalData: FigmaVariableSchema,
});
