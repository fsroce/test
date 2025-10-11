/**
 * Tool category enumeration
 */
export enum ToolCategory {
  ENCODER = 'encoder',
  CONVERTER = 'converter',
  FORMATTER = 'formatter',
  GENERATOR = 'generator',
  TESTER = 'tester',
}

/**
 * Tool metadata interface
 */
export interface ToolMetadata {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ToolCategory;
  path: string;
}

/**
 * Tool operation result
 */
export interface ToolResult<T = string> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Encoding options
 */
export interface EncodingOptions {
  urlSafe?: boolean;
  format?: 'standard' | 'url';
}

/**
 * JSON formatting options
 */
export interface JsonFormatOptions {
  indent: number;
  sortKeys: boolean;
}

/**
 * Hash algorithm types
 */
export type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512';

/**
 * Color format types
 */
export type ColorFormat = 'hex' | 'rgb' | 'hsl';

/**
 * Regex flags
 */
export interface RegexFlags {
  global: boolean;
  ignoreCase: boolean;
  multiline: boolean;
  dotAll?: boolean;
  unicode?: boolean;
  sticky?: boolean;
}

/**
 * Regex match result
 */
export interface RegexMatch {
  match: string;
  index: number;
  groups?: Record<string, string>;
}
