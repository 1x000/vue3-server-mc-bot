// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { obfuscator } from './obf'

export default defineConfig({
    plugins: [
        vue(),
        obfuscator({
            // 覆盖默认选项
            //debugProtection: false, // 关闭 debug protection
        })
    ],
    base: './', // 根据你的部署情况修改
    build: {
        target: 'es2015',
        sourcemap: false // 禁用 Source Maps
    }
})
