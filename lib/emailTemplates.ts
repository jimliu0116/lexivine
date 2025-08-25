import { BRAND } from '@/brand.config'
export function verificationEmailTemplate(url: string){
  return `<!doctype html><html><body style="margin:0;background:#f8fafc">
  <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Inter,system-ui,Arial;color:#0f172a">
    <tr><td align="center" style="padding:32px 0">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;box-shadow:0 8px 24px rgba(2,8,23,.06);overflow:hidden">
        <tr><td style="background:linear-gradient(90deg, ${BRAND.primary}, ${BRAND.secondary});padding:24px;color:#fff;">
          <div style="display:flex;align-items:center;gap:12px">
            <img src="https://dummyimage.com/40x40/000/fff&text=LV" width="40" height="40" style="border-radius:12px" alt="logo"/>
            <div style="font-weight:700;font-size:18px">Sign in to ${BRAND.name}</div>
          </div>
        </td></tr>
        <tr><td style="padding:24px">
          <p style="margin:0 0 12px 0">Hi,</p>
          <p style="margin:0 0 16px 0">Click the button below to sign in:</p>
          <p style="text-align:center;margin:24px 0">
            <a href="${url}" style="background:linear-gradient(90deg, ${BRAND.primary}, ${BRAND.secondary});color:#fff;text-decoration:none;padding:12px 20px;border-radius:12px;display:inline-block">Sign in</a>
          </p>
          <p style="font-size:12px;color:#475569">If you didn’t request this, you can safely ignore this email.</p>
        </td></tr>
      </table>
      <div style="font-size:12px;color:#64748b;margin-top:12px">© ${new Date().getFullYear()} ${BRAND.name}</div>
    </td></tr>
  </table>
</body></html>`
}


export function verificationEmailTemplateZHTW(url: string){
  return `<!doctype html><html><body style="margin:0;background:#f8fafc">
    <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Inter,system-ui,Arial;color:#0f172a">
      <tr><td align="center" style="padding:32px 0">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;box-shadow:0 8px 24px rgba(2,8,23,.06);overflow:hidden">
          <tr><td style="background:linear-gradient(90deg, #0ea5e9, #10b981);padding:24px;color:#fff;">
            <div style="font-weight:700;font-size:18px">登入 <strong>LexiVine</strong></div>
          </td></tr>
          <tr><td style="padding:24px">
            <p style="margin:0 0 12px 0">您好：</p>
            <p style="margin:0 0 16px 0">請點擊下方按鈕完成登入：</p>
            <p style="text-align:center;margin:24px 0">
              <a href="${url}" style="background:linear-gradient(90deg, #0ea5e9, #10b981);color:#fff;text-decoration:none;padding:12px 20px;border-radius:12px;display:inline-block">登入</a>
            </p>
            <p style="font-size:12px;color:#475569">若非您本人操作，請忽略本信。</p>
          </td></tr>
        </table>
        <div style="font-size:12px;color:#64748b;margin-top:12px">© ${new Date().getFullYear()} LexiVine</div>
      </td></tr>
    </table>
  </body></html>`
}

export function billingEmailTemplate(subject: string, title: string, body: string){
  return `<!doctype html><html><body style="margin:0;background:#f8fafc">
    <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Inter,system-ui,Arial;color:#0f172a">
      <tr><td align="center" style="padding:32px 0">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;box-shadow:0 8px 24px rgba(2,8,23,.06);overflow:hidden">
          <tr><td style="background:linear-gradient(90deg, #0ea5e9, #10b981);padding:24px;color:#fff;">
            <div style="font-weight:700;font-size:18px">${title}</div>
          </td></tr>
          <tr><td style="padding:24px">
            <p style="margin:0 0 16px 0">${body}</p>
            <p style="font-size:12px;color:#475569">如需管理訂閱，請前往帳單入口。</p>
          </td></tr>
        </table>
        <div style="font-size:12px;color:#64748b;margin-top:12px">© ${new Date().getFullYear()} LexiVine</div>
      </td></tr>
    </table>
  </body></html>`
}
