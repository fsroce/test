import { promises as fs } from 'fs';
import path from 'path';
import { createCanvas, loadImage, Image } from 'canvas';

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface GeneratorOptions {
  outputDir?: string;
  maxWidth?: number;
  recursive?: boolean;
  generateIndex?: boolean;
  extensions?: string[];
  outputToSource?: boolean;
}

export interface ProcessImageOptions {
  maxWidth?: number;
  outputFileName?: string;
  outputToSource?: boolean;
}

export interface ProcessTargetsOptions {
  maxWidth?: number;
  recursive?: boolean;
  generateIndex?: boolean;
  extensions?: string[];
  outputToSource?: boolean;
}

export interface ImageProcessResult {
  imagePath: string;
  outputPath: string;
  outputFileName: string;
  className: string;
  drawerClassName: string;
  originalWidth: number;
  originalHeight: number;
  processedWidth: number;
  processedHeight: number;
  rectangleCount: number;
}

interface ImagePixels {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

interface DiscoveryOptions {
  recursive: boolean;
  extensions: Set<string>;
}

const DEFAULT_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.avif', '.svg'];
const SKIP_DIRECTORIES = new Set(['node_modules', '.git', 'dist', 'build']);

export class ImageToCanvasGenerator {
  private readonly outputDir: string;
  private readonly defaultMaxWidth: number;
  private readonly defaultRecursive: boolean;
  private readonly defaultGenerateIndex: boolean;
  private readonly defaultOutputToSource: boolean;
  private readonly supportedExtensions: Set<string>;
  private readonly usedFileBases = new Set<string>();
  private readonly usedClassNames = new Set<string>();

  constructor(options: GeneratorOptions = {}) {
    this.outputDir = path.resolve(options.outputDir ?? 'output');
    this.defaultMaxWidth = options.maxWidth ?? 80;
    this.defaultRecursive = options.recursive ?? true;
    this.defaultGenerateIndex = options.generateIndex ?? true;
    this.defaultOutputToSource = options.outputToSource ?? false;
    const extensions = options.extensions?.length ? options.extensions : DEFAULT_EXTENSIONS;
    this.supportedExtensions = new Set(
      extensions.map(ext => (ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`))
    );
  }

  getOutputDirectory(): string {
    return this.outputDir;
  }

  async processImage(imagePath: string, options: ProcessImageOptions = {}): Promise<ImageProcessResult> {
    const resolvedImagePath = path.resolve(imagePath);
    const outputToSource = options.outputToSource ?? this.defaultOutputToSource;
    
    if (!outputToSource) {
      await this.ensureOutputDirectory();
    }

    const image = await this.loadImageFromPath(resolvedImagePath);
    const maxWidth = options.maxWidth ?? this.defaultMaxWidth;
    const pixelData = this.getImagePixels(image, maxWidth);
    const rectangles = this.optimizePixels(pixelData.data, pixelData.width, pixelData.height);

    const baseName = path.basename(resolvedImagePath, path.extname(resolvedImagePath));
    const baseClass = this.toPascalCase(baseName) || 'GeneratedImage';
    const className = this.reserveUniqueName(baseClass, this.usedClassNames, (value, index) =>
      index === 0 ? value : `${value}${index + 1}`
    );
    const drawerClassName = `${className}Drawer`;

    const requestedFileBase = this.toKebabCase(
      options.outputFileName
        ? path.basename(options.outputFileName, path.extname(options.outputFileName))
        : baseName
    );

    const fileBase = this.reserveUniqueName(requestedFileBase || 'image', this.usedFileBases, (value, index) =>
      index === 0 ? value : `${value}-${index + 1}`
    );

    const outputFileName = `${fileBase}.ts`;
    const outputPath = outputToSource 
      ? path.join(path.dirname(resolvedImagePath), outputFileName)
      : path.join(this.outputDir, outputFileName);

    const tsCode = this.generateTSCode({
      rectangles,
      width: pixelData.width,
      height: pixelData.height,
      originalWidth: image.width,
      originalHeight: image.height,
      className,
      drawerClassName,
      imagePath: resolvedImagePath
    });

    await fs.writeFile(outputPath, tsCode, 'utf8');

    return {
      imagePath: resolvedImagePath,
      outputPath,
      outputFileName,
      className,
      drawerClassName,
      originalWidth: image.width,
      originalHeight: image.height,
      processedWidth: pixelData.width,
      processedHeight: pixelData.height,
      rectangleCount: rectangles.length
    };
  }

  async processPaths(paths: string[], options: ProcessTargetsOptions = {}): Promise<ImageProcessResult[]> {
    const recursive = options.recursive ?? this.defaultRecursive;
    const generateIndex = options.generateIndex ?? this.defaultGenerateIndex;
    const outputToSource = options.outputToSource ?? this.defaultOutputToSource;
    const extensions = this.resolveExtensions(options.extensions);

    const discoveryOptions: DiscoveryOptions = {
      recursive,
      extensions
    };

    const images = await this.discoverImages(paths.length ? paths : ['.'], discoveryOptions);
    const results: ImageProcessResult[] = [];

    for (const imagePath of images) {
      const result = await this.processImage(imagePath, { 
        maxWidth: options.maxWidth,
        outputToSource 
      });
      results.push(result);
    }

    if (generateIndex && !outputToSource) {
      await this.generateIndexFile(results);
    }

    return results;
  }

  async processMultipleImages(imagePaths: string[], maxWidth?: number): Promise<ImageProcessResult[]> {
    return this.processPaths(imagePaths, {
      maxWidth,
      recursive: false,
      generateIndex: false
    });
  }

  private resolveExtensions(extensions?: string[]): Set<string> {
    if (!extensions || extensions.length === 0) {
      return this.supportedExtensions;
    }
    return new Set(
      extensions.map(ext => (ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`))
    );
  }

