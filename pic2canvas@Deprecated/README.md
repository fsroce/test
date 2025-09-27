# 🎨 pic2canvas

自动扫描项目中的图片，并生成可以复刻原图的 TypeScript Canvas 绘制代码。

## ✨ 特性
- 🔍 自动递归搜集指定目录（默认为当前项目）中的 PNG/JPEG/GIF/WebP 等图片
- 🧠 将相邻同色像素合并成矩形，显著减少绘制指令数量
- 🧩 为每张图片生成独立的绘制类与默认实例，并输出聚合的 `index.ts`
- 🌐 同时支持浏览器与 Node.js（基于 [node-canvas](https://github.com/Automattic/node-canvas)）环境
- ⚙️ 提供 CLI 与编程接口，易于在脚本或构建流程中集成

## 📦 安装
```bash
pnpm install
# 或 npm install / yarn install
```

> **提示**：`canvas` 是原生扩展，首次安装时可能需要系统级依赖（如 `cairo`）。
> 请参考 node-canvas 官方文档或下方的“故障排除”章节。

## 🚀 命令行使用

### 基本用法
```bash
# 使用 ts-node 直接运行（开发阶段）
pnpm ts-node generator.ts

# 或使用编译后的产物
pnpm run build
node dist/generator.js
```

默认会从当前工作目录开始递归扫描图片，并将生成的 TypeScript 文件输出至 `output/`。

### 常用选项
| 选项 | 说明 | 示例 |
| --- | --- | --- |
| `-w, --width <number>` | 限制绘制时的最大宽度，过大的图片会按比例缩放（默认 `80`） | `--width 160` |
| `-o, --output <dir>` | 自定义输出目录（默认 `output`） | `--output ./generated/canvas` |
| `--source` | 将生成的 `.ts` 文件放到图片同目录下，而非统一输出目录 | `--source` |
| `--no-recursive` | 仅扫描目标目录的第一层，不递归子目录 | `--no-recursive src/assets` |
| `--no-index` | 不生成聚合的 `index.ts` | `--no-index` |
| `-e, --extensions <list>` | 指定要处理的图片扩展名（逗号分隔） | `--extensions png,webp` |
| `-h, --help` | 查看帮助 | `--help` |

### 例子
```bash
# 在整个项目中搜索图片并生成代码到 output 目录
pnpm ts-node generator.ts

# 将生成的代码放到图片同目录下
pnpm ts-node generator.ts --source

# 仅处理 assets 目录，图片宽度限制为 120 像素
pnpm ts-node generator.ts assets --width 120

# 生成到自定义目录，并排除子目录扫描
pnpm ts-node generator.ts assets/icons --output src/canvas --no-recursive

# 只处理 png 与 webp，并就地生成
pnpm ts-node generator.ts --extensions png,webp --source
```

执行完成后，将看到：
- 每张图片一个 `*.ts` 文件，包含 `XxxDrawer` 类与默认导出的实例
- 输出位置：
  - 默认模式：统一输出到指定目录（如 `output/`）
  - `--source` 模式：生成在图片同目录下
- 自动生成（可选）的 `index.ts`，统一导出所有绘制器（仅默认模式）

## 🧑‍💻 编程方式

```typescript
import ImageToCanvasGenerator from './dist/index';

async function buildSprites() {
  const generator = new ImageToCanvasGenerator({
    outputDir: './output',
    maxWidth: 100,
    outputToSource: false  // 是否输出到图片同目录
  });

  // 扫描多个路径（目录或文件混合）
  const results = await generator.processPaths(['assets', 'logo.png'], {
    outputToSource: true  // 可覆盖构造函数设置
  });

  console.log(`已生成 ${results.length} 个绘制文件`);

  // 单独处理某个图片，输出到同目录
  await generator.processImage('avatar.png', { 
    maxWidth: 64,
    outputToSource: true 
  });

  // 兼容旧接口：手动传入图片列表
  await generator.processMultipleImages(['hero.png', 'enemy.webp'], 90);
}
```

`ImageProcessResult` 会返回以下信息：
- `imagePath` / `outputPath`
- `className` / `drawerClassName`
- 原始与缩放后的宽高
- 生成的矩形数量

## 📁 生成代码结构
每个输出文件都会包含：
- `XxxDrawer` 类：提供 `draw` / `drawToContext` / `createCanvas` / `createNodeCanvas` 等方法
- 默认导出：`const Xxx = new XxxDrawer();`
- 注释中包含来源图片、尺寸、生成时间等信息

`index.ts`（开启时）会对所有绘制器做统一导出，便于批量引用：
```typescript
export { LogoDrawer } from './logo';
export { default as Logo } from './logo';
// ...
```

## 🧰 开发脚本
```bash
pnpm run build   # 编译到 dist/
pnpm run dev     # ts-node 开发模式
pnpm run clean   # 清理 dist/ 与 output/
```

## 🐛 故障排除
### 安装 canvas 失败
- macOS: `brew install pkg-config cairo pango libpng jpeg giflib librsvg`
- Debian/Ubuntu: `sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev`
- 如果依旧失败，可尝试 `npm rebuild canvas`

### 输出目录无权限
```bash
sudo chown -R $USER:$USER ./output
```

### 没有生成任何文件
- 确认目标目录下是否存在受支持的图片格式
- 如果使用 `--extensions`，请确保扩展名拼写正确（无需带点）
- 使用 `--no-recursive` 时只会扫描第一层目录

## 📈 使用建议
- 通过 `--width` 控制缩放，避免输出包含过多矩形
- 将输出目录加入版本库，可在前端直接使用生成的 TypeScript 代码
- 若需要增量更新，可只对包含新图片的目录运行工具

祝你玩得开心，创意无限！🚀
