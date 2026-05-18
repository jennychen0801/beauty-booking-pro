# 任務清單：Google OAuth 第三方登入實作

| 任務 ID | 任務描述 | 預估時間 | 相依性 |
| :--- | :--- | :--- | :--- |
| T1 | 在 Google Cloud Console 建立 OAuth 憑證並取得 ID/Secret | 30m | - |
| T2 | 在 Supabase Dashboard 配置 Google Auth Provider | 15m | T1 |
| T3 | 更新 `supabase_setup.sql` 中的 `handle_new_user` 函數以支援 OAuth 欄位映射 | 20m | - |
| T4 | 建立 `src/components/GoogleSignInButton.tsx` 元件 | 45m | - |
| T5 | 在 `src/pages/Login.tsx` 整合 Google 登入按鈕 | 30m | T4 |
| T6 | 測試開發環境下的 Google 授權跳轉與 Callback | 60m | T2, T5 |
| T7 | 驗證登入後 `public.profiles` 是否正確寫入頭像與姓名 | 30m | T3, T6 |
| T8 | 處理邊界情況（取消授權、網路錯誤等）的錯誤提示 | 45m | T6 |
| T9 | 設定 Netlify 正式環境的 Redirect URL 與環境變數 | 20m | T6 |
| T10 | 最終端到端測試與驗收 | 60m | All |
