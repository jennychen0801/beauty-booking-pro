# Beauty Booking Pro

Beauty Booking Pro 是一個現代化的美容預約系統。

## 技術棧 (Tech Stack)

- **前端:** React, Vite
- **後端/BaaS:** Supabase (PostgreSQL, Auth, Storage)
- **執行環境:** Node.js

## 安裝步驟 (Installation)

1. 複製專案到本地端:
   ```bash
   git clone <repository-url>
   cd beauty-booking-pro
   ```
2. 安裝依賴:
   ```bash
   npm install
   ```
3. 設定環境變數:
   複製 `.env.example` 並重新命名為 `.env.local`，填入你的 Supabase 憑證。
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. 啟動開發伺服器:
   ```bash
   npm run dev
   ```
