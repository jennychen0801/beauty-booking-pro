# 任務清單：預約修改功能實作

| 任務 ID | 任務描述 | 預估時間 | 相依性 |
| :--- | :--- | :--- | :--- |
| T1 | 建立 `public.time_slots` 資料表與相關 RLS 策略 | 30m | - |
| T2 | 更新 `supabase_setup.sql` 並為現有服務生成初始時段資料 | 45m | T1 |
| T3 | 在 Supabase 建立 `reschedule_booking` RPC 函數處理原子化更新 | 60m | T1 |
| T4 | 在 `src/lib/utils.ts` 加入日期時間工具函式 (如：checkCanModify) | 20m | - |
| T5 | 在 `MyBookings.tsx` 中實作「修改預約」按鈕的顯示/隱藏邏輯 | 30m | T4 |
| T6 | 建立 `src/components/ModifyBookingModal.tsx` 元件 UI | 60m | - |
| T7 | 實作 Modal 中的日期選取與可選時段查詢邏輯 | 60m | T2, T6 |
| T8 | 整合 RPC 呼叫至 Modal 的「確認修改」按鈕 | 45m | T3, T7 |
| T9 | 處理修改成功後的列表即時更新 (Realtime 或 Refetch) | 30m | T8 |
| T10 | 邊界情況測試（24h 內修改、時段衝突測試）與最終驗收 | 60m | All |
