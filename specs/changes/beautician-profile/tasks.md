# 任務列表：美容師個人頁面 (Beautician Profile)

## 階段 1：資料庫準備 (Database)
- [ ] 執行 SQL 遷移，建立 `beauticians` 表（若尚未建立）。
- [ ] 建立 `reviews` 表及其關聯外鍵。
- [ ] 更新 `services` 表以支援與美容師的關聯。
- [ ] 設定 RLS 策略，允許所有人讀取美容師資料、服務與評價。
- [ ] 插入測試用的美容師、服務與評價資料。

## 階段 2：前端架構 (Frontend Setup)
- [ ] 在 `src/types/index.ts` 中新增 `Beautician` 與 `Review` 的型別定義。
- [ ] 在 `src/App.tsx` 中新增路由 `/beautician/:id`。
- [ ] 建立基礎組件檔案 `src/pages/BeauticianProfile.tsx`。

## 階段 3：頁面開發 (Implementation)
- [ ] 實作資料獲取邏輯（fetch data from Supabase）。
- [ ] 實作 `ProfileHeader` 組件（大頭照、評分等）。
- [ ] 實作 `BioSection` 與 `ServicesList` 組件。
- [ ] 實作 `ReviewsSection` 展示評價列表。
- [ ] 實作「立即預約」按鈕的跳轉邏輯。

## 階段 4：優化與測試 (Optimization & Testing)
- [ ] 加入 Loading 狀態與錯誤處理（如 404）。
- [ ] 調整 Tailwind CSS 確保響應式佈局符合規範（1 欄 vs 2 欄）。
- [ ] 驗證 URL 參數傳遞至預約頁面的正確性。
- [ ] 進行跨裝置瀏覽測試。
