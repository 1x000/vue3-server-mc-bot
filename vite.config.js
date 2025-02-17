import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    allowedHosts: [
      'ck3c.xpdbk.com',
      '.localhost' // 默认值，允许 localhost 连接，如果你没有更改过，建议保留
    ]
  }
})
