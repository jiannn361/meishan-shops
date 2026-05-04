import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 自動更新 Service Worker (背景默默更新)
      registerType: 'autoUpdate',
      // 自動注入註冊腳本到 index.html
      injectRegister: 'auto',
      
      workbox: {
        // 設定要快取到手機裡的檔案類型 (極度激進快取策略)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
        // 提高單一檔案大小限制到 5MB (確保大圖片也能被快取)
        maximumFileSizeToCacheInBytes: 5000000, 
        
        // 如果有外部的圖片 (例如 Google Map 圖片或 Airtable 的圖片) 也可以設定快取
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/v5\.airtableusercontent\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'airtable-image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 快取保留 7 天
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      
      // 這是安裝成手機 App 的設定 (遊客可以把網站加到手機桌面變成一個真正的 App)
      manifest: {
        name: '梅山太平旅遊導覽',
        short_name: '梅山導覽',
        description: '探索梅山、太平雲梯的最佳指南',
        theme_color: '#059669',
        background_color: '#ffffff',
        display: 'standalone', // 隱藏瀏覽器網址列，看起來像原生 App
        icons: [
          {
            src: 'logo-192.png', // 換成您的 192x192 圖片檔名
            sizes: '192x192',
            type: 'image/png'    // 格式改成 image/png
          },
          {
            src: 'logo-512.png', // 換成您的 512x512 圖片檔名
            sizes: '512x512',
            type: 'image/png'    // 格式改成 image/png
          }
        ]
      }
    })
  ]
})