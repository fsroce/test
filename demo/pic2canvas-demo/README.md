# 🎨 pic2canvas - 图片到Canvas像素级转换器

将图片转换为纯JavaScript代码，在Canvas上像素级还原图像的工具。支持多种编码方案，最高可实现26倍压缩优化！

## 🚀 快速开始

```bash
# 安装依赖
npm install jimp

# 基础用法 - 生成所有编码版本
node helper.js

# 优化方案测试
node optimize-helper.js
```

## 📋 项目文件说明

### 📝 核心文件
- **`helper.js`** - 主要生成器，支持standard/base64/unicode编码
- **`optimize-helper.js`** - 极限优化方案生成器
- **`performance-test.js`** - 性能基准测试工具

### 🎯 生成的Canvas文件
- **`canvas.direct.js`** - 🏆最优：直接嵌入原图 (24KB)
- **`canvas.downscale25.js`** - 降分辨率25% (40KB)
- **`canvas.downscale50.js`** - 降分辨率50% (158KB)
- **`canvas.quantized.js`** - 颜色量化64色 (401KB)
- **`canvas.unicode.js`** - Unicode字符编码 (645KB)
- **`canvas.base64.js`** - Base64编码 (588KB)
- **`canvas.js`** - 标准数组方式 (1.6MB)

### 🔍 演示文件
- **`optimization-demo.html`** - 🎯主要演示：所有优化方案对比
- **`test-unicode.html`** - Unicode/Base64/标准编码对比
- **`canvas.html`** - 基础Canvas显示

## 🏆 性能对比

| 方案 | 文件大小 | vs原图 | vs传统 | 分辨率 | 特点 |
|------|----------|--------|--------|--------|------|
| **🥇 直接嵌入** | **24KB** | **1.36×** | **26×更小** | 332×332 | 🏆最优方案 |
| 🥈 降分辨率25% | 40KB | 2.26× | 16×更小 | 83×83 | 极小文件 |
| 🥉 降分辨率50% | 158KB | 8.93× | 4×更小 | 166×166 | 平衡方案 |
| 颜色量化64色 | 401KB | 22.7× | 1.6×更小 | 332×332 | 减色保尺寸 |
| Unicode编码 | 645KB | 36.4× | 1.0× | 332×332 | 字符打包 |
| Base64编码 | 588KB | 33.2× | 1.1×更小 | 332×332 | 传统压缩 |
| 标准数组 | 1.6MB | 90.4× | 基准 | 332×332 | 原始方法 |

> 📊 测试图片：332×332像素柚子切片，原图18KB

## 💡 使用方法

### 1. 基础生成
```javascript
const { generateCanvasJS } = require('./helper');

// 生成标准版本
await generateCanvasJS('image.jpg', 'output.js', 'standard');

// 生成Unicode编码版本
await generateCanvasJS('image.jpg', 'output.js', 'unicode');

// 生成Base64编码版本
await generateCanvasJS('image.jpg', 'output.js', 'base64');
```

### 2. 极限优化
```javascript
const { generateDirectEmbed, generateDownscaled } = require('./optimize-helper');

// 🏆 最优：直接嵌入原图
await generateDirectEmbed('image.jpg', 'output.js');

// 降低分辨率
await generateDownscaled('image.jpg', 'output.js', 0.25); // 25%分辨率
```

### 3. HTML中使用
```html
<!DOCTYPE html>
<html>
<head><title>Canvas Demo</title></head>
<body>
    <canvas id="myCanvas"></canvas>
    <script src="canvas.direct.js"></script>
    <script>
        // 自动绘制到canvas
        drawGrapefruit('myCanvas');
    </script>
</body>
</html>
```

## 🧪 编码方案详解

### 🥇 直接嵌入原图 (推荐)
```javascript
// 原理：利用浏览器原生图像解码
const img = new Image();
img.src = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA...';
img.onload = () => ctx.drawImage(img, 0, 0);
```
**优势**: 文件最小，质量最好，加载最快

### 🔤 Unicode字符编码
```javascript
// 原理：每个字符打包2个字节
const packed = (byte1 << 8) | byte2;
unicodeData += String.fromCharCode(packed);
```
**优势**: 比Base64节省13%空间，避免填充开销

### 📦 Base64编码
```javascript
// 原理：传统Base64编码像素数据
const buffer = Buffer.from(pixelArray);
const base64Data = buffer.toString('base64');
```
**优势**: 标准方案，兼容性好

### 🎨 颜色量化
```javascript
// 原理：减少颜色数量，RGB565格式
const rgb565 = ((r >> 3) << 11) | ((g >> 2) << 5) | (b >> 3);
```
**优势**: 保持分辨率，牺牲颜色精度

## 🔧 自定义选项

### 修改分辨率
```javascript
// 在optimize-helper.js中调整scale参数
await generateDownscaled('image.jpg', 'output.js', 0.1); // 10%分辨率
```

### 修改颜色量化
```javascript
// 调整颜色数量
await generateQuantized('image.jpg', 'output.js', 32); // 32色
```

### 自定义函数名
```javascript
// 修改helper.js中的函数名
function drawMyImage(canvasId) { ... }
```

## 📈 性能测试

运行完整性能测试：
```bash
node --expose-gc performance-test.js
```

测试内容：
- 编码/解码速度对比
- 内存使用量分析
- 文件大小压缩率
- 正确性验证

## 🌟 最佳实践建议

### 📱 移动端优化
- 原图<50KB: 使用**直接嵌入**
- 原图>50KB: 使用**降分辨率25%**

### 🖥️ 桌面端
- 追求质量: **直接嵌入**
- 追求文件小: **降分辨率50%**

### 🎨 特殊场景
- 像素艺术: **标准数组**保持完整像素
- 动画帧: **颜色量化**减少总大小

## 🚀 未来优化方向

- [ ] 实现WebP格式支持
- [ ] 添加渐进式加载
- [ ] 支持多帧动画
- [ ] 实现更高效的压缩算法
- [ ] 添加Canvas到图片的逆向转换

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和PR！

---

**⭐ 如果这个项目对你有帮助，请给个Star！**