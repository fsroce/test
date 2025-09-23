const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

class ImageToCanvasGenerator {
  private outputDir: string;

  constructor(outputDir: string = 'output') {
    this.outputDir = outputDir;
    this.ensureOutputDirectory();
  }

  /**
   * 确保输出目录存在
   */
  private ensureOutputDirectory(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * 加载图片
   */
  async loadImageFromPath(imagePath: string): Promise<any> {
    try {
      if (!fs.existsSync(imagePath)) {
        throw new Error(`图片文件不存在: ${imagePath}`);
      }
      return await loadImage(imagePath);
    } catch (error) {
      throw new Error(`加载图片失败: ${error.message}`);
    }
  }

  /**
   * 获取图片像素数据
   */
  private getImagePixels(img: any, maxWidth: number = 100): {
    data: Uint8ClampedArray;
    width: number;
    height: number;
  } {
    // 计算缩放比例
    const scale = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
    const scaledWidth = Math.floor(img.width * scale);
    const scaledHeight = Math.floor(img.height * scale);

    // 创建canvas并绘制图片
    const canvas = createCanvas(scaledWidth, scaledHeight);
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
    const imageData = ctx.getImageData(0, 0, scaledWidth, scaledHeight);

    return {
      data: imageData.data,
      width: scaledWidth,
      height: scaledHeight
    };
  }

  /**
   * 将RGBA值转换为CSS颜色字符串
   */
  private rgbaToString(r: number, g: number, b: number, a: number): string {
    if (a === 255) {
      return `'rgb(${r}, ${g}, ${b})'`;
    }
    return `'rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})'`;
  }

  /**
   * 优化像素数据，将相邻相同颜色的像素合并为矩形
   */
  private optimizePixels(data: Uint8ClampedArray, width: number, height: number): Rectangle[] {
    const rectangles: Rectangle[] = [];
    const processed = new Set<string>();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const key = `${x},${y}`;
        if (processed.has(key)) continue;

        const pixelIndex = (y * width + x) * 4;
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        const a = data[pixelIndex + 3];

        // 跳过透明像素
        if (a === 0) {
          processed.add(key);
          continue;
        }

        const color = this.rgbaToString(r, g, b, a);

        // 向右扩展
        let rectWidth = 1;
        for (let nx = x + 1; nx < width; nx++) {
          const nextKey = `${nx},${y}`;
          if (processed.has(nextKey)) break;

          const nextPixelIndex = (y * width + nx) * 4;
          const nr = data[nextPixelIndex];
          const ng = data[nextPixelIndex + 1];
          const nb = data[nextPixelIndex + 2];
          const na = data[nextPixelIndex + 3];

          if (this.rgbaToString(nr, ng, nb, na) === color) {
            rectWidth++;
          } else {
            break;
          }
        }

        // 向下扩展
        let rectHeight = 1;
        let canExpandDown = true;
        
        for (let ny = y + 1; ny < height && canExpandDown; ny++) {
          for (let nx = x; nx < x + rectWidth; nx++) {
            const checkKey = `${nx},${ny}`;
            if (processed.has(checkKey)) {
              canExpandDown = false;
              break;
            }

            const checkPixelIndex = (ny * width + nx) * 4;
            const cr = data[checkPixelIndex];
            const cg = data[checkPixelIndex + 1];
            const cb = data[checkPixelIndex + 2];
            const ca = data[checkPixelIndex + 3];

            if (this.rgbaToString(cr, cg, cb, ca) !== color) {
              canExpandDown = false;
              break;
            }
          }
          
          if (canExpandDown) {
            rectHeight++;
          }
        }

        // 标记像素为已处理
        for (let py = y; py < y + rectHeight; py++) {
          for (let px = x; px < x + rectWidth; px++) {
            processed.add(`${px},${py}`);
          }
        }

        rectangles.push({
          x,
          y,
          width: rectWidth,
          height: rectHeight,
          color
        });
      }
    }

