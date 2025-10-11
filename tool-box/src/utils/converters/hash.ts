import type { ToolResult, HashAlgorithm } from '../../types/tools';

/**
 * Convert ArrayBuffer to hex string
 * @param buffer - ArrayBuffer to convert
 * @returns Hex string
 */
const bufferToHex = (buffer: ArrayBuffer): string => {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Generate hash using Web Crypto API
 * @param input - Input string
 * @param algorithm - Hash algorithm
 * @returns Hash string
 */
export const generateHash = async (
  input: string,
  algorithm: HashAlgorithm
): Promise<ToolResult<string>> => {
  try {
    if (!input) {
      return {
        success: false,
        error: 'Input cannot be empty',
      };
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    // Map algorithm names to Web Crypto API names
    const algoMap: Record<HashAlgorithm, string> = {
      'MD5': 'MD5', // Note: MD5 is not supported by Web Crypto API
      'SHA-1': 'SHA-1',
      'SHA-256': 'SHA-256',
      'SHA-512': 'SHA-512',
    };

    if (algorithm === 'MD5') {
      return {
        success: false,
        error: 'MD5 is not supported by Web Crypto API. Please use SHA-1 or SHA-256.',
      };
    }

    const hashBuffer = await crypto.subtle.digest(algoMap[algorithm], data);
    const hashHex = bufferToHex(hashBuffer);

    return {
      success: true,
      data: hashHex,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Hash generation failed',
    };
  }
};

/**
 * Generate multiple hashes at once
 * @param input - Input string
 * @param algorithms - Array of algorithms to use
 * @returns Object with hash results
 */
export const generateMultipleHashes = async (
  input: string,
  algorithms: HashAlgorithm[]
): Promise<Record<HashAlgorithm, ToolResult<string>>> => {
  const results = await Promise.all(
    algorithms.map(async (algo) => ({
      algorithm: algo,
      result: await generateHash(input, algo),
    }))
  );

  return results.reduce(
    (acc, { algorithm, result }) => {
      acc[algorithm] = result;
      return acc;
    },
    {} as Record<HashAlgorithm, ToolResult<string>>
  );
};
