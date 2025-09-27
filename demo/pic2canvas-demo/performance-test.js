// 性能测试脚本：比较不同编码方案
const fs = require('fs');

// 生成测试数据 (模拟像素数据)
function generateTestPixels(width, height) {
    const pixels = [];
    for (let i = 0; i < width * height * 4; i++) {
        pixels.push(Math.floor(Math.random() * 256));
    }
    return pixels;
}

// 方案1：数组方式 (原始)
function encodeArray(pixels) {
    return JSON.stringify(pixels);
}

function decodeArray(encoded) {
    return JSON.parse(encoded);
}

// 方案2：Base64编码 (现有)
function encodeBase64(pixels) {
    const buffer = Buffer.from(pixels);
    return buffer.toString('base64');
}

function decodeBase64(encoded) {
    const buffer = Buffer.from(encoded, 'base64');
    return Array.from(buffer);
}

// 方案3：Unicode字符打包 (新方案)
function encodeUnicode(pixels) {
    let result = '';
    // 每个字符打包2个像素 (每像素1字节，字符16位)
    for (let i = 0; i < pixels.length; i += 2) {
        const byte1 = pixels[i] || 0;
        const byte2 = pixels[i + 1] || 0;
        const packed = (byte1 << 8) | byte2;
        result += String.fromCharCode(packed);
    }
    return result;
}

function decodeUnicode(encoded) {
    const pixels = [];
    for (let i = 0; i < encoded.length; i++) {
        const packed = encoded.charCodeAt(i);
        const byte1 = (packed >> 8) & 0xFF;
        const byte2 = packed & 0xFF;
        pixels.push(byte1);
        if (pixels.length < encoded.length * 2) { // 避免添加填充的0
            pixels.push(byte2);
        }
    }
    return pixels;
}

// 方案4：高密度Unicode打包 (4字节打包到1个字符)
function encodeUnicodeHigh(pixels) {
    let result = '';
    // 每个字符打包4个像素 (使用更高的Unicode码点)
    for (let i = 0; i < pixels.length; i += 4) {
        const byte1 = pixels[i] || 0;
        const byte2 = pixels[i + 1] || 0;
        const byte3 = pixels[i + 2] || 0;
        const byte4 = pixels[i + 3] || 0;

        // 使用Unicode私有区域 (E000-F8FF)
        const packed = 0xE000 + ((byte1 << 12) | (byte2 << 8) | (byte3 << 4) | (byte4 >> 4));
        result += String.fromCharCode(packed);
    }
    return result;
}

function decodeUnicodeHigh(encoded) {
    const pixels = [];
    for (let i = 0; i < encoded.length; i++) {
        const packed = encoded.charCodeAt(i) - 0xE000;
        const byte1 = (packed >> 12) & 0xFF;
        const byte2 = (packed >> 8) & 0xFF;
        const byte3 = (packed >> 4) & 0xFF;
        const byte4 = ((packed & 0xF) << 4); // 丢失了4位精度

        pixels.push(byte1, byte2, byte3, byte4);
    }
    return pixels;
}

// 性能测试函数
function performanceTest(name, encodeFunc, decodeFunc, pixels) {
    console.log(`\n=== ${name} ===`);

    // 编码测试
    const encodeStart = process.hrtime.bigint();
    const encoded = encodeFunc(pixels);
    const encodeEnd = process.hrtime.bigint();
    const encodeTime = Number(encodeEnd - encodeStart) / 1000000; // 转换为毫秒

    // 解码测试
    const decodeStart = process.hrtime.bigint();
    const decoded = decodeFunc(encoded);
    const decodeEnd = process.hrtime.bigint();
    const decodeTime = Number(decodeEnd - decodeStart) / 1000000;

    // 计算大小
    const originalSize = pixels.length;
    const encodedSize = typeof encoded === 'string' ?
        encoded.length * 2 : // JavaScript字符串UTF-16，每字符2字节
        Buffer.byteLength(encoded, 'utf8');

    // 验证正确性
    const isCorrect = JSON.stringify(pixels.slice(0, 100)) === JSON.stringify(decoded.slice(0, 100));

    console.log(`编码时间: ${encodeTime.toFixed(2)}ms`);
    console.log(`解码时间: ${decodeTime.toFixed(2)}ms`);
    console.log(`总时间: ${(encodeTime + decodeTime).toFixed(2)}ms`);
    console.log(`原始大小: ${originalSize} bytes`);
    console.log(`编码大小: ${encodedSize} bytes`);
    console.log(`压缩率: ${(originalSize / encodedSize).toFixed(2)}x`);
    console.log(`正确性: ${isCorrect ? '✅' : '❌'}`);

    return {
        name,
        encodeTime,
        decodeTime,
        totalTime: encodeTime + decodeTime,
        originalSize,
        encodedSize,
        compressionRatio: originalSize / encodedSize,
        isCorrect
    };
}

