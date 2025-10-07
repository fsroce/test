# pic2canvas 项目文件说明

图片转Canvas像素代码生成器，支持多种编码优化方案。

## 文件列表

### 脚本文件
- `helper.js` - 主生成器，生成standard/base64/unicode三种编码
- `performance-test.js` - 性能测试对比工具

### 生成的Canvas文件
- `canvas.js` - 标准数组版本 (1.6MB)
- `canvas.array.js` - 压缩数组版本 (1.5MB) - 使用terser压缩
- `canvas.base64.js` - Base64编码版本 (575KB)
- `canvas.unicode.js` - Unicode字符编码版本 (575KB)

### 演示文件
- `index.html` - 项目入口
- `canvas.array.html` - 压缩数组版本演示
- `canvas.unicode.html` - Unicode编码版本演示

### 其他文件
- `img/grapefruit-slice.jpg` - 测试图片
- `package.json` - 项目依赖配置
- `node_modules/` - 依赖包目录

## 使用方法
```bash
npm install jimp
node helper.js        # 生成基础三种编码版本
```