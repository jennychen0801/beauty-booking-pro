# Beauty Booking Pro ✨

A modern, responsive, and full-featured beauty salon booking system built with React, Vite, Tailwind CSS, and Supabase.

## 📖 專案簡介 (Project Overview)

Beauty Booking Pro 是一個專為美容沙龍設計的線上預約系統。提供直覺的顧客預約流程，以及強大的管理員後台，讓美容院能夠輕鬆管理服務項目與顧客預約狀態。

### 主要功能 (Key Features)
* **顧客端 (Customer Portal)**
  * 瀏覽美容服務項目與價格。
  * 快速線上預約（支援選擇服務與時間）。
  * 查看個人歷史與未來的預約紀錄。
  * 即時預約狀態更新通知。
* **管理員後台 (Admin Dashboard)**
  * 權限控管 (RBAC)：專屬的 `/admin` 路由保護。
  * 營運數據儀表板：今日/本週預約數、預估營收。
  * 即時預約管理：確認、取消預約（整合 Supabase Realtime）。
  * 服務項目管理：啟用/停用（軟刪除）服務項目。
* **安全性 (Security)**
  * 完整的會員登入/註冊系統。
  * 基於 PostgreSQL RLS (Row Level Security) 的資料級別安全防護。

## 🛠 技術棧 (Tech Stack)

### Frontend (前端)
* **Framework:** React 18
* **Build Tool:** Vite
* **Language:** TypeScript
* **Routing:** React Router DOM v6
* **Styling:** Tailwind CSS + Autoprefixer
* **UI Components:** UI 佈局使用原生 HTML/Tailwind 構建，通知系統使用 `react-hot-toast`。

### Backend & Database (後端與資料庫)
* **BaaS:** Supabase
* **Database:** PostgreSQL
* **Authentication:** Supabase Auth (Email/Password)
* **Realtime:** Supabase Realtime Subscriptions

## 🚀 安裝與執行 (Installation & Setup)

### 先決條件 (Prerequisites)
* Node.js (建議使用最新 LTS 版本，例如 v20)
* 一個 Supabase 專案帳號

### 1. 複製專案與安裝依賴

```bash
git clone <repository-url>
cd beauty-booking-pro
npm install
```

### 2. 環境變數設定

在專案根目錄建立一個 `.env.local` 檔案，並填入您的 Supabase 專案金鑰：

```env
VITE_SUPABASE_URL=您的_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=您的_SUPABASE_ANON_KEY
```

### 3. 資料庫初始化

登入您的 Supabase 控制台，進入 **SQL Editor**，複製並執行專案根目錄下的 `supabase_setup.sql`。
這將會自動建立所需的資料表 (`profiles`, `services`, `bookings`)、安全策略 (RLS)、以及預設的服務項目範例資料。

### 4. 啟動開發伺服器

```bash
npm run dev
```

開啟瀏覽器並造訪 `http://localhost:5173` 即可看到應用程式。

## 💡 使用說明 (Usage Guide)

### 成為管理員 (Setting up an Admin Account)
預設情況下，新註冊的用戶角色為 `customer`。若要體驗管理後台：
1. 在前端介面註冊一個新帳號。
2. 進入 Supabase 的 **Table Editor**，找到 `profiles` 資料表。
3. 將您帳號對應的 `role` 欄位手動修改為 `admin`。
4. 在前端登出並重新登入，即可看見導覽列出現「管理後台」的選項。

### 部署到 Netlify (Deployment)
專案已配置好 `netlify.toml` 與 `public/_redirects` 支援 SPA 路由。
1. 在 Netlify Dashboard 連結您的 GitHub Repo。
2. Build command 設為 `npm run build`，Publish directory 設為 `dist`。
3. 在 Netlify 的 Environment Variables 中加入 `VITE_SUPABASE_URL` 與 `VITE_SUPABASE_ANON_KEY` 即可完成部署。

## 📜 授權 (License)
This project is open-source and available under the MIT License.