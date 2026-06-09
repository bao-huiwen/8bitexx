import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 部署到 GitHub Pages 项目页时，把仓库名填入 VITE_BASE，例如：VITE_BASE=/bazi-xiuxian-life/ npm run build
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || './',
})
