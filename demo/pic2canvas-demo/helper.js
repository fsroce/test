// 使用 jimp 库的像素提取器
// 安装: npm install jimp
// 优点: 纯JavaScript，无需系统依赖

const fs = require('fs');
const Jimp = require('jimp');
const path = require('path');

async function generateCanvasJS(imagePath = 'img/grapefruit-slice.jpg', outputPath = 'canvas.js', encoding = 'standard') {
    try {
        console.log(`🔍 正在读取图片: ${imagePath}`);
        
        // 检查文件是否存在
        if (!fs.existsSync(imagePath)) {
            throw new Error(`文件不存在: ${imagePath}`);
        }
        
        // 读取图片
        const image = await Jimp.read(imagePath);
        const width = image.bitmap.width;
        const height = image.bitmap.height;
        
        console.log(`✅ 图片加载成功，尺寸: ${width}x${height}`);
        console.log(`📊 总像素数: ${width * height}`);
        console.log(`🔄 开始生成${encoding}编码JavaScript代码...`);
        
        // 生成像素数据
        const pixelArray = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const color = Jimp.intToRGBA(image.getPixelColor(x, y));
                pixelArray.push(color.r, color.g, color.b, color.a);
            }
        }

        // 生成JavaScript代码
        let jsCode;

        if (encoding === 'base64') {
            // Base64编码版本
            
            const buffer = Buffer.from(pixelArray);
            const base64Data = buffer.toString('base64');
            
            jsCode = `/*${imagePath} ${width}x${height} Base64编码 ${new Date().toISOString()}*/
function drawGrapefruit(c){const n=document.getElementById(c);if(!n)return;const t=n.getContext('2d');n.width=${width};n.height=${height};const e=t.createImageData(${width},${height}),r=e.data,a=atob('${base64Data}');for(let o=0;o<a.length;o++)r[o]=a.charCodeAt(o);t.putImageData(e,0,0)}
document.addEventListener('DOMContentLoaded',()=>{const c=document.querySelector('canvas');c&&(c.width||=400,c.height||=400,c.id||='autoCanvas',drawGrapefruit(c.id))});`;

        } else if (encoding === 'unicode') {
            // Unicode字符编码版本 - 最大密度编码
            let unicodeData = '';

            // 使用0x20-0x7E范围的95个可打印字符，避免控制字符和引号
            const charset = [];
            for (let i = 32; i <= 126; i++) {
                if (i !== 34 && i !== 39 && i !== 92) { // 排除 " ' \ 避免转义
                    charset.push(i);
                }
            }
            const base = charset.length; // 92个字符

            // 每3个字节打包成4个字符 (3*8 = 24bits, 4*log2(92) ≈ 4*6.5 = 26bits)
            for (let i = 0; i < pixelArray.length; i += 3) {
                const byte1 = pixelArray[i] || 0;
                const byte2 = pixelArray[i + 1] || 0;
                const byte3 = pixelArray[i + 2] || 0;

                let value = (byte1 << 16) | (byte2 << 8) | byte3;

                // 转换为4个字符
                let encoded = '';
                for (let j = 0; j < 4; j++) {
                    encoded = String.fromCharCode(charset[value % base]) + encoded;
                    value = Math.floor(value / base);
                }
                unicodeData += encoded;
            }

            jsCode = `/*${imagePath} ${width}x${height} Unicode编码 ${new Date().toISOString()}*/
function drawGrapefruit(c){const n=document.getElementById(c);if(!n)return;const t=n.getContext('2d');n.width=${width};n.height=${height};const e=t.createImageData(${width},${height}),r=e.data,u='${unicodeData}',s=[];for(let i=32;i<=126;i++)if(i!==34&&i!==39&&i!==92)s.push(i);for(let i=0,p=0;i<u.length;i+=4){let v=0;for(let j=0;j<4&&i+j<u.length;j++){const idx=s.indexOf(u.charCodeAt(i+j));v=v*${base}+idx}r[p++]=(v>>16)&255;r[p++]=(v>>8)&255;r[p++]=v&255}t.putImageData(e,0,0)}
document.addEventListener('DOMContentLoaded',()=>{const c=document.querySelector('canvas');c&&(c.width||=400,c.height||=400,c.id||='autoCanvas',drawGrapefruit(c.id))});`;
        } else {
            // 标准版本
            jsCode = `// 像素级柚子切片还原代码
// 自动生成自: ${imagePath}
// 图片尺寸: ${width}x${height}
// 总像素数: ${width * height}
// 生成时间: ${new Date().toLocaleString()}

function drawGrapefruit(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // 设置canvas尺寸
    canvas.width = ${width};
    canvas.height = ${height};
    
    // 创建像素数据
    const imageData = ctx.createImageData(${width}, ${height});
    const pixels = imageData.data;
    
    // 像素数据数组 (RGBA格式)
    const pixelData = [`;

            // 添加像素数据
            let pixelCount = 0;
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const color = Jimp.intToRGBA(image.getPixelColor(x, y));
                    
                    // 每8个像素换行
                    if (pixelCount % 8 === 0) {
                        jsCode += '\n        ';
                    }
                    
                    jsCode += `${color.r},${color.g},${color.b},${color.a}`;
                    
                    if (pixelCount < width * height - 1) {
                        jsCode += ',';
                    }
                    
                    pixelCount++;
                    
                    // 显示进度
                    if (pixelCount % 10000 === 0) {
                        const progress = (pixelCount / (width * height) * 100).toFixed(1);
                        console.log(`⏳ 进度: ${progress}% (${pixelCount}/${width * height})`);
                    }
                }
            }
            
            jsCode += `
    ];
    
    // 将像素数据复制到ImageData
    for (let i = 0; i < pixelData.length; i++) {
        pixels[i] = pixelData[i];
    }
    
    // 绘制到canvas
    ctx.putImageData(imageData, 0, 0);
    
    console.log('🍊 像素级柚子切片绘制完成！');
    console.log('图片尺寸: ${width}x${height}');
    console.log('总像素数: ${width * height}');
}

// 页面加载完成后自动绘制
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.querySelector('canvas');
    if (canvas) {
        // 设置默认尺寸和ID（如果没有设置的话）
        if (!canvas.width) canvas.width = ${width};
        if (!canvas.height) canvas.height = ${height};
        if (!canvas.id) canvas.id = 'autoCanvas';
        
        drawGrapefruit(canvas.id);
    }
});

// 也可以手动调用: drawGrapefruit('your-canvas-id');
`;
        }

        // 写入文件
        fs.writeFileSync(outputPath, jsCode, 'utf8');
        
        console.log(`✅ canvas.js 生成完成！`);
        console.log(`📁 文件路径: ${path.resolve(outputPath)}`);
        console.log(`📏 文件大小: ${(jsCode.length / 1024).toFixed(2)} KB`);
        console.log(`🚀 现在可以在HTML中使用了！`);
        
        return jsCode;
        
    } catch (error) {
        console.error(`❌ 错误: ${error.message}`);
        throw error;
    }
}

