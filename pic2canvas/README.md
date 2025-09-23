# 🎨 Image to Canvas Generator

将图片转换为TypeScript Canvas绘制代码的强大Node.js工具。

## 📦 安装

### 本地安装
```bash
# 克隆或下载项目
git clone <your-repo>
cd image-to-canvas-generator

# 安装依赖
npm install

# 编译TypeScript
npm run build
```

### 系统依赖 (Linux/macOS)
```bash
# Ubuntu/Debian
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# macOS (需要Homebrew)
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
```

## 🚀 使用方法

### 命令行使用

```bash
# 基本用法
node dist/generator.js ./your-image.png

# 指定参数
node dist/generator.js ./logo.png -w 100 -o ./output -f canvas.ts

# 批量处理
node dist/generator.js batch ./img1.png ./img2.jpg ./img3.png -w 60

# 查看帮助
node dist/generator.js --help
```

### 编程方式使用

```javascript
const ImageToCanvasGenerator = require('./dist/generator');

async function example() {
  const generator = new ImageToCanvasGenerator('./output');
  
  // 处理单个图片
  await generator.processImage('./logo.png', {
    maxWidth: 80,
    outputFileName: 'index.ts'
  });
  
  // 批量处理
  const images = ['./img1.png', './img2.jpg'];
  await generator.processMultipleImages(images, 60);
}

example().catch(console.error);
```

## 📊 参数说明

- **图片路径**: 支持PNG、JPG、GIF等格式
- **-w, --width**: 最大宽度，用于控制输出代码大小 (默认: 80)
- **-o, --output**: 输出目录 (默认: output)
- **-f, --filename**: 输出文件名 (默认: index.ts)

## 📁 生成的代码特点

生成的 `output/index.ts` 文件包含:

- ✅ 完整的TypeScript类定义
- ✅ 浏览器和Node.js双环境支持
- ✅ 多种使用方式 (绘制、创建Canvas、保存文件)
- ✅ 缩放功能
- ✅ 类型安全
- ✅ 详细注释和使用示例

## 🎯 生成代码示例

```typescript
import drawer from './output/index';

// 浏览器环境
const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
drawer.draw(canvas, 4); // 4倍缩放

// Node.js环境  
drawer.saveToFile('./result.png', 2); // 保存为PNG文件

// 获取信息
const { width, height } = drawer.getImageDimensions();
console.log(`尺寸: ${width}x${height}`);
```

## 🔧 开发脚本

```bash
npm run build    # 编译TypeScript
npm run dev      # 开发模式运行
npm run clean    # 清理输出文件
npm run test     # 测试示例图片
```

## 🐛 故障排除

### Canvas包安装失败
```bash
# 重新安装canvas包
npm rebuild canvas

# 或者使用yarn
yarn install --ignore-engines
```

### 权限问题
```bash
# Linux/macOS
sudo chown -R $USER:$USER ./output
```

## 📈 性能优化

- 使用 `maxWidth` 参数控制图片大小
- 工具会自动合并相邻同色像素为矩形
- 支持批量处理多个图片

## 🎨 支持的图片格式

- PNG (推荐)
- JPEG/JPG
- GIF
- WebP
- BMP

---

Happy coding! 🚀