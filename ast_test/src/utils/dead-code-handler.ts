import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import { Node } from "@babel/types";
import * as t from "@babel/types";

interface DeadCodeResult {
  unreachableCode: Array<{
    line: number;
    column: number;
    code: string;
    reason: string;
  }>;
  cleanedCode: string;
}

// 函数式CFG节点
interface CFGNode {
  id: number;
  statements: t.Statement[];
  successors: number[];
  predecessors: number[];
  reachable: boolean;
}

// 函数式CFG
interface ControlFlowGraph {
  nodes: Map<number, CFGNode>;
  entry: number;
  nodeCounter: number;
}

// TODO: parser定制化
function parseCode(code: string) {
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

export default function deadCodeHandler(code: string): DeadCodeResult {
  const ast = parseCode(code);
  const result: DeadCodeResult = {
    unreachableCode: [],
    cleanedCode: code,
  };

  // 一次遍历同时检测和移除
  findAndRemoveDeadCode(ast, result);

  return result;
}

function findAndRemoveDeadCode(ast: Node, result: DeadCodeResult) {
  // 完整控制流分析
  traverse(ast, {
    Function(path) {
      const functionBody = path.node.body;
      if (t.isBlockStatement(functionBody)) {
        const unreachableStmts = analyzeControlFlow(functionBody.body);
        
        // 记录不可达代码信息
        for (const stmt of unreachableStmts) {
          if (stmt.loc) {
            result.unreachableCode.push({
              line: stmt.loc.start.line,
              column: stmt.loc.start.column,
              code: getCodeFromNode(stmt),
              reason: 'Unreachable code detected by control flow analysis'
            });
          }
        }
        
        // 从AST中移除不可达代码
        removeStatementsFromBlock(functionBody, unreachableStmts);
      }
    },
    
    Program(path) {
      const unreachableStmts = analyzeControlFlow(path.node.body);
      
      // 记录不可达代码信息
      for (const stmt of unreachableStmts) {
        if (stmt.loc) {
          result.unreachableCode.push({
            line: stmt.loc.start.line,
            column: stmt.loc.start.column,
            code: getCodeFromNode(stmt),
            reason: 'Unreachable code detected by control flow analysis'
          });
        }
      }
      
      // 从AST中移除不可达代码
      removeStatementsFromProgram(path.node, unreachableStmts);
    }
  });

  // 生成清理后的代码
  result.cleanedCode = generate(ast).code;
}

function getCodeFromNode(node: t.Statement): string {
  try {
    return generate(node).code;
  } catch {
    return node.type;
  }
}

// 完整的控制流分析
function analyzeControlFlow(statements: t.Statement[]): t.Statement[] {
  const unreachableStmts: t.Statement[] = [];
  
  // 分析每个语句的可达性
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    
    // 检查前面是否有无条件终止语句
    const hasUnconditionalTerminator = checkUnconditionalTerminatorBefore(statements, i);
    
    if (hasUnconditionalTerminator) {
      unreachableStmts.push(stmt);
      continue;
    }
    
    // 递归分析嵌套语句中的不可达代码
    const nestedUnreachable = analyzeNestedStatements(stmt);
    unreachableStmts.push(...nestedUnreachable);
  }
  
  return unreachableStmts;
}

// 检查前面是否有无条件终止语句
function checkUnconditionalTerminatorBefore(statements: t.Statement[], currentIndex: number): boolean {
  for (let i = 0; i < currentIndex; i++) {
    const stmt = statements[i];
    
    // 简单终止语句
    if (t.isReturnStatement(stmt) || t.isThrowStatement(stmt)) {
      return true;
    }
    
    // 检查if语句是否无条件终止
    if (t.isIfStatement(stmt)) {
      const hasUnconditionalTermination = checkIfStatementTermination(stmt);
      if (hasUnconditionalTermination) {
        return true;
      }
    }
  }
  
  return false;
}

// 检查if语句是否无条件终止所有路径
function checkIfStatementTermination(ifStmt: t.IfStatement): boolean {
  // 检查条件是否是字面量true
  const isAlwaysTrue = t.isBooleanLiteral(ifStmt.test) && ifStmt.test.value === true;
  
  if (isAlwaysTrue) {
    // if (true) { ... } - 检查then分支是否终止
    return hasTerminatingStatement(ifStmt.consequent);
  }
  
  // 检查if-else是否两个分支都终止
  if (ifStmt.alternate) {
    const thenTerminates = hasTerminatingStatement(ifStmt.consequent);
    const elseTerminates = hasTerminatingStatement(ifStmt.alternate);
    return thenTerminates && elseTerminates;
  }
  
  return false;
}

// 检查语句或块是否包含终止语句
function hasTerminatingStatement(stmt: t.Statement): boolean {
  if (t.isReturnStatement(stmt) || t.isThrowStatement(stmt)) {
    return true;
  }
  
  if (t.isBlockStatement(stmt)) {
    return stmt.body.some(s => 
      t.isReturnStatement(s) || 
      t.isThrowStatement(s) ||
      (t.isIfStatement(s) && checkIfStatementTermination(s))
    );
  }
  
  return false;
}

