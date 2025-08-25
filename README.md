# LexiVine — Enterprise 版（Next.js 14 + Tailwind + NextAuth + Prisma + Stripe + Voice）

**內容包含：**
- Email 驗證信模板（品牌色＋Logo）
- 課程資料模型（關卡等級、解鎖條件、測驗題型、音檔、字幕）
- 使用者進度追蹤與排行榜（Prisma Schema + API + UI）
- Stripe 訂閱：Pro / Plus / Team（Checkout + Portal + Webhook）

## 快速開始
```bash
npm i
npm run db:migrate
npm run db:seed
npm run dev
# http://localhost:3000
```

## .env.local
參考 `.env.example`，至少需：
- NEXTAUTH_URL, NEXTAUTH_SECRET
- GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET（可選）
- RESEND_API_KEY, EMAIL_FROM（Email 登入用）
- STRIPE_SECRET_KEY, STRIPE_PRICE_PRO, STRIPE_PRICE_PLUS, STRIPE_PRICE_TEAM, STRIPE_WEBHOOK_SECRET
- OPENAI_API_KEY / AZURE_SPEECH_KEY / GCP_*（可選，雲端語音）
- DATABASE_URL="file:./dev.db"

## Prisma 模型（重點）
- Course / Lesson / Exercise（新增：解鎖條件、音檔、字幕、Quiz）
- Progress（每課成績 + XP）
- StudyLog（學習時長）
- Subscription（用戶訂閱）

## Stripe 路由
- `POST /api/stripe/checkout`：建立 Checkout Session（傳入 priceId）
- `POST /api/stripe/portal`：建立 Billing Portal
- `POST /api/stripe/webhook`：接收 webhook，更新 Subscription 狀態（需 `STRIPE_WEBHOOK_SECRET`）

> Webhook 事件：`checkout.session.completed`、`customer.subscription.updated`、`customer.subscription.deleted`。



## OpenAI Whisper & TTS 已內建
- **STT**：`POST /api/speech/transcribe` 使用 `whisper-1`，前端支援 MediaRecorder 錄音並上傳。
- **TTS**：`POST /api/speech/tts` 使用 `tts-1`（voice: alloy），前端可一鍵播放伺服器合成音。
- 設定：在 `.env.local` 放入 `OPENAI_API_KEY`。

