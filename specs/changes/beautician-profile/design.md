# 設計：美容師個人頁面 (Beautician Profile)

## 1. 路由設計
- **路徑**：`/beautician/:id`
- **組件**：`BeauticianProfile.tsx`

## 2. 資料庫模型 (Supabase)

### `public.beauticians` (既有或需建立)
- `id`: uuid, primary key
- `full_name`: text
- `avatar_url`: text
- `specialties`: text[] (專長)
- `experience_years`: integer (年資)
- `bio`: text (簡介)
- `rating`: numeric (平均評分，可由 triggers 自動計算或手動維護)

### `public.services` (關聯)
- 透過 `beautician_services` 中間表或 `beautician_id` 外鍵關聯。
- *建議*：使用 `beautician_id` 外鍵在 `services` 表，或建立 `beautician_services` 多對多關聯。

### `public.reviews` (新建立)
- `id`: uuid, primary key
- `beautician_id`: uuid, references beauticians
- `user_id`: uuid, references auth.users
- `rating`: integer (1-5)
- `comment`: text
- `created_at`: timestamp

## 3. UI 組件結構
- `BeauticianProfilePage` (Container)
  - `ProfileHeader`: 包含頭像、姓名、星星評分、年資。
  - `BioSection`: 個人簡介。
  - `ServicesList`: 服務項目卡片。
  - `ReviewsSection`: 評價列表。
  - `BookingActionCard`: 懸浮或側邊欄的預約按鈕。

## 4. 樣式與佈局 (Tailwind CSS)
- **Container**: `max-w-7xl mx-auto px-4 py-8`
- **Layout**: 
  - Mobile: `flex flex-col gap-8`
  - Desktop: `grid grid-cols-3 gap-8` (左 1/3 為 Profile，右 2/3 為 Services & Reviews)
- **Star Rating**: 使用 `lucide-react` 的 `Star` 圖示。

## 5. API 查詢範例
```javascript
const { data, error } = await supabase
  .from('beauticians')
  .select(`
    *,
    services (*),
    reviews (
      *,
      profiles (full_name)
    )
  `)
  .eq('id', id)
  .single();
```
