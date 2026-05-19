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