    return rectangles;
  }

  /**
   * 将字符串转换为PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]/g, '_')
      .split('_')
      .filter(part => part.length > 0)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('');
  }

  /**
   * 生成TypeScript Canvas代码
   */
  private generateTSCode(rectangles: Rectangle[], width: number, height: number, imageName: string): string {
    const drawingCode = rectangles.map(rect => {
      return `    ctx.fillStyle = ${rect.color};
    ctx.fillRect(${rect.x}, ${rect.y}, ${rect.width}, ${rect.height});`;
    }).join('\n');

    const className = this.toPascalCase(imageName);

    return `// Generated Canvas drawing code for: ${imageName}
// Image dimensions: ${width}x${height}
// Total rectangles: ${rectangles.length}
// Generated at: ${new Date().toISOString()}

export interface CanvasDrawer {
  draw(canvas: HTMLCanvasElement): void;
  getImageDimensions(): { width: number; height: number };
}

export class ${className}Drawer implements CanvasDrawer {
  private readonly width = ${width};
  private readonly height = ${height};

  /**
   * 获取原始图像尺寸
   */
  getImageDimensions(): { width: number; height: number } {
    return {
      width: this.width,
      height: this.height
    };
  }

  /**
   * 在指定的Canvas上绘制图像
   * @param canvas - 目标Canvas元素
   * @param scale - 缩放比例 (默认为1)
   */
  draw(canvas: HTMLCanvasElement, scale: number = 1): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('无法获取Canvas 2D上下文');
    }

    // 设置Canvas尺寸
    canvas.width = this.width * scale;
    canvas.height = this.height * scale;

    // 如果有缩放，则应用缩放变换
    if (scale !== 1) {
      ctx.scale(scale, scale);
    }

    // 清除画布并设置背景
    ctx.clearRect(0, 0, this.width, this.height);
    
    // 绘制图像
${drawingCode}
    
    // 如果有缩放，重置变换矩阵
    if (scale !== 1) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  }

  /**
   * 创建并返回包含绘制内容的新Canvas (浏览器环境)
   * @param scale - 缩放比例 (默认为1)
   */
  createCanvas(scale: number = 1): HTMLCanvasElement {
    if (typeof document === 'undefined') {
      throw new Error('createCanvas方法只能在浏览器环境中使用');
    }
    const canvas = document.createElement('canvas');
    this.draw(canvas, scale);
    return canvas;
  }

  /**
   * 将绘制内容导出为Data URL (浏览器环境)
   * @param scale - 缩放比例 (默认为1)
   * @param format - 图像格式 (默认为'image/png')
   */
  toDataURL(scale: number = 1, format: string = 'image/png'): string {
    const canvas = this.createCanvas(scale);
    return canvas.toDataURL(format);
  }

  /**
   * Node.js环境下创建Canvas
   * @param scale - 缩放比例 (默认为1)
   */
  createNodeCanvas(scale: number = 1): any {
    try {
      const { createCanvas } = require('canvas');
      const canvas = createCanvas(this.width * scale, this.height * scale);
      const ctx = canvas.getContext('2d');
      
      if (scale !== 1) {
        ctx.scale(scale, scale);
      }
      
      ctx.clearRect(0, 0, this.width, this.height);
      
${drawingCode}
      
      return canvas;
    } catch (error) {
      throw new Error('Node.js环境下需要安装canvas包: npm install canvas');
    }
  }

  /**
   * Node.js环境下保存为图片文件
   * @param filePath - 保存路径
   * @param scale - 缩放比例 (默认为1)
   */
  saveToFile(filePath: string, scale: number = 1): void {
    try {
      const fs = require('fs');
      const canvas = this.createNodeCanvas(scale);
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(filePath, buffer);
      console.log(\`图片已保存到: \${filePath}\`);
    } catch (error) {
      throw new Error(\`保存文件失败: \${error.message}\`);
    }
  }
}

// 默认导出实例
const drawer = new ${className}Drawer();
export default drawer;

// 使用示例:
/*
// 浏览器环境:
import drawer from './output/index';

const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
drawer.draw(canvas, 4); // 4倍缩放

// Node.js环境:
const drawer = require('./output/index').default;
drawer.saveToFile('./output-image.png', 2); // 保存为文件，2倍缩放

// 获取尺寸信息:
const dimensions = drawer.getImageDimensions();
console.log(\`尺寸: \${dimensions.width}x\${dimensions.height}\`);
*/`;
  }

  /**
   * 主处理方法
   */
  async processImage(
    imagePath: string, 
    options: {
      maxWidth?: number;
      outputFileName?: string;
    } = {}
  ): Promise<void> {
    const { maxWidth = 80, outputFileName = 'index.ts' } = options;
    
    try {
      console.log(`🖼️  正在处理图片: ${imagePath}`);
      
      // 加载图片
      const img = await this.loadImageFromPath(imagePath);
      console.log(`📏 原始尺寸: ${img.width}x${img.height}`);
      
      // 获取像素数据
      const pixelData = this.getImagePixels(img, maxWidth);
      console.log(`🔧 处理后尺寸: ${pixelData.width}x${pixelData.height}`);
      
      // 优化像素为矩形
      console.log('🚀 正在优化像素数据...');
      const rectangles = this.optimizePixels(pixelData.data, pixelData.width, pixelData.height);
      console.log(`✨ 优化完成，矩形数量: ${rectangles.length}`);
      
      // 生成TypeScript代码
      const imageName = path.basename(imagePath, path.extname(imagePath));
      const tsCode = this.generateTSCode(rectangles, pixelData.width, pixelData.height, imageName);
      
      // 写入文件
      const outputPath = path.join(this.outputDir, outputFileName);
      fs.writeFileSync(outputPath, tsCode, 'utf8');
      
      console.log(`\n✅ 处理完成！`);
      console.log(`📁 输出文件: ${outputPath}`);
      console.log(`📊 统计信息:`);
      console.log(`   📐 原始尺寸: ${img.width}x${img.height}`);
      console.log(`   📏 处理尺寸: ${pixelData.width}x${pixelData.height}`);
      console.log(`   🔳 矩形数量: ${rectangles.length}`);
      console.log(`   📄 代码行数: ${tsCode.split('\n').length}`);
      console.log(`   💾 文件大小: ${(tsCode.length / 1024).toFixed(1)}KB`);
      
    } catch (error) {
      throw new Error(`❌ 处理失败: ${error.message}`);
    }
  }

  /**
   * 批量处理多个图片
   */
  async processMultipleImages(imagePaths: string[], maxWidth: number = 80): Promise<void> {
    console.log(`🚀 开始批量处理 ${imagePaths.length} 个图片...\n`);
    
    for (let i = 0; i < imagePaths.length; i++) {
      const imagePath = imagePaths[i];
      const imageName = path.basename(imagePath, path.extname(imagePath));
      const outputFileName = `${imageName}.ts`;
      
      console.log(`📷 [${i + 1}/${imagePaths.length}] 处理: ${imagePath}`);
      
      try {
        await this.processImage(imagePath, { maxWidth, outputFileName });
        console.log(`✅ 完成\n`);
      } catch (error) {
        console.error(`❌ 失败: ${error.message}\n`);
      }
    }
    
    console.log('🎉 批量处理完成!');
  }
}

