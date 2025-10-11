import type { ToolResult } from '../../types/tools';

/**
 * Encode URL component
 * @param input - Input string to encode
 * @returns URL encoded string
 */
export const encodeUrl = (input: string): ToolResult<string> => {
  try {
    if (!input) {
      return {
        success: false,
        error: 'Input cannot be empty',
      };
    }

    const encoded = encodeURIComponent(input);

    return {
      success: true,
      data: encoded,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Encoding failed',
    };
  }
};

/**
 * Decode URL component
 * @param input - URL encoded string
 * @returns Decoded string
 */
export const decodeUrl = (input: string): ToolResult<string> => {
  try {
    if (!input) {
      return {
        success: false,
        error: 'Input cannot be empty',
      };
    }

    const decoded = decodeURIComponent(input);

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

/**
 * Parse URL parameters to object
 * @param url - URL string or query string
 * @returns Object containing URL parameters
 */
export const parseUrlParams = (url: string): ToolResult<Record<string, string>> => {
  try {
    const queryString = url.includes('?') ? url.split('?')[1] : url;
    const params: Record<string, string> = {};

    if (!queryString) {
      return {
        success: true,
        data: params,
      };
    }

    const pairs = queryString.split('&');
    pairs.forEach((pair) => {
      const [key, value] = pair.split('=');
      if (key) {
        params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
      }
    });

    return {
      success: true,
      data: params,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Parsing failed',
    };
  }
};
