export function ResetPasswordEmail({ resetUrl, name }: { resetUrl: string; name: string }) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Reset your password</title></head>
<body style="margin:0;padding:0;background-color:#0a0c14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0c14;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="text-align:center;padding:32px 40px;background:linear-gradient(135deg,#1e1b4b,#0f172a);border-radius:16px 16px 0 0;border:1px solid rgba(255,255,255,0.08);border-bottom:none;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                <tr>
                  <td style="width:44px;height:44px;background:linear-gradient(135deg,#7c3aed,#4f46e5);border-radius:10px;text-align:center;vertical-align:middle;"><span style="font-size:22px;">⚡</span></td>
                  <td style="padding-left:12px;font-size:22px;font-weight:900;color:#a78bfa;">Vortex</td>
                </tr>
              </table>
              <h1 style="color:#f8fafc;font-size:26px;font-weight:800;margin:0 0 12px;">Password Reset Request</h1>
              <p style="color:#94a3b8;font-size:16px;margin:0;">Hi ${name}, we received a request to reset your password.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#0f1629;padding:40px;border:1px solid rgba(255,255,255,0.08);border-top:none;border-bottom:none;">
              <p style="color:#cbd5e1;font-size:16px;line-height:1.8;margin:0 0 24px;">Click the button below to create a new password. This link expires in <strong style="color:#f1f5f9;">1 hour</strong>.</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 32px;">
                    <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:14px 36px;border-radius:10px;">
                      Reset my password →
                    </a>
                  </td>
                </tr>
              </table>
              <div style="background:rgba(124,58,237,0.05);border:1px solid rgba(124,58,237,0.2);border-radius:10px;padding:16px;">
                <p style="color:#94a3b8;font-size:13px;margin:0 0 8px;">Or copy and paste this link:</p>
                <p style="color:#7c3aed;font-size:13px;word-break:break-all;margin:0;">${resetUrl}</p>
              </div>
              <p style="color:#475569;font-size:14px;margin:24px 0 0;">If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#0a0c14;padding:24px 40px;text-align:center;border:1px solid rgba(255,255,255,0.08);border-top:none;border-radius:0 0 16px 16px;">
              <p style="color:#475569;font-size:13px;margin:0;">© 2025 Vortex · This link expires in 1 hour.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
