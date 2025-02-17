// obf.js (或 vite-plugin-obfuscator.js)
import JavaScriptObfuscator from 'javascript-obfuscator';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * @param {import('javascript-obfuscator').ObfuscatorOptions} options
 */
export function obfuscator(options) {
    return {
        name: 'vite-plugin-obfuscator',
        apply: 'build', // 只在构建时应用
        async closeBundle() {
            const outputPath = 'dist'; // 默认的 Vite 构建输出目录
            const obfuscatorOptions = {
                compact: true,
                controlFlowFlattening: true,
                controlFlowFlatteningThreshold: 1,
                deadCodeInjection: true,
                deadCodeInjectionThreshold: 1,
                debugProtection: true,
                // debugProtectionInterval: 0, // 删除或注释掉，让 obfuscator 自己处理
                disableConsoleOutput: true,
                domainLock: [],
                domainLockRedirectUrl: 'about:blank',
                forceTransformStrings: [],  // 如果需要强制转换某些字符串，请谨慎使用
                identifierNamesGenerator: 'hexadecimal',
                identifiersPrefix: '',
                ignoreImports: false,
                inputFileName: '',
                log: false,
                numbersToExpressions: true,
                optionsPreset: 'high-obfuscation', // 关键：设置为 high-obfuscation
                renameGlobals: true,      // 开启全局重命名
                rotateStringArray: true,
                seed: 0,
                selfDefending: true,
                shuffleStringArray: true,
                splitStrings: true,
                splitStringsChunkLength: 5,
                stringArray: true,
                stringArrayEncoding: ['rc4'], // 使用 RC4 编码
                stringArrayIndexesType: [
                    'hexadecimal-number'
                ],
                stringArrayRotate: true,
                stringArrayShuffle: true,
                stringArrayWrappersCount: 5,  // 增加 wrappers 数量
                stringArrayWrappersChainedCalls: true,
                stringArrayWrappersParametersMaxCount: 5, // 增加参数数量
                stringArrayWrappersType: 'variable',
                target: 'browser',
                transformObjectKeys: true,
                unicodeEscapeSequence: true,
                ...options, // 允许在 vite.config.js 中覆盖某些选项
            };

            try {
                // 递归读取所有 js 文件
                const jsFiles = await readdirRecursive(outputPath);
                for (const filePath of jsFiles) {
                    const absolutePath = path.resolve(outputPath, filePath);
                    let code = await fs.readFile(absolutePath, 'utf-8');
                    const obfuscationResult = await JavaScriptObfuscator.obfuscate(code, obfuscatorOptions);
                    await fs.writeFile(absolutePath, obfuscationResult.getObfuscatedCode(), 'utf-8');
                    console.log(`Obfuscated: ${filePath}`);
                }
                console.log('Javascript files obfuscated successfully.');
            } catch (error) {
                console.error('An error occurred during obfuscation:', error);
            }
        },
    };
}

async function readdirRecursive(dir) {
    const files = [];
    const items = await fs.readdir(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = await fs.stat(fullPath);
        if (stat.isDirectory()) {
            const subFiles = await readdirRecursive(fullPath);
            files.push(...subFiles.map(file => path.join(item, file)));
        } else if (stat.isFile() && item.endsWith('.js')) {
            files.push(item);
        }
    }
    return files;
}
