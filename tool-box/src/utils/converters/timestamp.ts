import type { ToolResult } from '../../types/tools';

/**
 * Timestamp information
 */
export interface TimestampInfo {
  timestamp: number;
  timestampMs: number;
  date: string;
  iso: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/**
 * Convert timestamp to date
 * @param timestamp - Unix timestamp (seconds or milliseconds)
 * @returns Timestamp information
 */
export const timestampToDate = (timestamp: number): ToolResult<TimestampInfo> => {
  try {
    if (!timestamp) {
      return {
        success: false,
        error: 'Timestamp cannot be empty',
      };
    }

    // Detect if timestamp is in seconds or milliseconds
    let ts = timestamp;
    if (timestamp < 10000000000) {
      ts = timestamp * 1000; // Convert seconds to milliseconds
    }

    const date = new Date(ts);

    if (isNaN(date.getTime())) {
      return {
        success: false,
        error: 'Invalid timestamp',
      };
    }

    const info: TimestampInfo = {
      timestamp: Math.floor(ts / 1000),
      timestampMs: ts,
      date: date.toLocaleString('zh-CN'),
      iso: date.toISOString(),
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
    };

    return {
      success: true,
      data: info,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Conversion failed',
    };
  }
};

/**
 * Convert date to timestamp
 * @param dateString - Date string (ISO format or parseable date string)
 * @returns Timestamp information
 */
export const dateToTimestamp = (dateString: string): ToolResult<TimestampInfo> => {
  try {
    if (!dateString) {
      return {
        success: false,
        error: 'Date cannot be empty',
      };
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return {
        success: false,
        error: 'Invalid date format',
      };
    }

    const timestampMs = date.getTime();

    const info: TimestampInfo = {
      timestamp: Math.floor(timestampMs / 1000),
      timestampMs,
      date: date.toLocaleString('zh-CN'),
      iso: date.toISOString(),
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
    };

    return {
      success: true,
      data: info,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Conversion failed',
    };
  }
};

/**
 * Get current timestamp
 * @returns Current timestamp information
 */
export const getCurrentTimestamp = (): TimestampInfo => {
  const now = new Date();
  const timestampMs = now.getTime();

  return {
    timestamp: Math.floor(timestampMs / 1000),
    timestampMs,
    date: now.toLocaleString('zh-CN'),
    iso: now.toISOString(),
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    second: now.getSeconds(),
  };
};
