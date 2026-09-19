![工作坊完成徽章](https://img.shields.io/badge/GitHub_Copilot_實戰工作坊-已完成-1F883D?style=for-the-badge&logo=githubcopilot&logoColor=white)

# 待辦清單 Web App

這是一個在 **GitHub Copilot 實戰工作坊**中完成的待辦清單 Web App。專案以純前端技術實作，提供待辦事項管理、篩選與深色模式，並將資料保存在瀏覽器中，重新整理後仍可保留使用狀態。

## 線上展示

`https://hochun836.github.io/copilot-workshop-0919/`

## 功能

- 新增待辦事項，輸入空白內容時不會新增。
- 勾選或取消勾選待辦事項；完成的項目會顯示刪除線並淡化。
- 刪除單筆待辦事項。
- 顯示整體未完成項目數量，數字不受目前篩選條件影響。
- 依「全部」、「未完成」或「已完成」篩選待辦事項。
- 記住使用者上次選擇的篩選條件，重新整理後維持篩選狀態。
- 篩選結果為空時，顯示對應提示，並說明項目並未被刪除。
- 手動切換淺色與深色模式，按鈕會顯示對應圖示與文字。
- 儲存深色模式偏好；未手動設定時，依照作業系統的 `prefers-color-scheme` 顯示主題。
- 使用 `localStorage` 保存待辦資料、主題偏好與篩選偏好。
- 置中卡片式介面，支援手機螢幕與鍵盤焦點操作。

## 技術

- 使用 HTML、CSS 與原生 JavaScript，沒有使用任何框架或套件。
- 不建立 `package.json`，不需要建置流程。
- 不引用外部 CDN，檔案可直接離線開啟。
- 使用 CSS 變數集中管理淺色與深色主題的色彩。
- 使用瀏覽器 `localStorage` 保存待辦事項與使用者偏好。
- 主要檔案固定為根目錄的 `index.html`、`styles.css` 與 `app.js`。

## 開發方式

- **GitHub Copilot Agent Mode**：先以完整需求建立基礎待辦清單，再逐步加入深色模式、篩選與使用者偏好保存等功能；每次修改後檢查實際差異與執行結果。
- **MCP**：透過 `.vscode/mcp.json` 設定 Microsoft Learn 與 GitHub MCP。Microsoft Learn 用來查詢 `prefers-color-scheme` 和無障礙色彩對比建議，GitHub MCP 用來讀取 issue、查詢 issue 狀態與建立 Pull Request。
- **`.github/copilot-instructions.md`**：將純前端限制、命名方式、CSS 變數與 DOM 產生規則寫成專案規範，讓後續協作遵循一致的開發方式。
- **`.github/prompts/fix-issue.prompt.md`**：把處理 GitHub issue 的流程整理成可重複使用的 agentic workflow，依序完成讀取 issue、提出計畫、等待確認、建立分支、修改、驗證、推送與建立 Pull Request。

## 我學到什麼

1. Agent Mode 適合處理有明確需求的多檔案任務，但仍需要逐項檢查產出的程式與實際行為。
2. MCP 能把官方文件與 GitHub issue 的上下文帶進開發流程，讓決策不只依賴本機檔案。
3. 使用 `localStorage` 時，除了保存資料，也要處理初始化、無效值與重新整理後的狀態恢復。
4. 深色模式不能只確認顏色會切換，還需要檢查不同主題下的文字、控制項與焦點狀態是否有足夠對比。
5. 將專案規範與 issue 修復步驟寫成檔案後，流程更容易重複、檢查與交接。