// 主测试函数
function runTests() {
    console.log('🚀 开始性能测试...\n');

    // 测试不同尺寸
    const testSizes = [
        { name: '小图 50x50', width: 50, height: 50 },
        { name: '中图 200x200', width: 200, height: 200 },
        { name: '大图 500x500', width: 500, height: 500 }
    ];

    const results = [];

    for (const size of testSizes) {
        console.log(`\n📐 测试尺寸: ${size.name} (${size.width * size.height * 4} 像素数据)`);
        console.log('='.repeat(60));

        const pixels = generateTestPixels(size.width, size.height);

        const sizeResults = [
            performanceTest('数组方式', encodeArray, decodeArray, pixels),
            performanceTest('Base64编码', encodeBase64, decodeBase64, pixels),
            performanceTest('Unicode打包(2字节)', encodeUnicode, decodeUnicode, pixels),
            performanceTest('Unicode高密度(4字节)', encodeUnicodeHigh, decodeUnicodeHigh, pixels)
        ];

        results.push({ size: size.name, results: sizeResults });
    }

    // 汇总报告
    console.log('\n📊 性能汇总报告');
    console.log('='.repeat(80));

    const methods = ['数组方式', 'Base64编码', 'Unicode打包(2字节)', 'Unicode高密度(4字节)'];

    for (const method of methods) {
        console.log(`\n🔸 ${method}:`);
        for (const result of results) {
            const methodResult = result.results.find(r => r.name === method);
            if (methodResult) {
                console.log(`  ${result.size}: 总时间 ${methodResult.totalTime.toFixed(2)}ms, 压缩率 ${methodResult.compressionRatio.toFixed(2)}x`);
            }
        }
    }

    return results;
}

// 内存使用测试
function memoryTest() {
    console.log('\n🧠 内存使用测试');
    console.log('='.repeat(50));

    const pixels = generateTestPixels(300, 300); // 300x300图片

    // 强制垃圾回收
    if (global.gc) {
        global.gc();
    }

    const initialMemory = process.memoryUsage();

    console.log(`初始内存: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);

    // 测试各种编码的内存占用
    const encodings = {};

    encodings.array = encodeArray(pixels);
    const arrayMem = process.memoryUsage();

    encodings.base64 = encodeBase64(pixels);
    const base64Mem = process.memoryUsage();

    encodings.unicode = encodeUnicode(pixels);
    const unicodeMem = process.memoryUsage();

    encodings.unicodeHigh = encodeUnicodeHigh(pixels);
    const unicodeHighMem = process.memoryUsage();

    console.log(`数组编码后: ${(arrayMem.heapUsed / 1024 / 1024).toFixed(2)} MB (+${((arrayMem.heapUsed - initialMemory.heapUsed) / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`Base64编码后: ${(base64Mem.heapUsed / 1024 / 1024).toFixed(2)} MB (+${((base64Mem.heapUsed - arrayMem.heapUsed) / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`Unicode编码后: ${(unicodeMem.heapUsed / 1024 / 1024).toFixed(2)} MB (+${((unicodeMem.heapUsed - base64Mem.heapUsed) / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`Unicode高密度后: ${(unicodeHighMem.heapUsed / 1024 / 1024).toFixed(2)} MB (+${((unicodeHighMem.heapUsed - unicodeMem.heapUsed) / 1024 / 1024).toFixed(2)} MB)`);
}

// 运行测试
if (require.main === module) {
    // 检查是否可以强制垃圾回收
    if (!global.gc) {
        console.log('💡 提示: 使用 node --expose-gc performance-test.js 可以获得更准确的内存测试结果');
    }

    const results = runTests();
    memoryTest();
}

module.exports = { runTests, memoryTest };