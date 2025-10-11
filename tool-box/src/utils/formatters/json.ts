import type { ToolResult, JsonFormatOptions } from '../../types/tools';

/**
 * Format JSON string
 * @param input - JSON string to format
 * @param options - Formatting options
 * @returns Formatted JSON string
 */
export const formatJson = (
  input: string,
  options: JsonFormatOptions = { indent: 2, sortKeys: false }
): ToolResult<string> => {
  try {
    if (!input.trim()) {
      return {
        success: false,
        error: 'Input cannot be empty',
      };
    }

    let parsed = JSON.parse(input);

    if (options.sortKeys) {
      parsed = sortObjectKeys(parsed);
    }

    const formatted = JSON.stringify(parsed, null, options.indent);

    return {
      success: true,
      data: formatted,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Formatting failed',
    };
  }
};

/**
 * Minify JSON string
 * @param input - JSON string to minify
 * @returns Minified JSON string
 */
export const minifyJson = (input: string): ToolResult<string> => {
  try {
    if (!input.trim()) {
      return {
        success: false,
        error: 'Input cannot be empty',
      };
    }

    const parsed = JSON.parse(input);
    const minified = JSON.stringify(parsed);

    return {
      success: true,
      data: minified,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Minification failed',
    };
  }
};

/**
 * Validate JSON string
 * @param input - JSON string to validate
 * @returns Validation result
 */
export const validateJson = (input: string): ToolResult<boolean> => {
  try {
    if (!input.trim()) {
      return {
        success: false,
        error: 'Input cannot be empty',
      };
    }

    JSON.parse(input);

    return {
      success: true,
      data: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid JSON',
    };
  }
};

/**
 * Recursively sort object keys
 * @param obj - Object to sort
 * @returns Sorted object
 */
function sortObjectKeys<T>(obj: T): T {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys) as T;
  }

  const sorted = Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
      return acc;
    }, {} as Record<string, unknown>);

  return sorted as T;
}