// 命令行支持
function showHelp() {
  console.log(`
🎨 图片转Canvas TypeScript代码生成器

用法:
  node generator.js <图片路径> [选项]
  node generator.js batch <图片1> <图片2> ... [选项]

选项:
  -w, --width <数字>     最大宽度 (默认: 80)
  -o, --output <目录>    输出目录 (默认: output)
  -f, --filename <文件>  输出文件名 (默认: index.ts)
  -h, --help            显示帮助信息

示例:
  node generator.js ./logo.png
  node generator.js ./logo.png -w 100 -o ./dist -f canvas.ts
  node generator.js batch ./img1.png ./img2.jpg -w 60
`);
}

function parseArgs(args: string[]) {
  const result: any = {
    files: [],
    width: 80,
    output: 'output',
    filename: 'index.ts',
    batch: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === 'batch') {
      result.batch = true;
    } else if (arg === '-w' || arg === '--width') {
      result.width = parseInt(args[++i]) || 80;
    } else if (arg === '-o' || arg === '--output') {
      result.output = args[++i] || 'output';
    } else if (arg === '-f' || arg === '--filename') {
      result.filename = args[++i] || 'index.ts';
    } else if (arg === '-h' || arg === '--help') {
      showHelp();
      process.exit(0);
    } else if (!arg.startsWith('-')) {
      result.files.push(arg);
    }
  }

  return result;
}

// 主程序入口
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showHelp();
    process.exit(1);
  }

  const options = parseArgs(args);
  
  if (options.files.length === 0) {
    console.error('❌ 请指定至少一个图片文件');
    process.exit(1);
  }

  const generator = new ImageToCanvasGenerator(options.output);

  try {
    if (options.batch || options.files.length > 1) {
      await generator.processMultipleImages(options.files, options.width);
    } else {
      await generator.processImage(options.files[0], {
        maxWidth: options.width,
        outputFileName: options.filename
      });
    }
    
    console.log('\n🎉 全部处理完成!');
    
  } catch (error) {
    console.error(`\n❌ 处理失败: ${error.message}`);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = ImageToCanvasGenerator;
export default ImageToCanvasGenerator;