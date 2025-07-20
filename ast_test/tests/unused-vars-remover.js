const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;
const fs = require("fs");

function removeUnusedVariables(code) {
  const declaredVars = new Map(); // 存储声明的变量
  const usedVars = new Set(); // 存储使用的变量
  const toRemove = new Set(); // 需要移除的节点
  
  const ast = parser.parse(code);
  
  // 第一遍遍历：收集所有变量声明
  traverse(ast, {
    VariableDeclarator: (path) => {
      const name = path.node.id.name;
      declaredVars.set(name, {
        path: path,
        declarationPath: path.findParent(p => p.isVariableDeclaration()),
        scope: path.scope
      });
    },
    
    FunctionDeclaration: (path) => {
      const name = path.node.id?.name;
      if (name) {
        declaredVars.set(name, {
          path: path,
          declarationPath: path,
          scope: path.scope.parent
        });
      }
    }
  });

  // 第二遍遍历：收集所有变量使用
  traverse(ast, {
    Identifier: (path) => {
      // 跳过声明位置
      if (path.isReferencedIdentifier()) {
        usedVars.add(path.node.name);
      }
    },
    
    MemberExpression: (path) => {
      // 处理对象属性访问 obj.prop
      if (path.node.object.type === 'Identifier') {
        usedVars.add(path.node.object.name);
      }
    }
  });

  // 找出未使用的变量
  console.log("=== 分析阶段 ===");
  for (const [varName, varInfo] of declaredVars) {
    if (!usedVars.has(varName)) {
      console.log(`未使用的变量: ${varName}`);
      toRemove.add(varInfo);
    }
  }

  // 移除未使用的变量声明
  console.log("=== 移除阶段 ===");
  for (const varInfo of toRemove) {
    const { path, declarationPath } = varInfo;
    
    if (path.isFunctionDeclaration()) {
      // 移除整个函数声明
      path.remove();
    } else if (path.isVariableDeclarator()) {
      const declaration = declarationPath;
      
      // 如果声明中只有一个变量，移除整个声明
      if (declaration.node.declarations.length === 1) {
        declaration.remove();
      } else {
        // 如果有多个变量，只移除这一个
        path.remove();
      }
    }
  }
  
  return generator(ast, {}, code).code;
}

// 使用示例
const fileName = __dirname + "/unused-vars-input.js";
const code = fs.readFileSync(fileName).toString();

console.log("原始代码:");
console.log(code);
console.log("\n" + "=".repeat(50) + "\n");

const result = removeUnusedVariables(code);

console.log("处理后的代码:");
console.log(result);

fs.writeFileSync(__dirname + "/unused-vars-output.js", result);