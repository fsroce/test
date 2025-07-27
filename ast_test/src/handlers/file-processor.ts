import { readFile, writeFile, access, constants, mkdir } from "fs/promises";
import { _isWindows } from "@/constants";
import path from "path";
export const readFileAsync = async (filePath: string): Promise<string> => {
  validateFilePath(filePath);
  try {
    await access(filePath, constants.R_OK);
  } catch {
    throw new Error(`File ${filePath} does not exist or cannot be read.`);
  }
  return await readFile(filePath, "utf8");
};

export const writeFileAsync = async (
  filePath: string,
  content: string
): Promise<void> => {
  validateFilePath(filePath);
  // 检查目录是否存在且可写
  const dir = path.dirname(filePath);
  try {
    await mkdir(dir, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create directory ${dir}: ${error}`);
  }

  return await writeFile(filePath, content);
};

const validateFilePath = (filePath: string): void => {

  // 1. 基本检查
  if (!filePath || typeof filePath !== "string") {
    throw new Error("File path must be a non-empty string");
  }

  // 2. 路径遍历攻击防护
  if (filePath.includes("..") || filePath.includes("~")) {
    throw new Error("Path traversal not allowed");
  }

  // 3. 非法字符检查
  const invalidChars = _isWindows
    ? /[<>"|?*\x00-\x1f]/ // Windows允许反斜杠和冒号(用于驱动器)
    : /[<>:"|?*\x00-\x1f]/; // Unix系统保持原有限制
  if (invalidChars.test(filePath)) {
    throw new Error("Invalid characters in file path");
  }

  // 4. 路径长度检查
  if (filePath.length > 255) {
    throw new Error("File path too long");
  }

  // 5. 绝对路径检查
  if (!path.isAbsolute(filePath)) {
    throw new Error("File path must be absolute");
  }
};
