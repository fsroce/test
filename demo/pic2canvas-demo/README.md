# pic2canvas 项目文件说明

图片转Canvas像素代码生成器，支持多种编码优化方案。

## 文件列表

## 脚本文件
- `helper.js` - 主生成器，生成standard/base64/unicode三种编码
- `optimize-helper.js` - 优化方案生成器，包含4种压缩方法
- `performance-test.js` - 性能测试对比工具

## 生成的Canvas文件
- `canvas.js` - 标准数组版本 (1.6MB)
- `canvas.base64.js` - Base64编码版本 (588KB)
- `canvas.unicode.js` - Unicode字符编码版本 (645KB)
- `canvas.direct.js` - 直接嵌入原图版本 (24KB) ⭐最优
- `canvas.downscale25.js` - 25%分辨率版本 (40KB)
- `canvas.downscale50.js` - 50%分辨率版本 (158KB)
- `canvas.quantized.js` - 颜色量化版本 (401KB)
- `canvas.differential.js` - 差分编码版本 (646KB)

## 演示文件
- `optimization-demo.html` - 所有优化方案效果对比
- `test-unicode.html` - Unicode/Base64/标准编码对比
- `canvas.html` - 基础canvas显示
- `index.html` - 项目入口

## 其他文件
- `img/grapefruit-slice.jpg` - 测试图片 (18KB)
- `package.json` - 项目依赖配置
- `node_modules/` - 依赖包目录

## 使用方法
```bash
npm install jimp
node helper.js        # 生成基础三种编码
node optimize-helper.js  # 生成优化方案
```