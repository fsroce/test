import traverse, { NodePath } from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";

import { parseCode } from "@utils/index";

interface UnusedVarResult {
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
}

// 导出简化版本，只返回清理后的代码
export function removeUnusedVariable(code: string): string {
  const result = removeUnusedVar(code);
  return result.cleanedCode;
}

function removeUnusedVar(code: string): UnusedVarResult {
  const ast = parseCode(code);
  const unusedVariables: Array<{ name: string; line: number; column: number }> = [];
  const unusedFunctions: Array<{ name: string; line: number; column: number }> = [];
  
  // 验证输入
  if (!code.trim()) {
    return {
      unusedVariables: [],
      unusedFunctions: [],
      cleanedCode: code
    };
  }

  traverse(ast, {
    VariableDeclarator(path) {
      // 检查变量是否被使用
      if (t.isIdentifier(path.node.id)) {
        const varName = path.node.id.name;
        const binding = path.scope.getBinding(varName);
        
        // 检查 binding 是否存在且 referenced 为 0
        if (binding && binding.referenced === false) {
          // 判断是函数还是普通变量
          const isFunction = 
          t.isFunctionExpression(path.node.init) ||
          t.isArrowFunctionExpression(path.node.init);
          
          // 记录未使用的变量或函数
          if (path.node.id.loc) {
            const unusedItem = {
              name: varName,
              line: path.node.id.loc.start.line,
              column: path.node.id.loc.start.column
            };
            
            if (isFunction) {
              unusedFunctions.push(unusedItem);
            } else {
              unusedVariables.push(unusedItem);
            }
          }
          
          // 移除变量声明
          if (path.parent && t.isVariableDeclaration(path.parent)) {
            if (path.parent.declarations.length === 1) {
              // 整个声明语句只有这一个变量，删除整个语句
              path.parentPath?.remove();
            } else {
              // 只删除这个变量声明
              path.remove();
            }
          }
        }
      }
    },
    
    // 检查未使用的函数声明
    FunctionDeclaration(path) {
      if (path.node.id && t.isIdentifier(path.node.id)) {
        const funcName = path.node.id.name;
        const binding = path.scope.getBinding(funcName);
        
        if (binding && binding.referenced === false) {
          // 记录未使用的函数
          if (path.node.id.loc) {
            unusedFunctions.push({
              name: funcName,
              line: path.node.id.loc.start.line,
              column: path.node.id.loc.start.column
            });
          }
          
          // 删除整个函数声明
          path.remove();
        } else {
          // 检查函数参数
          checkUnusedFunctionParams(path, unusedVariables);
        }
      }
    },
    
    // 检查函数表达式和箭头函数的参数
    FunctionExpression(path) {
      checkUnusedFunctionParams(path, unusedVariables);
    },
    
    ArrowFunctionExpression(path) {
      checkUnusedFunctionParams(path, unusedVariables);
    }
  });

  return {
    unusedVariables,
    unusedFunctions,
    cleanedCode: generate(ast).code
  };
}

function checkUnusedFunctionParams(
  path: NodePath<t.Function>, 
  unusedVariables: Array<{ name: string; line: number; column: number }>
) {
  const params = path.node.params;
  
  for (const param of params) {
    if (t.isIdentifier(param)) {
      const paramName = param.name;
      const binding = path.scope.getBinding(paramName);
      
      if (binding && binding.referenced === false) {
        // 函数参数未使用，但不删除参数以保持函数签名
        // 只记录到未使用变量列表中供参考
        if (param.loc) {
          unusedVariables.push({
            name: paramName,
            line: param.loc.start.line,
            column: param.loc.start.column
          });
        }
      }
    }
  }
}