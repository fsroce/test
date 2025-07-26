import traverse from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";

import { parseCode } from "@utils/index";

export default function deadCodeHandler(code: string): string {
  const ast = parseCode(code);
  
  traverse(ast, {
    // 优化 if 语句
    IfStatement(path) {
      const { test, consequent, alternate } = path.node;
      
      // if (true) -> 直接用 then 分支替换
      if (t.isBooleanLiteral(test) && test.value) {
        path.replaceWith(consequent);
        return;
      }
      
      // if (false) -> 用 else 分支替换，如果没有 else 就删除
      if (t.isBooleanLiteral(test) && !test.value) {
        if (alternate) {
          path.replaceWith(alternate);
        } else {
          path.remove();
        }
        return;
      }
    },
    
    // 优化 switch 语句
    SwitchStatement(path) {
      const { discriminant, cases } = path.node;

      // 只处理字面量常量
      if (t.isStringLiteral(discriminant) || t.isNumericLiteral(discriminant)) {
        const targetValue = discriminant.value;
        const executeStatements: t.Statement[] = [];
        let startExecuting = false;
        
        // 找到匹配的 case，然后执行所有后续 case（fall-through）
        for (const caseNode of cases) {
          // 开始执行条件：匹配的case 或 已经在执行中 或 default case
          if (!startExecuting) {
            if (caseNode.test === null) {
              // default case
              startExecuting = true;
            } else if (t.isStringLiteral(caseNode.test) || t.isNumericLiteral(caseNode.test)) {
              if (caseNode.test.value === targetValue) {
                startExecuting = true;
              }
            }
          }
          
          if (startExecuting) {
            executeStatements.push(...caseNode.consequent);
            
            // 检查是否有 break，如果有就停止
            const hasBreak = caseNode.consequent.some(stmt => t.isBreakStatement(stmt));
            if (hasBreak) {
              // 移除 break 语句，用块语句包装保持作用域
              const filteredStatements = executeStatements.filter(stmt => !t.isBreakStatement(stmt));
              const blockStatement = t.blockStatement(filteredStatements);
              path.replaceWith(blockStatement);
              return;
            }
          }
        }
        
        // 没有 break，执行所有匹配的语句
        if (executeStatements.length > 0) {
          const blockStatement = t.blockStatement(executeStatements);
          path.replaceWith(blockStatement);
        } else {
          path.remove();
        }
        return;
      }
    },
    
    // 移除 return/throw 后的死代码
    BlockStatement(path) {
      const statements = path.node.body;
      let terminatorIndex = -1;
      
      // 找到第一个终止语句
      for (let i = 0; i < statements.length; i++) {
        if (t.isReturnStatement(statements[i]) || t.isThrowStatement(statements[i])) {
          terminatorIndex = i;
          break;
        }
      }
      
      // 移除终止语句后的所有代码
      if (terminatorIndex !== -1 && terminatorIndex < statements.length - 1) {
        statements.splice(terminatorIndex + 1);
      }
    }
  });

  return generate(ast).code
}