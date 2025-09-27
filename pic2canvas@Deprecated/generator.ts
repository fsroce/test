#!/usr/bin/env node
import path from 'path';
import process from 'process';
import ImageToCanvasGenerator, { ProcessTargetsOptions } from './index';

interface CliOptions {
  targets: string[];
  width?: number;
  outputDir?: string;
  recursive: boolean;
  generateIndex: boolean;
  extensions?: string[];
  outputToSource: boolean;
  showHelp: boolean;
}

function showHelp(): void {
  console.log(`
🎨  图片转 Canvas 绘制代码生成器

使用方法:
  pnpm ts-node generator.ts [选项] [路径...]
  node dist/generator.js [选项] [路径...]

如果未指定路径，默认扫描当前目录。

选项:
  -w, --width <数字>        设置最大宽度 (默认 80)
  -o, --output <目录>       指定输出目录 (默认 output)
      --source              将生成的 .ts 文件放到图片同目录下
      --no-recursive        仅扫描顶层目录
      --no-index            不生成聚合的 index.ts
  -e, --extensions <列表>   自定义图片扩展名 (逗号分隔)
  -h, --help                显示帮助信息
`);
}

function parseArgs(args: string[]): CliOptions {
  const result: CliOptions = {
    targets: [],
    recursive: true,
    generateIndex: true,
    outputToSource: false,
    showHelp: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '-w':
      case '--width':
      case '--max-width': {
        const value = args[++i];
        if (!value) {
          throw new Error('需要为 --width 指定数值');
        }
        const parsed = Number.parseInt(value, 10);
        if (Number.isNaN(parsed) || parsed <= 0) {
          throw new Error(`无效的宽度数值: ${value}`);
        }
        result.width = parsed;
        break;
      }
      case '-o':
      case '--output': {
        const dir = args[++i];
        if (!dir) {
          throw new Error('需要为 --output 指定目录');
        }
        result.outputDir = dir;
        break;
      }
      case '--no-recursive': {
        result.recursive = false;
        break;
      }
      case '--recursive': {
        result.recursive = true;
        break;
      }
      case '--no-index': {
        result.generateIndex = false;
        break;
      }
      case '--index': {
        result.generateIndex = true;
        break;
      }
      case '--source': {
        result.outputToSource = true;
        break;
      }
      case '-e':
      case '--extensions': {
        const list = args[++i];
        if (!list) {
          throw new Error('需要为 --extensions 指定扩展名列表');
        }
        result.extensions = list
          .split(',')
          .map(item => item.trim())
          .filter(Boolean);
        break;
      }
      case '-h':
      case '--help': {
        result.showHelp = true;
        break;
      }
      default: {
        if (arg.startsWith('-')) {
          throw new Error(`未知参数: ${arg}`);
        }
        result.targets.push(arg);
      }
    }
  }

  if (result.targets.length === 0) {
    result.targets.push(process.cwd());
  }

  return result;
}

async function run(): Promise<void> {
  let options: CliOptions;

  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`❌  参数错误: ${error instanceof Error ? error.message : String(error)}`);
    showHelp();
    process.exitCode = 1;
    return;
  }

  if (options.showHelp) {
    showHelp();
    return;
  }

  const generator = new ImageToCanvasGenerator({
    outputDir: options.outputDir,
    maxWidth: options.width,
    recursive: options.recursive,
    generateIndex: options.generateIndex,
    extensions: options.extensions,
    outputToSource: options.outputToSource
  });

  console.log('🔍  正在扫描图片文件...');

  try {
    const processOptions: ProcessTargetsOptions = {
      maxWidth: options.width,
      recursive: options.recursive,
      generateIndex: options.generateIndex,
      extensions: options.extensions,
      outputToSource: options.outputToSource
    };

    const results = await generator.processPaths(options.targets, processOptions);

    if (results.length === 0) {
      console.log('⚠️  未找到任何符合条件的图片。');
      return;
    }

    const outputMessage = options.outputToSource 
      ? `\n✅  已生成 ${results.length} 个绘制文件，输出到图片同目录下`
      : `\n✅  已生成 ${results.length} 个绘制文件，输出目录: ${generator.getOutputDirectory()}`;
    console.log(outputMessage);

    for (const result of results) {
      const source = path.relative(process.cwd(), result.imagePath);
      const output = path.relative(process.cwd(), result.outputPath);
      console.log(`  • ${source} → ${output} (${result.rectangleCount} 矩形)`);
    }

    if (options.generateIndex && !options.outputToSource) {
      console.log('  • 已更新输出目录下的 index.ts 聚合文件');
    }
  } catch (error) {
    console.error(`❌  处理失败: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  run().catch(error => {
    console.error(`❌  未处理的异常: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
}