// 自动检测并生成
async function autoGenerate() {
    console.log('🚀 启动像素提取器 (Jimp版)...\n');
    
    const possiblePaths = [
        './img/grapefruit-slice.jpg',
        'img/grapefruit-slice.jpeg', 
        'img/grapefruit-slice.png',
        'grapefruit-slice.jpg',
        'grapefruit-slice.jpeg',
        'grapefruit-slice.png',
        'grapefruit.jpg',
        'grapefruit.jpeg', 
        'grapefruit.png',
        'image.jpg',
        'image.jpeg',
        'image.png'
    ];
    
    for (const imagePath of possiblePaths) {
        try {
            // 生成标准版本
            await generateCanvasJS(imagePath, 'canvas.js', 'standard');
            console.log(`\n🎉 标准版本: ${imagePath} -> canvas.js`);

            // 生成Base64版本
            await generateCanvasJS(imagePath, 'canvas.base64.js', 'base64');
            console.log(`🎉 Base64版本: ${imagePath} -> canvas.base64.js`);

            // 生成Unicode版本
            await generateCanvasJS(imagePath, 'canvas.unicode.js', 'unicode');
            console.log(`🎉 Unicode版本: ${imagePath} -> canvas.unicode.js`);
            
            return;
        } catch (error) {
            console.log(`❌ ${imagePath} - ${error.message}`);
        }
    }
    
    console.log('\n🚫 未找到任何可用的图片文件！');
    console.log('\n💡 使用说明:');
    console.log('1. 确保图片文件存在于以下路径之一:');
    possiblePaths.forEach(p => console.log(`   - ${p}`));
    console.log('2. 安装依赖: npm install jimp');
    console.log('3. 运行脚本: node pixel-extractor.js');
}

// 如果直接运行此文件
if (require.main === module) {
    autoGenerate();
}

module.exports = { generateCanvasJS };