# 提案：Google OAuth 第三方登入

## 1. 功能名稱
Google OAuth 第三方登入 (Google Social Login)

## 2. 業務背景
目前的系統僅支援電子郵件與密碼登入。為了降低新使用者的註冊門檻並提升用戶體驗，我們希望提供一鍵使用 Google 帳號登入的功能。這能有效減少使用者記住密碼的負擔，並縮短註冊流程。

## 3. 成功標準
- 使用者可以在登入頁面看到「使用 Google 登入」按鈕。
- 使用者能成功跳轉至 Google 授權頁面並完成授權。
- 授權成功後，使用者應被自動導向回應用程式（首頁或原頁面）。
- 系統自動建立對應的 `profiles` 記錄（包含 Google 提供的姓名與頭像）。
- 登入狀態應在 `AuthContext` 中正確更新。

## 4. 影響範圍
- **Auth 模組**：整合 `supabase.auth.signInWithOAuth`。
- **UI 頁面**：登入頁 (`Login.tsx`)、註冊頁需新增 Google 登入入口。
- **AuthContext**：確保 OAuth 狀態變更後能觸發正確的 profile 同步。
- **Database**: `handle_new_user` 觸發器需能正確解析 Google 傳入的 `raw_user_meta_data`。
