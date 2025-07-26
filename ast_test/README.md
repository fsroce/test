# AST Code Analyzer

基于 AST（抽象语法树）的 JavaScript 代码分析和优化工具。

## 功能特性

1. **死代码检测与移除**
   - 检测 return/throw 语句后的不可达代码
   - 分析 if 语句的控制流
   - 自动移除检测到的死代码

2. **未使用变量检测与移除**
   - 检测未使用的变量声明
   - 检测未使用的函数声明
   - 检测未使用的函数参数
   - 自动清理未使用的代码

## 使用方法

```bash
# 安装依赖
pnpm install

# 开发模式运行
pnpm run dev

# 构建
pnpm run build

# 运行构建后的代码
pnpm start
```

## 项目结构

```
ast_test/
├── examples/          # 示例输入文件
├── output/           # 处理后的输出文件
├── src/
│   ├── handlers/     # 核心处理器
│   │   ├── dead-code-handler.ts    # 死代码处理
│   │   ├── unused-var-handler.ts   # 未使用变量处理
│   │   └── file-processor.ts       # 文件处理工具
│   ├── tests/        # 测试文件
│   └── utils/        # 工具函数
└── package.json
```

## TODO
- [ ] 支持更多的死代码模式检测
- [ ] 支持配置化的规则
- [ ] 添加命令行接口
- [ ] 支持更多语言特性（ES6+, TypeScript等）