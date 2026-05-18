# Conventional Commits 規範範例

本專案遵循 [Conventional Commits](https://www.conventionalcommits.org/) 規範。

## Commit 格式
`<type>(<scope>): <description>`

## 常見類型 (Types)
- **feat**: 新增功能
- **fix**: 修補錯誤
- **docs**: 僅文件變動
- **style**: 格式變動（不影響程式碼邏輯）
- **refactor**: 重構（非新增功能也非錯誤修復）
- **perf**: 效能優化
- **test**: 新增或修改測試
- **chore**: 建置程序、輔助工具變動

## 範例
- `feat(auth): 實作 Google OAuth 登入功能`
- `fix(booking): 修正日期選取器的顯示錯誤`
- `docs(readme): 更新部署步驟說明`
- `refactor(admin): 重構儀表板的統計邏輯`
- `chore(deps): 升級 supabase-js 到 v2.x`
