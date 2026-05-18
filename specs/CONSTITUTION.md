# 璀璨美學 Beauty Glow 預約網站 - 專案憲法 (CONSTITUTION)

這是本專案的最高指導原則。所有功能開發、程式碼重構與架構設計都必須符合本憲法之規範。

---

## 1. 核心資訊 (Core Information)
- **專案名稱**：璀璨美學 Beauty Glow 預約網站
- **專案目標**：提供高端、精緻且流暢的美容服務預約體驗。

## 2. 技術棧限制 (Tech Stack)
- **Frontend**: React (v18+) + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)

## 3. 程式碼風格與架構 (Coding Style & Architecture)
- **開發模式**：採用 Functional Components 與 Hooks。
- **異步處理**：統一使用 `async/await` 進行非同步操作與 API 呼叫。
- **狀態管理**：優先使用 Context API 或 React Hooks，避免引入不必要的複雜狀態庫。
- **模組化**：邏輯與 UI 分離，複雜邏輯應提取至 `hooks/` 或 `lib/`。

## 4. 命名約定 (Naming Conventions)
- **變數與函式**：`camelCase` (例如: `const userProfile`, `function fetchData()`)
- **元件**：`PascalCase` (例如: `AdminDashboard.tsx`, `BookingForm.tsx`)
- **檔案路徑**：`kebab-case` (例如: `src/components/protected-route.tsx`)
- **CSS 類名**：Tailwind CSS 優先，自定義類名遵循 `kebab-case`。

## 5. 安全原則 (Security)
- **資料保護**：資料庫所有資料表必須啟用 **RLS (Row Level Security)**。
- **金鑰管理**：嚴禁在前端暴露 `service_role` 等高權限 Key，僅限使用 `anon` key。
- **權限驗證**：所有管理操作必須在後端 (RLS) 與前端 (useAdmin) 進行雙重校驗。

## 6. UI 設計原則 (Design Principles)
- **視覺風格**：粉金色系 (Pink-Gold Palette)，展現現代、優雅與高質感的品牌形象。
- **響應式設計**：堅持 **Mobile-first** 策略，確保在移動設備上有完美的顯示效果。
- **互動反饋**：所有點擊操作應有明確的視覺反饋（如按鈕點擊態、Loading Spinner）。

## 7. 測試與驗收標準 (Testing & Quality)
- **功能開發**：每個新功能提案必須包含基本的 **驗收測試描述 (Acceptance Criteria)**。
- **代碼完整性**：所有新增檔案必須通過 TypeScript 類型檢查與 ESLint 靜態掃描。

## 8. Git 規範 (Git Standards)
- **提交訊息**：遵循 **Conventional Commits** 規範：
  - `feat`: 新增功能
  - `fix`: 修補錯誤
  - `docs`: 僅文件變動
  - `style`: 格式、分號等變動（不影響程式碼邏輯）
  - `refactor`: 重構（非新增功能或錯誤修復）
  - `chore`: 建置程序、輔助工具變動
  - `perf`: 效能優化
