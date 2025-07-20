import * as parser from "@babel/parser";

// TODO: parser定制化
export default function parseCode(code: string) {
  // 基本校验
  if (!code || typeof code !== "string") {
    throw new Error("Code must be a non-empty string");
  }

  // 语法校验
  if (code.trim().length === 0) {
    throw new Error("Code cannot be empty");
  }

  try {
    return parser.parse(code, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
      strictMode: false,
    });
  } catch (error) {
    throw new Error(
      `Parse error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
