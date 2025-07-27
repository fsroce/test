import traverse from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";
import { parseCode } from "@utils/index";

interface IterativeCleanResult {
  unusedVariables: Array<{
    name: string;
    line: number;
    column: number;
  }>;
  unusedFunctions: Array<{
    name: string;
    line: number;
    column: number;
  }>;
  cleanedCode: string;
  iterations: number;
}

export default function removeUnusedVariableAndFunction(code: string): IterativeCleanResult {
  if (!code.trim()) {
    return {
      unusedVariables: [],
      unusedFunctions: [],
      cleanedCode: code,
      iterations: 0,
    };
  }

  // 第一步：移除未使用的函数
  const funcResult = removeUnusedFunctions(code);
  
  // 第二步：移除未使用的变量
  const varResult = removeUnusedVariables(funcResult.cleanedCode);

  return {
    unusedVariables: varResult.unusedVariables,
    unusedFunctions: funcResult.unusedFunctions,
    cleanedCode: varResult.cleanedCode,
    iterations: 1,
  };
}

function removeUnusedFunctions(code: string): {
  unusedFunctions: Array<{ name: string; line: number; column: number }>;
  cleanedCode: string;
} {
  const ast = parseCode(code);
  const unusedFunctions: Array<{ name: string; line: number; column: number }> = [];

  traverse(ast, {
    FunctionDeclaration(path) {
      if (!path.node.id || !t.isIdentifier(path.node.id)) {
        return;
      }

      const funcName = path.node.id.name;
      const binding = path.scope.getBinding(funcName);

      if (!binding || binding.referenced) {
        return;
      }

      // 记录未使用的函数
      if (path.node.id.loc) {
        unusedFunctions.push({
          name: funcName,
          line: path.node.id.loc.start.line,
          column: path.node.id.loc.start.column,
        });
      }

      // 删除整个函数声明
      path.remove();
    },

    VariableDeclarator(path) {
      if (!t.isIdentifier(path.node.id)) {
        return;
      }

      // 只处理函数表达式和箭头函数
      if (!t.isFunctionExpression(path.node.init) && !t.isArrowFunctionExpression(path.node.init)) {
        return;
      }

      const funcName = path.node.id.name;
      const binding = path.scope.getBinding(funcName);

      if (!binding || binding.referenced) {
        return;
      }

      // 记录未使用的函数
      if (path.node.id.loc) {
        unusedFunctions.push({
          name: funcName,
          line: path.node.id.loc.start.line,
          column: path.node.id.loc.start.column,
        });
      }

      // 删除函数变量
      path.remove();
    },
  });

  return {
    unusedFunctions,
    cleanedCode: generate(ast).code,
  };
}

function removeUnusedVariables(code: string): {
  unusedVariables: Array<{ name: string; line: number; column: number }>;
  cleanedCode: string;
} {
  const ast = parseCode(code);
  const unusedVariables: Array<{ name: string; line: number; column: number }> = [];

  traverse(ast, {
    VariableDeclarator(path) {
      if (!t.isIdentifier(path.node.id)) {
        return;
      }

      // 跳过函数表达式和箭头函数（已在函数清理中处理）
      if (t.isFunctionExpression(path.node.init) || t.isArrowFunctionExpression(path.node.init)) {
        return;
      }

      const varName = path.node.id.name;
      const binding = path.scope.getBinding(varName);

      if (!binding || binding.referenced) {
        return;
      }

      // 记录未使用的变量
      if (path.node.id.loc) {
        unusedVariables.push({
          name: varName,
          line: path.node.id.loc.start.line,
          column: path.node.id.loc.start.column,
        });
      }

      // 删除变量
      path.remove();
    },
  });

  return {
    unusedVariables,
    cleanedCode: generate(ast).code,
  };
}