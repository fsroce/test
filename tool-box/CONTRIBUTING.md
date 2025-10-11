# Contributing Guide

## 代码规范

### TypeScript

- 所有文件必须使用TypeScript
- 严格模式开启 (`strict: true`)
- 避免使用 `any` 类型，使用具体类型或泛型
- 为所有公共函数和组件编写JSDoc注释

### React组件

- 使用函数式组件和Hooks
- 组件必须使用TypeScript `FC<Props>` 类型
- Props接口必须导出并有清晰的文档
- 组件文件名使用PascalCase (如 `Button.tsx`)

### 文件组织

```
src/
├── components/
│   ├── common/          # 通用UI组件
│   ├── layout/          # 布局组件
│   └── tools/           # 工具组件
├── utils/               # 工具函数
│   ├── encoders/        # 编码工具
│   ├── converters/      # 转换工具
│   ├── formatters/      # 格式化工具
│   └── validators/      # 验证工具
├── hooks/               # 自定义Hooks
├── types/               # TypeScript类型定义
└── constants/           # 常量配置
```

### 命名约定

- **组件**: PascalCase (例如: `Button`, `TextArea`)
- **工具函数**: camelCase (例如: `encodeBase64`, `formatJson`)
- **类型/接口**: PascalCase (例如: `ToolMetadata`, `ToolResult`)
- **常量**: UPPER_SNAKE_CASE (例如: `TOOLS`, `DEFAULT_OPTIONS`)
- **CSS类**: kebab-case (例如: `.tool-card`, `.btn-primary`)

### 代码风格

- 使用Prettier格式化代码
- 使用ESLint检查代码质量
- 函数最大长度建议不超过50行
- 单个文件建议不超过300行

## 添加新工具

1. 在 `src/utils/` 下创建工具函数
2. 在 `src/components/tools/` 创建React组件
3. 在 `src/constants/tools.ts` 注册工具
4. 在 `src/App.tsx` 添加路由

### 示例：添加URL编码工具

```typescript
// 1. 创建工具函数 src/utils/encoders/url.ts
export const encodeUrl = (input: string): ToolResult<string> => {
  // 实现...
};

// 2. 创建组件 src/components/tools/UrlTool.tsx
export const UrlTool: FC = () => {
  // 实现...
};

// 3. 注册工具 src/constants/tools.ts
export const TOOLS: ToolMetadata[] = [
  {
    id: 'url',
    name: 'URL编码',
    // ...
  },
];

// 4. 添加路由 src/App.tsx
const renderTool = () => {
  switch (selectedTool.id) {
    case 'url':
      return <UrlTool />;
    // ...
  }
};
```

## 提交规范

使用Conventional Commits格式:

- `feat:` 新功能
- `fix:` Bug修复
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建/工具链相关

示例: `feat: add URL encoding tool`

## 代码审查清单

- [ ] TypeScript类型正确无误
- [ ] 所有导出的函数/组件有JSDoc注释
- [ ] ESLint无警告
- [ ] Prettier已格式化
- [ ] 组件有适当的错误处理
- [ ] UI响应式设计
- [ ] 代码可读性强
