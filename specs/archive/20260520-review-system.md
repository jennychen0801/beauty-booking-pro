# 顧客評價系統 (Customer Review System) - Archived 2026-05-20

## Specification

# 規範：顧客評價系統 (Customer Review System)

## 1. 使用者故事 (User Stories)
- **作為顧客**，在完成預約後，我希望能為這次服務評分並留言，以便表達我的滿意度或提出建議。
- **作為顧客**，我在挑選美容師時，希望能看到其他人的真實評價，這能幫我做決定。
- **作為美容師**，我希望能看到顧客對我的評價，以便我改進服務。

## 2. 驗收標準 (Acceptance Criteria)

### 場景：在「我的預約」留下評價 ✅
- **Given**：使用者有一筆狀態為 `confirmed` 且預約時間已過的紀錄。
- **When**：使用者查看該預約項目。
- **Then**：應顯示「留下評價」按鈕。
- **Given**：該預約已經有評價紀錄。
- **Then**：不應顯示「留下評價」按鈕，或顯示「已評價」。

### 場景：提交評價表單 ✅
- **Given**：使用者點擊「留下評價」按鈕。
- **When**：彈出 Modal，包含 1-5 星選擇與文字輸入框。
- **And**：使用者選擇 5 星並輸入「服務很棒」。
- **And**：點擊「提交」。
- **Then**：系統應驗證資料完整性，儲存至 `reviews` 表。
- **And**：美容師的平均分數應自動更新。

### 場景：查看美容師評價 ✅
- **Given**：使用者進入路徑 `/beautician/:id`。
- **Then**：頁面應顯示該美容師的「總評價數」與「平均星等」。
- **And**：下方列表應按時間倒序顯示評價內容。

## 3. 安全與約束 (Security & Constraints)
- **RLS 策略**：
  - 只有預約的 `user_id` 匹配當前使用者時，才允許插入評價。
  - 插入時必須檢查 `booking_id` 是否對應一個 `confirmed` 且時間已過的預約。
  - 每個 `booking_id` 在 `reviews` 表中必須唯一（Unique Constraint）。
- **資料驗證**：
  - 星等必須在 1-5 之間。
  - 評論文字限制 500 字以內。

---

## Design

# 設計：顧客評價系統 (Customer Review System)

## 1. 資料庫模型 (Supabase)

### `public.reviews` (新建立)
- `id`: uuid, primary key
- `booking_id`: uuid, references bookings, UNIQUE (確保一筆預約一評)
- `customer_id`: uuid, references profiles(id)
- `beautician_id`: uuid, references beauticians(id)
- `rating`: integer, check (rating >= 1 and rating <= 5)
- `comment`: text, length limit 500
- `created_at`: timestamp with time zone, default now()

### `public.beauticians` (更新欄位)
- `rating`: numeric (平均評分，由 trigger 更新)
- `review_count`: integer (評價總數，由 trigger 更新)

## 2. 資料庫邏輯 (PostgreSQL)

### 更新平均分觸發器 (Trigger)
```sql
CREATE OR REPLACE FUNCTION update_beautician_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.beauticians
  SET 
    rating = (SELECT AVG(rating)::numeric(2,1) FROM public.reviews WHERE beautician_id = NEW.beautician_id),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE beautician_id = NEW.beautician_id)
  WHERE id = NEW.beautician_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_inserted
AFTER INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION update_beautician_stats();
```

## 3. UI 組件結構

### `ReviewModal.tsx`
- 使用 `lucide-react` 的 `Star` 圖示製作互動式評分器。
- 狀態管理：`rating` (number), `comment` (string)。
- 提交邏輯：呼叫 `supabase.from('reviews').insert(...)`。

### `MyBookings.tsx` (更新)
- 計算 `is_completable`：`status === 'confirmed' && new Date(scheduled_at) < new Date()`。
- 查詢評價狀態：左連接 `reviews` 或單獨查詢該預約是否已評。

### `BeauticianProfile.tsx` (更新)
- 修改 `select` 語句以包含評價統計：
```javascript
.select(`
  *,
  reviews (
    *,
    profiles (full_name)
  )
`)
```

## 4. RLS 策略 (SQL)
```sql
CREATE POLICY "Users can only review their own completed bookings"
ON public.reviews FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bookings
    WHERE id = booking_id
    AND user_id = auth.uid()
    AND status = 'confirmed'
    AND scheduled_at < now()
  )
);
```
