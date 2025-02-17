import JavaScriptObfuscator from 'javascript-obfuscator';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * @param {import('javascript-obfuscator').ObfuscatorOptions} options
 */
export function obfuscator(options) {
    return {
        name: 'vite-plugin-obfuscator',
        apply: 'build',
        async closeBundle() {
            const outputPath = 'dist';
            const obfuscatorOptions = {
                compact: true, // 保持启用
                controlFlowFlattening: true,
                renameGlobals: true,
                transformObjectKeys: true,
                unicodeEscapeSequence: true,
                optionsPreset: 'low-obfuscation', // 使用官方低混淆预设
                deadCodeInjection: true,
                debugProtection: true,
                disableConsoleOutput: true,
                identifierNamesGenerator: 'hexadecimal',
                numbersToExpressions: true,
                rotateStringArray: true,
                selfDefending: true,
                shuffleStringArray: true,
                splitStrings: true,
                stringArray: true,
                stringArrayIndexShift: true,
                stringArrayRotate: true,
                stringArrayShuffle: true,
                stringArrayThreshold: 0.1,
                ...options,
            };

            try {
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
