import type { ToolResult } from '../../types/tools';

/**
 * Color RGB values
 */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Color HSL values
 */
export interface HSL {
  h: number;
  s: number;
  l: number;
}

/**
 * Convert HEX to RGB
 * @param hex - HEX color string
 * @returns RGB values
 */
export const hexToRgb = (hex: string): ToolResult<RGB> => {
  try {
    let cleanHex = hex.trim().replace(/^#/, '');

    // Handle 3-character hex
    if (cleanHex.length === 3) {
      cleanHex = cleanHex
        .split('')
        .map((char) => char + char)
        .join('');
    }

    if (cleanHex.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      return {
        success: false,
        error: 'Invalid HEX color format',
      };
    }

    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    return {
      success: true,
      data: { r, g, b },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Conversion failed',
    };
  }
};

/**
 * Convert RGB to HEX
 * @param rgb - RGB values
 * @returns HEX color string
 */
export const rgbToHex = (rgb: RGB): ToolResult<string> => {
  try {
    const { r, g, b } = rgb;

    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      return {
        success: false,
        error: 'RGB values must be between 0 and 255',
      };
    }

    const hex =
      '#' +
      [r, g, b]
        .map((value) => {
          const hexValue = Math.round(value).toString(16);
          return hexValue.length === 1 ? '0' + hexValue : hexValue;
        })
        .join('');

    return {
      success: true,
      data: hex.toUpperCase(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Conversion failed',
    };
  }
};

/**
 * Parse RGB string to RGB object
 * @param rgbString - RGB string like "rgb(255, 0, 0)"
 * @returns RGB values
 */
export const parseRgbString = (rgbString: string): ToolResult<RGB> => {
  try {
    const matches = rgbString.match(/\d+/g);

    if (!matches || matches.length < 3) {
      return {
        success: false,
        error: 'Invalid RGB format',
      };
    }

    const r = parseInt(matches[0]);
    const g = parseInt(matches[1]);
    const b = parseInt(matches[2]);

    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      return {
        success: false,
        error: 'RGB values must be between 0 and 255',
      };
    }

    return {
      success: true,
      data: { r, g, b },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Parsing failed',
    };
  }
};

/**
 * Convert RGB to HSL
 * @param rgb - RGB values
 * @returns HSL values
 */
export const rgbToHsl = (rgb: RGB): ToolResult<HSL> => {
  try {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (diff !== 0) {
      s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / diff + 2) / 6;
          break;
        case b:
          h = ((r - g) / diff + 4) / 6;
          break;
      }
    }

    return {
      success: true,
      data: {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Conversion failed',
    };
  }
};

/**
 * Format RGB object to string
 * @param rgb - RGB values
 * @returns RGB string
 */
export const formatRgbString = (rgb: RGB): string => {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
};

/**
 * Format HSL object to string
 * @param hsl - HSL values
 * @returns HSL string
 */
export const formatHslString = (hsl: HSL): string => {
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
};
