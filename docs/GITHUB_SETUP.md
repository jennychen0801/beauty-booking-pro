# GitHub 分支保護規則設定指南

請管理員在 GitHub 倉庫的 **Settings > Branches > Branch protection rules** 進行以下設定：

## 1. `main` 分支保護規則
- **Pattern**: `main`
- **必選設定**:
  - [x] **Require a pull request before merging**: 禁止直接 Push。
  - [x] **Require approvals**: 建議至少 1 個 approve。
  - [x] **Restrict who can push to matching branches**: 僅限管理員。
  - [x] **Require status checks to pass before merging**: 建議勾選，確保 CI 通過。

## 2. `develop` 分支保護規則
- **Pattern**: `develop`
- **必選設定**:
  - [x] **Require a pull request before merging**: 禁止直接 Push。
  - [x] **Require approvals**: 至少需 1 個 approve 才能合併至 `main` (若此為中繼分支)。
  - [x] **Allow force pushes**: 禁止。
  - [x] **Allow deletions**: 禁止。

---

## 💡 開發流程 (Feature Branch Workflow)
1. 從 `develop` 建立功能分支：`git new feature/your-feature`
2. 完成開發並 Commit：`git commit -m "feat: ..."`
3. 推送並建立 PR 至 `develop`：`git done` (或手動 `git push`)
4. 團隊審核 PR 後合併至 `develop`。
5. 穩定後從 `develop` 建立 PR 合併至 `main`。
