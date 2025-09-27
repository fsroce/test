const fs = require('fs');
const Jimp = require('jimp');
const path = require('path');

// 方案1: 直接嵌入原图Base64
async function generateDirectEmbed(imagePath, outputPath) {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).slice(1);

    const jsCode = `/*直接嵌入原图 ${imagePath} ${imageBuffer.length}bytes*/
function drawGrapefruit(c){const n=document.getElementById(c);if(!n)return;const t=n.getContext('2d'),i=new Image();i.onload=()=>{n.width=i.width;n.height=i.height;t.drawImage(i,0,0)};i.src='data:image/${ext};base64,${base64Image}'}
document.addEventListener('DOMContentLoaded',()=>{const c=document.querySelector('canvas');c&&(c.id||='autoCanvas',drawGrapefruit(c.id))});`;

    fs.writeFileSync(outputPath, jsCode);
    return { size: jsCode.length, originalSize: imageBuffer.length };
}

// 方案2: 降低分辨率
async function generateDownscaled(imagePath, outputPath, scale = 0.5) {
    const image = await Jimp.read(imagePath);
    const newWidth = Math.floor(image.bitmap.width * scale);
    const newHeight = Math.floor(image.bitmap.height * scale);

    image.resize(newWidth, newHeight);

    const pixelArray = [];
    for (let y = 0; y < newHeight; y++) {
        for (let x = 0; x < newWidth; x++) {
            const color = Jimp.intToRGBA(image.getPixelColor(x, y));
            pixelArray.push(color.r, color.g, color.b, color.a);
        }
    }

    // Unicode编码
    let unicodeData = '';
    for (let i = 0; i < pixelArray.length; i += 2) {
        const byte1 = pixelArray[i] || 0;
        const byte2 = pixelArray[i + 1] || 0;
        const packed = (byte1 << 8) | byte2;
        unicodeData += String.fromCharCode(packed);
    }

    const jsCode = `/*降分辨率${scale}x ${newWidth}x${newHeight}*/
function drawGrapefruit(c){const n=document.getElementById(c);if(!n)return;const t=n.getContext('2d');n.width=${newWidth};n.height=${newHeight};const e=t.createImageData(${newWidth},${newHeight}),r=e.data,u='${unicodeData.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}';for(let i=0,p=0;i<u.length;i++){const k=u.charCodeAt(i);r[p++]=(k>>8)&255;if(p<r.length)r[p++]=k&255}t.putImageData(e,0,0)}
document.addEventListener('DOMContentLoaded',()=>{const c=document.querySelector('canvas');c&&(c.id||='autoCanvas',drawGrapefruit(c.id))});`;

    fs.writeFileSync(outputPath, jsCode);
    return { size: jsCode.length, pixels: newWidth * newHeight };
}

// 方案3: 颜色量化(减色)
async function generateQuantized(imagePath, outputPath, colors = 64) {
    const image = await Jimp.read(imagePath);

    // 简单颜色量化：将每个颜色通道量化到更少位数
    const bitsPerChannel = Math.log2(colors) / 3; // 大致估算
    const step = Math.pow(2, 8 - Math.ceil(bitsPerChannel));

    const width = image.bitmap.width;
    const height = image.bitmap.height;

    const pixelArray = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const color = Jimp.intToRGBA(image.getPixelColor(x, y));
            // 量化颜色
            const qr = Math.round(color.r / step) * step;
            const qg = Math.round(color.g / step) * step;
            const qb = Math.round(color.b / step) * step;
            pixelArray.push(qr, qg, qb, color.a);
        }
    }

    // 用更短的字符编码
    let compactData = '';
    for (let i = 0; i < pixelArray.length; i += 3) {
        const r = pixelArray[i] || 0;
        const g = pixelArray[i + 1] || 0;
        const b = pixelArray[i + 2] || 0;
        // 压缩RGB到16位 (5-6-5格式)
        const rgb565 = ((r >> 3) << 11) | ((g >> 2) << 5) | (b >> 3);
        compactData += String.fromCharCode(rgb565);
    }

    const jsCode = `/*颜色量化${colors}色 ${width}x${height}*/
function drawGrapefruit(c){const n=document.getElementById(c);if(!n)return;const t=n.getContext('2d');n.width=${width};n.height=${height};const e=t.createImageData(${width},${height}),r=e.data,d='${compactData.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}';for(let i=0,p=0;i<d.length;i++){const rgb=d.charCodeAt(i),R=((rgb>>11)&31)<<3,G=((rgb>>5)&63)<<2,B=(rgb&31)<<3;r[p++]=R;r[p++]=G;r[p++]=B;r[p++]=255}t.putImageData(e,0,0)}
document.addEventListener('DOMContentLoaded',()=>{const c=document.querySelector('canvas');c&&(c.id||='autoCanvas',drawGrapefruit(c.id))});`;

    fs.writeFileSync(outputPath, jsCode);
    return { size: jsCode.length, colors, step };
}

