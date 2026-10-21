# 塔羅小屋詢問表單後端

本表單使用 Cloudflare Pages Functions 代理到獨立 Google Apps Script Web App。Apps Script 只讀取「客戶單」的訂單編號、Email、處理狀態與總金額，並把核准的問題寫入同一試算表的「塔羅小屋」分頁。

## 部署前設定

1. 在 Google Apps Script 建立一個**獨立新專案**，不要把程式加到手作工坊既有網站或既有 Apps Script 專案。
2. 將 `TarotInquiry.gs` 貼入新專案，於「專案設定」的 Script Properties 新增 `TAROT_INQUIRY_SECRET`。使用至少 32 個隨機字元；不要把值寫進 Git 或網站程式碼。
3. 將新 Apps Script 部署為 Web App：執行身分選「我」，存取權選「任何人」。它不會公開試算表內容；每個請求仍須通過上面的共享密鑰檢查。
4. 到 Emily 塔羅小屋 Cloudflare Pages 專案的 Production Functions variables/secrets，設定：
   - `TAROT_INQUIRY_SCRIPT_URL`：新 Web App 的 `/exec` URL（一般變數）
   - `TAROT_INQUIRY_SECRET`：與 Apps Script Script Properties 完全相同的密鑰（Secret）
5. 重新部署 Pages 專案。預覽環境不應使用正式密鑰或正式資料表。

## 驗證規則

- 單張：訂單狀態必須完全等於「已結單」，總金額至少 100 元。
- 三張：訂單狀態必須完全等於「已結單」，總金額至少 300 元。
- 第二步的 Email 必須與訂單 Email 相同。
- 第二步會取得一次性簡單加法題；後端驗證答案，錯誤最多可試三次，題目 10 分鐘後失效。
- 每個來源 IP 每分鐘最多 10 次驗證或送出請求；算數題僅用於防止誤觸，並非高強度機器人防護。
- 同一訂單只能成功寫入一次；送出時會在伺服器重新驗證並用 Script Lock 防止同時重複送出。
- 寫入「塔羅小屋」A:F：訂單編號、Email、稱呼、問題內容、單張或三張、處理狀態（初始為「待處理」）。

部署 Web App 為公開可呼叫端點是 Apps Script 的必要條件；共享密鑰只存於 Apps Script Script Properties 與 Cloudflare Secret，請勿放到前端或提交至 Git。
