# 技術設計：預約修改功能

## 1. 架構方案
為了更精確地管理「釋放舊時段 + 佔用新時段」，我們將引入 `time_slots` 表格。每次預約或修改預約時，將會與該表進行連動。

### 流程設計：
1. **載入資料**：前端點擊修改，從 `bookings` 獲取當前資訊。
2. **查詢可用性**：根據 `service_id` 與選擇的日期，從 `time_slots` 撈取 `is_booked = false` 的時段。
3. **提交更新 (Transaction)**：
   - 釋放舊的 `time_slot` (`is_booked = false`)。
   - 佔用新的 `time_slot` (`is_booked = true`)。
   - 更新 `bookings` 表的 `scheduled_at`。

## 2. 前端變更
- **`MyBookings.tsx`**：
  - 實作「距離預約時間 > 24 小時」的判斷邏輯。
  - 加入 `ModifyBookingModal` 元件。
- **`ModifyBookingModal.tsx`** (新元件)：
  - 複用原預約流程中的 `Calendar` 與 `TimePicker` 邏輯。
  - 呼叫 `supabase.rpc()` 執行原子化的更新操作（建議使用 RPC 以確保 Transaction 安全性）。

## 3. 後端變更 (Supabase)
- **新資料表 `public.time_slots`**：管理每個服務的可預約時間。
- **資料庫函數 (RPC) `modify_booking_time`**：
  ```sql
  -- 偽代碼
  CREATE OR REPLACE FUNCTION modify_booking_time(booking_id uuid, new_time timestamp)
  RETURNS void AS $$
  BEGIN
    -- 1. 檢查 24 小時限制
    -- 2. 檢查新時段是否可用
    -- 3. 更新舊時段為可用
    -- 4. 更新新時段為不可用
    -- 5. 更新預約記錄
  END;
  $$ LANGUAGE plpgsql;
  ```

## 4. 權限規範
- 修改操作必須驗證 `auth.uid() = bookings.user_id`。
- `time_slots` 表設定 RLS：所有登入用戶可 `SELECT`，只有管理員可 `INSERT/UPDATE`（除了預約/修改時的自動連動）。