// 方案4: 差分编码
async function generateDifferential(imagePath, outputPath) {
    const image = await Jimp.read(imagePath);
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    const pixelArray = [];
    let lastR = 0, lastG = 0, lastB = 0, lastA = 255;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const color = Jimp.intToRGBA(image.getPixelColor(x, y));

            // 计算差值 (带符号)
            const deltaR = color.r - lastR;
            const deltaG = color.g - lastG;
            const deltaB = color.b - lastB;
            const deltaA = color.a - lastA;

            // 将差值转为无符号 (加128偏移)
            pixelArray.push(
                (deltaR + 128) & 0xFF,
                (deltaG + 128) & 0xFF,
                (deltaB + 128) & 0xFF,
                (deltaA + 128) & 0xFF
            );

            lastR = color.r;
            lastG = color.g;
            lastB = color.b;
            lastA = color.a;
        }
    }

    // Unicode编码差分数据
    let diffData = '';
    for (let i = 0; i < pixelArray.length; i += 2) {
        const byte1 = pixelArray[i] || 0;
        const byte2 = pixelArray[i + 1] || 0;
        const packed = (byte1 << 8) | byte2;
        diffData += String.fromCharCode(packed);
    }

    const jsCode = `/*差分编码 ${width}x${height}*/
function drawGrapefruit(c){const n=document.getElementById(c);if(!n)return;const t=n.getContext('2d');n.width=${width};n.height=${height};const e=t.createImageData(${width},${height}),r=e.data,d='${diffData.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}';let R=0,G=0,B=0,A=255;for(let i=0,p=0;i<d.length;i++){const k=d.charCodeAt(i),d1=(k>>8)-128,d2=(k&255)-128;R=(R+d1)&255;G=(G+d2)&255;r[p++]=R;r[p++]=G;if(++i<d.length){const k2=d.charCodeAt(i),d3=(k2>>8)-128,d4=(k2&255)-128;B=(B+d3)&255;A=(A+d4)&255;r[p++]=B;r[p++]=A}}t.putImageData(e,0,0)}
document.addEventListener('DOMContentLoaded',()=>{const c=document.querySelector('canvas');c&&(c.id||='autoCanvas',drawGrapefruit(c.id))});`;

    fs.writeFileSync(outputPath, jsCode);
    return { size: jsCode.length };
}

// 测试所有优化方案
async function testAllOptimizations() {
    const imagePath = './img/grapefruit-slice.jpg';

    console.log('🎯 开始测试所有优化方案...\n');

    // 原图信息
    const originalImage = fs.readFileSync(imagePath);
    const jimp = await Jimp.read(imagePath);
    console.log(`📄 原图信息:`);
    console.log(`  文件大小: ${(originalImage.length / 1024).toFixed(2)} KB`);
    console.log(`  分辨率: ${jimp.bitmap.width}x${jimp.bitmap.height}`);
    console.log(`  理论像素数据: ${(jimp.bitmap.width * jimp.bitmap.height * 4 / 1024).toFixed(2)} KB\n`);

    const results = [];

    // 方案1: 直接嵌入
    console.log('🔸 方案1: 直接嵌入原图...');
    const result1 = await generateDirectEmbed(imagePath, 'canvas.direct.js');
    results.push({ name: '直接嵌入', size: result1.size, ratio: result1.size / result1.originalSize });
    console.log(`  生成大小: ${(result1.size / 1024).toFixed(2)} KB`);
    console.log(`  vs原图: ${(result1.size / result1.originalSize).toFixed(2)}x\n`);

    // 方案2: 降分辨率 50%
    console.log('🔸 方案2: 降分辨率50%...');
    const result2 = await generateDownscaled(imagePath, 'canvas.downscale50.js', 0.5);
    results.push({ name: '降分辨率50%', size: result2.size, pixels: result2.pixels });
    console.log(`  生成大小: ${(result2.size / 1024).toFixed(2)} KB`);
    console.log(`  像素数: ${result2.pixels}\n`);

    // 方案2b: 降分辨率 25%
    console.log('🔸 方案2b: 降分辨率25%...');
    const result2b = await generateDownscaled(imagePath, 'canvas.downscale25.js', 0.25);
    results.push({ name: '降分辨率25%', size: result2b.size, pixels: result2b.pixels });
    console.log(`  生成大小: ${(result2b.size / 1024).toFixed(2)} KB`);
    console.log(`  像素数: ${result2b.pixels}\n`);

    // 方案3: 颜色量化
    console.log('🔸 方案3: 颜色量化64色...');
    const result3 = await generateQuantized(imagePath, 'canvas.quantized.js', 64);
    results.push({ name: '颜色量化64色', size: result3.size, colors: result3.colors });
    console.log(`  生成大小: ${(result3.size / 1024).toFixed(2)} KB\n`);

    // 方案4: 差分编码
    console.log('🔸 方案4: 差分编码...');
    const result4 = await generateDifferential(imagePath, 'canvas.differential.js');
    results.push({ name: '差分编码', size: result4.size });
    console.log(`  生成大小: ${(result4.size / 1024).toFixed(2)} KB\n`);

    // 汇总对比
    console.log('📊 优化方案汇总:');
    console.log('='.repeat(60));
    results.sort((a, b) => a.size - b.size);

    for (const result of results) {
        const sizeKB = (result.size / 1024).toFixed(2);
        const vsOriginal = (result.size / originalImage.length).toFixed(2);
        console.log(`${result.name.padEnd(15)}: ${sizeKB.padStart(8)} KB (vs原图 ${vsOriginal}x)`);
    }

    console.log(`\n🏆 最优方案: ${results[0].name} - ${(results[0].size / 1024).toFixed(2)} KB`);

    return results;
}

if (require.main === module) {
    testAllOptimizations().catch(console.error);
}

module.exports = {
    generateDirectEmbed,
    generateDownscaled,
    generateQuantized,
    generateDifferential,
    testAllOptimizations
};