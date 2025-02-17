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
                controlFlowFlattening: false, // 关闭控制流平坦化
                deadCodeInjection: false, // 关闭死代码注入
                debugProtection: false, // 关闭debug保护
                disableConsoleOutput: false, // 允许console输出
                identifierNamesGenerator: 'hexadecimal',
                renameGlobals: false, // 关闭全局重命名
                rotateStringArray: true,
                shuffleStringArray: true,
                stringArray: true,
                stringArrayEncoding: [], // 关闭字符串数组编码
                splitStrings: false, // 关闭字符串拆分
                unicodeEscapeSequence: false, // 关闭unicode转义序列
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
