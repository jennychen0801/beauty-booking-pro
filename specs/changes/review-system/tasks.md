# 任務列表：顧客評價系統 (Customer Review System)

## 階段 1：資料庫準備 (Database)
- [ ] 執行 SQL 建立 `reviews` 資料表。
- [ ] 新增 `booking_id` 的唯一索引 (Unique Index)。
- [ ] 建立 `update_beautician_stats` 函數與觸發器。
- [ ] 設定 RLS 策略，限制插入與讀取權限。
- [ ] 在 `beauticians` 表中新增 `review_count` 欄位（預設 0）。

## 階段 2：型別與 API (Frontend Setup)
- [ ] 在 `src/types/index.ts` 中新增 `Review` 型別並更新 `Beautician` 型別。
- [ ] 實作查詢預約評價狀態的 Helper 函數。

## 階段 3：組件開發 (UI Implementation)
- [ ] 建立 `src/components/ReviewModal.tsx`。
- [ ] 實作互動式星星評分組件 (StarRating)。
- [ ] 更新 `src/pages/MyBookings.tsx`：
  - [ ] 判斷並顯示「留下評價」按鈕。
  - [ ] 整合 `ReviewModal`。
- [ ] 更新 `src/pages/BeauticianProfile.tsx`：
  - [ ] 顯示平均星等與評價總數。
  - [ ] 格式化評價列表展示。

## 階段 4：測試與優化 (Testing)
- [ ] 測試重複提交評價是否會被資料庫擋掉。
- [ ] 驗證未完成的預約是否無法看到評價按鈕。
- [ ] 檢查美容師評分更新的即時性。
- [ ] 響應式測試：確保評價列表在手機版顯示正常。
