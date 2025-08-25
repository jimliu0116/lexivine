# Vercel 一鍵部署指南（LexiVine）

## 1) 準備
- 到 https://vercel.com 登入 / 註冊
- 新建 Project → **Import Project** → 上傳此專案 ZIP（或先 push 到 GitHub 再匯入）
- 儲存之後，Vercel 會自動偵測 Next.js 並建置

## 2) 設定環境變數（Dashboard → Settings → Environment Variables）
至少建議加入：

### NextAuth
- `NEXTAUTH_URL` → 先填 `https://<your-vercel-domain>.vercel.app`
- `NEXTAUTH_SECRET` → 本機用 `openssl rand -base64 32` 生成

### Resend（Email 登入 & 帳單通知）
- `RESEND_API_KEY` → Resend 金鑰
- `EMAIL_FROM` → no-reply@你的網域（或 Resend 提供的信箱）

### Stripe（訂閱）
- `STRIPE_SECRET_KEY` → Stripe 金鑰（sk_ 開頭）
- `STRIPE_PRICE_PRO` → Stripe Dashboard 的價格 ID（price_ 開頭）
- `STRIPE_PRICE_PLUS` → 同上
- `STRIPE_PRICE_TEAM` → 同上
- `STRIPE_WEBHOOK_SECRET` → 設 webhook 後，Stripe 產生的 whsec_ 值

### DB
- `DATABASE_URL` → `file:./dev.db`（SQLite；若改用 Postgres 也可）

### 語音供應商（可多選，其優先順序：OpenAI → Azure → GCP）
- `OPENAI_API_KEY`（若使用 Whisper/TTS）
- `AZURE_SPEECH_KEY`、`AZURE_SPEECH_REGION`
- `GCP_PROJECT_ID`、`GCP_SA_KEY`（Service Account JSON 內容）

> 注意：設定變數後請重新 Deploy 一次。

## 3) 設定 Stripe Webhook
- Stripe Dashboard → Developers → Webhooks → Add endpoint
- Endpoint URL：`https://<your-vercel-domain>.vercel.app/api/stripe/webhook`
- 事件可勾選：
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- 建立後會看到 **Signing secret**（whsec_...）→ 填回 Vercel 的 `STRIPE_WEBHOOK_SECRET`

## 4) 完成部署
- 按下 **Deploy** 後，會得到預覽網址，如：
  - `https://lexivine.vercel.app`
- 首次登入可使用 Email 登入（Resend 會寄驗證信）
- /pricing 會從 **/api/prices** 讀取 priceId，按「前往結帳」即可啟動 Stripe Checkout

## 5) 自訂網域（選配）
- 在 Vercel Project → Settings → Domains 加上你的網域
- DNS 依 Vercel 提示設定 CNAME / A 記錄
- 再將 `NEXTAUTH_URL` 改為正式網域並重新部署
