# 技術設計：Google OAuth 第三方登入

## 1. 架構流程
1. **前端發起**：調用 `supabase.auth.signInWithOAuth({ provider: 'google' })`。
2. **Google 授權**：使用者在 Google 網域完成授權。
3. **回傳 Callback**：Google 回傳 Code 或 Token 至 Supabase 設定的 Redirect URL。
4. **會話建立**：Supabase 客戶端自動交換 Session。
5. **資料同步**：資料庫 `handle_new_user` 觸發器捕獲 `INSERT` 事件，從 `new.raw_user_meta_data` 提取資料。

## 2. 前端變更
- **新元件 `GoogleSignInButton`**：
  - 位置：`src/components/GoogleSignInButton.tsx`。
  - 樣式：符合 Google 品牌規範的按鈕。
  - 邏輯：封裝 `signInWithOAuth` 調用。
- **登入頁整合**：
  - 修改 `src/pages/Login.tsx`，在現有登入表單下方加入 `GoogleSignInButton`。
- **AuthContext 強化**：
  - 確保 OAuth 登入後的 `onAuthStateChange` 能觸發 `fetchProfile` 更新全域狀態。

## 3. 後端變更 (Supabase)
- **Database Function `handle_new_user`**：
  - 更新邏輯以支援 OAuth 元數據提取：
    ```sql
    full_name = COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    avatar_url = COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
    ```

## 4. 環境設定步驟 (Infrastructure)
1. **Google Cloud Console**：
   - 建立 OAuth 2.0 用戶端 ID。
   - 設定「已授權的重新導向 URI」：`https://<project-ref>.supabase.co/auth/v1/callback`。
2. **Supabase Dashboard**：
   - 前往 Auth -> Providers -> Google。
   - 啟用 Provider，填入 Client ID 與 Client Secret。
3. **Redirect URL**：
   - 在 Supabase Auth 設定中加入應用程式的正式網址 (Production) 與本地網址 (Localhost)。