// 分析嵌套语句中的不可达代码
function analyzeNestedStatements(stmt: t.Statement): t.Statement[] {
  const unreachable: t.Statement[] = [];
  
  if (t.isBlockStatement(stmt)) {
    unreachable.push(...analyzeControlFlow(stmt.body));
  } else if (t.isIfStatement(stmt)) {
    // 分析then分支
    if (t.isBlockStatement(stmt.consequent)) {
      unreachable.push(...analyzeControlFlow(stmt.consequent.body));
    }
    
    // 分析else分支
    if (stmt.alternate) {
      if (t.isBlockStatement(stmt.alternate)) {
        unreachable.push(...analyzeControlFlow(stmt.alternate.body));
      } else {
        unreachable.push(...analyzeNestedStatements(stmt.alternate));
      }
    }
  }
  
  return unreachable;
}

// 从块语句中移除语句
function removeStatementsFromBlock(block: t.BlockStatement, toRemove: t.Statement[]) {
  const removeSet = new Set(toRemove);
  block.body = block.body.filter(stmt => !removeSet.has(stmt));
  
  // 递归处理嵌套块中的移除
  for (const stmt of block.body) {
    if (t.isBlockStatement(stmt)) {
      removeStatementsFromBlock(stmt, toRemove);
    } else if (t.isIfStatement(stmt)) {
      if (t.isBlockStatement(stmt.consequent)) {
        removeStatementsFromBlock(stmt.consequent, toRemove);
      }
      if (stmt.alternate && t.isBlockStatement(stmt.alternate)) {
        removeStatementsFromBlock(stmt.alternate, toRemove);
      }
    }
  }
}

// 从程序中移除语句
function removeStatementsFromProgram(program: t.Program, toRemove: t.Statement[]) {
  const removeSet = new Set(toRemove);
  program.body = program.body.filter(stmt => !removeSet.has(stmt));
}

function createCFG(): ControlFlowGraph {
  const cfg: ControlFlowGraph = {
    nodes: new Map(),
    entry: 0,
    nodeCounter: 1,
  };

  // 创建入口节点
  const entryNode: CFGNode = {
    id: 0,
    statements: [],
    successors: [],
    predecessors: [],
    reachable: false,
  };
  cfg.nodes.set(0, entryNode);

  return cfg;
}

function addEdge(cfg: ControlFlowGraph, fromId: number, toId: number) {
  const fromNode = cfg.nodes.get(fromId);
  const toNode = cfg.nodes.get(toId);

  if (fromNode && toNode) {
    if (!fromNode.successors.includes(toId)) {
      fromNode.successors.push(toId);
      toNode.predecessors.push(fromId);
    }
  }
}

function buildCFGFromStatements(statements: t.Statement[]): ControlFlowGraph {
  const cfg = createCFG();
  let currentNodeId = cfg.entry;

  for (const stmt of statements) {
    currentNodeId = processStatement(cfg, currentNodeId, stmt);
  }

  return cfg;
}

function processStatement(
  cfg: ControlFlowGraph,
  currentNodeId: number,
  stmt: t.Statement
): number {
  switch (true) {
    case t.isBlockStatement(stmt):
      return processBlockStatement(cfg, currentNodeId, stmt);
    case t.isIfStatement(stmt):
      return processIfStatement(cfg, currentNodeId, stmt);
    case (t.isReturnStatement(stmt) || t.isThrowStatement(stmt)):
      return processTerminatorStatement(cfg, currentNodeId, stmt);
    default: {
      // 普通语句：添加到当前节点
      const currentNode = cfg.nodes.get(currentNodeId);
      if (currentNode) {
        currentNode.statements.push(stmt);
      }
      return currentNodeId;
    }
  }
}

function processBlockStatement(
  cfg: ControlFlowGraph,
  currentNodeId: number,
  stmt: t.BlockStatement
): number {
  let nodeId = currentNodeId;
  for (const innerStmt of stmt.body) {
    nodeId = processStatement(cfg, nodeId, innerStmt);
  }
  return nodeId;
}

function processIfStatement(
  cfg: ControlFlowGraph,
  currentNodeId: number,
  stmt: t.IfStatement
): number {
  // 创建分支节点
  const thenNodeId = createNode(cfg);
  const elseNodeId = createNode(cfg);
  const afterNodeId = createNode(cfg);

  // 连接分支
  addEdge(cfg, currentNodeId, thenNodeId);
  addEdge(cfg, currentNodeId, elseNodeId);

  // 处理then分支
  let thenEndNodeId = processStatement(cfg, thenNodeId, stmt.consequent);
  const thenNode = cfg.nodes.get(thenEndNodeId);
  if (thenNode && thenNode.successors.length === 0) {
    addEdge(cfg, thenEndNodeId, afterNodeId);
  }

  // 处理else分支
  let elseEndNodeId = elseNodeId;
  if (stmt.alternate) {
    elseEndNodeId = processStatement(cfg, elseNodeId, stmt.alternate);
  }
  const elseNode = cfg.nodes.get(elseEndNodeId);
  if (elseNode && elseNode.successors.length === 0) {
    addEdge(cfg, elseEndNodeId, afterNodeId);
  }

  return afterNodeId;
}

function processTerminatorStatement(
  cfg: ControlFlowGraph,
  currentNodeId: number,
  stmt: t.ReturnStatement | t.ThrowStatement
): number {
  const currentNode = cfg.nodes.get(currentNodeId);
  if (currentNode) {
    currentNode.statements.push(stmt);
  }
  // 创建新节点但不连接（不可达）
  return createNode(cfg);
}

function createNode(
  cfg: ControlFlowGraph,
  statements: t.Statement[] = []
): number {
  const nodeId = cfg.nodeCounter++;
  const node: CFGNode = {
    id: nodeId,
    statements: [...statements],
    successors: [],
    predecessors: [],
    reachable: false,
  };
  cfg.nodes.set(nodeId, node);
  return nodeId;
}