  private async ensureOutputDirectory(): Promise<void> {
    await fs.mkdir(this.outputDir, { recursive: true });
  }

  private async loadImageFromPath(imagePath: string): Promise<Image> {
    try {
      await fs.access(imagePath);
    } catch {
      throw new Error(`图片文件不存在: ${imagePath}`);
    }

    try {
      return await loadImage(imagePath);
    } catch (error: any) {
      throw new Error(`加载图片失败: ${error?.message ?? error}`);
    }
  }

  private getImagePixels(image: Image, maxWidth: number): ImagePixels {
    const scale = Math.min(maxWidth / image.width, maxWidth / image.height, 1);
    const targetWidth = Math.max(1, Math.round(image.width * scale));
    const targetHeight = Math.max(1, Math.round(image.height * scale));

    const canvas = createCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);

    return {
      data: imageData.data,
      width: targetWidth,
      height: targetHeight
    };
  }

  private optimizePixels(data: Uint8ClampedArray, width: number, height: number): Rectangle[] {
    const rectangles: Rectangle[] = [];
    const processed = new Uint8Array(width * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        if (processed[index]) {
          continue;
        }

        const pixelIndex = index * 4;
        const alpha = data[pixelIndex + 3];

        if (alpha === 0) {
          processed[index] = 1;
          continue;
        }

        const color = this.rgbaToString(
          data[pixelIndex],
          data[pixelIndex + 1],
          data[pixelIndex + 2],
          alpha
        );

        let rectWidth = 1;
        for (let nx = x + 1; nx < width; nx++) {
          const neighbourIndex = y * width + nx;
          if (processed[neighbourIndex]) {
            break;
          }
          const neighbourPixelIndex = neighbourIndex * 4;
          const neighbourAlpha = data[neighbourPixelIndex + 3];
          if (neighbourAlpha === 0) {
            break;
          }
          const neighbourColor = this.rgbaToString(
            data[neighbourPixelIndex],
            data[neighbourPixelIndex + 1],
            data[neighbourPixelIndex + 2],
            neighbourAlpha
          );
          if (neighbourColor !== color) {
            break;
          }
          rectWidth++;
        }

        let rectHeight = 1;
        let canExpand = true;
        while (canExpand && y + rectHeight < height) {
          for (let nx = 0; nx < rectWidth; nx++) {
            const checkX = x + nx;
            const checkY = y + rectHeight;
            const checkIndex = checkY * width + checkX;
            if (processed[checkIndex]) {
              canExpand = false;
              break;
            }
            const checkPixelIndex = checkIndex * 4;
            const checkAlpha = data[checkPixelIndex + 3];
            if (checkAlpha === 0) {
              canExpand = false;
              break;
            }
            const checkColor = this.rgbaToString(
              data[checkPixelIndex],
              data[checkPixelIndex + 1],
              data[checkPixelIndex + 2],
              checkAlpha
            );
            if (checkColor !== color) {
              canExpand = false;
              break;
            }
          }
          if (canExpand) {
            rectHeight++;
          }
        }

        for (let dy = 0; dy < rectHeight; dy++) {
          for (let dx = 0; dx < rectWidth; dx++) {
            const markIndex = (y + dy) * width + (x + dx);
            processed[markIndex] = 1;
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

  private rgbaToString(r: number, g: number, b: number, a: number): string {
    if (a === 255) {
      return `rgb(${r}, ${g}, ${b})`;
    }
    return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
  }

  private generateTSCode(params: {
    rectangles: Rectangle[];
    width: number;
    height: number;
    originalWidth: number;
    originalHeight: number;
    className: string;
    drawerClassName: string;
    imagePath: string;
  }): string {
    const {
      rectangles,
      width,
      height,
      originalWidth,
      originalHeight,
      className,
      drawerClassName,
      imagePath
    } = params;
    const drawingCode = rectangles
      .map(rect => {
        return `    ctx.fillStyle = '${rect.color}';\n    ctx.fillRect(${rect.x}, ${rect.y}, ${rect.width}, ${rect.height});`;
      })
      .join('\n');

    const timestamp = new Date().toISOString();
    const relativePath = path
      .relative(process.cwd(), imagePath)
      .split(path.sep)
      .join('/');

    return `// Auto-generated by ImageToCanvasGenerator
// Source image: ${relativePath}
// Original size: ${originalWidth}x${originalHeight}
// Canvas size: ${width}x${height}
// Rectangles: ${rectangles.length}
// Generated at: ${timestamp}

export class ${drawerClassName} {
  private readonly width = ${width};
  private readonly height = ${height};

  getDimensions(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  draw(canvas: HTMLCanvasElement | { width: number; height: number; getContext(type: '2d'): CanvasRenderingContext2D | null }, scale = 1): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('无法获取Canvas 2D上下文');
    }

    canvas.width = this.width * scale;
    canvas.height = this.height * scale;

    this.drawToContext(ctx, scale);
  }

  drawToContext(ctx: CanvasRenderingContext2D, scale = 1): void {
    if (scale !== 1) {
      if (typeof ctx.save === 'function') {
        ctx.save();
        ctx.scale(scale, scale);
      } else {
        ctx.scale(scale, scale);
      }
    }

    ctx.clearRect(0, 0, this.width, this.height);

${drawingCode}

    if (scale !== 1) {
      if (typeof ctx.restore === 'function') {
        ctx.restore();
      } else if (typeof ctx.setTransform === 'function') {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      } else {
        ctx.scale(1 / scale, 1 / scale);
      }
    }
  }

  createCanvas(scale = 1): HTMLCanvasElement {
    if (typeof document === 'undefined') {
      throw new Error('createCanvas 方法需要在浏览器环境中使用');
    }
    const canvas = document.createElement('canvas');
    this.draw(canvas, scale);
    return canvas;
  }

  toDataURL(scale = 1, format: string = 'image/png'): string {
    const canvas = this.createCanvas(scale);
    return canvas.toDataURL(format);
  }

  createNodeCanvas(scale = 1): any {
    const { createCanvas } = require('canvas');
    const canvas = createCanvas(this.width * scale, this.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('无法创建Canvas上下文');
    }
    this.drawToContext(ctx, scale);
    return canvas;
  }

  saveToFile(filePath: string, scale = 1): void {
    const fs = require('fs');
    const canvas = this.createNodeCanvas(scale);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filePath, buffer);
  }
}

export const ${className} = new ${drawerClassName}();
export default ${className};
`;
  }

  private async generateIndexFile(results: ImageProcessResult[]): Promise<void> {
    if (!results.length) {
      return;
    }

    const lines: string[] = [];
    lines.push('// Auto-generated index for canvas drawers');
    lines.push(`// Generated at: ${new Date().toISOString()}`);
    lines.push('');

    const sorted = [...results].sort((a, b) => a.drawerClassName.localeCompare(b.drawerClassName));

    for (const result of sorted) {
      const importPath = `./${result.outputFileName.replace(/\.ts$/i, '')}`;
      lines.push(`export { ${result.drawerClassName} } from '${importPath}';`);
      lines.push(`export { default as ${result.className} } from '${importPath}';`);
    }

    lines.push('');

    await fs.writeFile(path.join(this.outputDir, 'index.ts'), lines.join('\n'), 'utf8');
  }

  private async discoverImages(paths: string[], options: DiscoveryOptions): Promise<string[]> {
    const discovered = new Set<string>();

    for (const inputPath of paths) {
      const targetPath = path.resolve(inputPath);
      try {
        const stats = await fs.stat(targetPath);
        if (stats.isDirectory()) {
          await this.collectFromDirectory(targetPath, options, discovered);
        } else if (stats.isFile() && this.isSupportedImage(targetPath, options.extensions)) {
          discovered.add(targetPath);
        }
      } catch (error) {
        throw new Error(`无法访问路径: ${targetPath}. ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return Array.from(discovered).sort((a, b) => a.localeCompare(b));
  }

  private async collectFromDirectory(
    directory: string,
    options: DiscoveryOptions,
    discovered: Set<string>
  ): Promise<void> {
    if (this.shouldSkipDirectory(directory)) {
      return;
    }

    const entries = await fs.readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        if (options.recursive) {
          await this.collectFromDirectory(fullPath, options, discovered);
        }
      } else if (entry.isFile() && this.isSupportedImage(fullPath, options.extensions)) {
        discovered.add(fullPath);
      }
    }
  }

  private shouldSkipDirectory(directory: string): boolean {
    const baseName = path.basename(directory);
    if (SKIP_DIRECTORIES.has(baseName)) {
      return true;
    }
    if (directory === this.outputDir) {
      return true;
    }
    if (directory.startsWith(`${this.outputDir}${path.sep}`)) {
      return true;
    }
    return false;
  }

  private isSupportedImage(filePath: string, extensions: Set<string>): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return extensions.has(ext);
  }

  private reserveUniqueName(
    base: string,
    used: Set<string>,
    formatter: (value: string, index: number) => string
  ): string {
    let index = 0;
    while (true) {
      const candidate = formatter(base, index);
      const key = candidate.toLowerCase();
      if (!used.has(key)) {
        used.add(key);
        return candidate;
      }
      index++;
    }
  }

  private toPascalCase(value: string): string {
    return value
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('');
  }

  private toKebabCase(value: string): string {
    return value
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
  }
}

export default ImageToCanvasGenerator;
