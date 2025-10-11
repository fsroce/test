import type { ToolResult, EncodingOptions } from '../../types/tools';

/**
 * Encode string to Base64
 * @param input - Input string to encode
 * @param options - Encoding options
 * @returns Encoded Base64 string
 */
export const encodeBase64 = (
  input: string,
  options: EncodingOptions = {}
): ToolResult<string> => {
  try {
    if (!input) {
      return {
        success: false,
        error: 'Input cannot be empty',
      };
    }

    // Handle Unicode characters properly
    const encoded = btoa(unescape(encodeURIComponent(input)));

    // URL-safe Base64 if requested
    const result = options.urlSafe
      ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      : encoded;

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Encoding failed',
    };
  }
};

/**
 * Decode Base64 string
 * @param input - Base64 encoded string
 * @param options - Decoding options
 * @returns Decoded string
 */
export const decodeBase64 = (
  input: string,
  options: EncodingOptions = {}
): ToolResult<string> => {
  try {
    if (!input) {
      return {
        success: false,
        error: 'Input cannot be empty',
      };
    }

    // Handle URL-safe Base64
    let base64 = input;
    if (options.urlSafe) {
      base64 = input.replace(/-/g, '+').replace(/_/g, '/');
      // Add padding if needed
      while (base64.length % 4) {
        base64 += '=';
      }
    }

    const decoded = decodeURIComponent(escape(atob(base64)));

    return {
      success: true,
      data: decoded,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Decoding failed',
    };
  }
};
