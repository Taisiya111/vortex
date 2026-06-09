import React from "react";

interface WelcomeEmailProps {
  name: string;
  appUrl: string;
}

export function WelcomeEmail({ name, appUrl }: WelcomeEmailProps) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Vortex</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0c14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0c14;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="text-align:center;padding:32px 40px;background:linear-gradient(135deg,#1e1b4b,#0f172a);border-radius:16px 16px 0 0;border:1px solid rgba(255,255,255,0.08);border-bottom:none;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                <tr>
                  <td style="width:44px;height:44px;background:linear-gradient(135deg,#7c3aed,#4f46e5);border-radius:10px;text-align:center;vertical-align:middle;">
                    <span style="font-size:22px;">⚡</span>
                  </td>
                  <td style="padding-left:12px;font-size:22px;font-weight:900;background:linear-gradient(135deg,#a78bfa,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;color:#a78bfa;">Vortex</td>
                </tr>
              </table>
              <h1 style="color:#f8fafc;font-size:28px;font-weight:800;margin:0 0 12px;line-height:1.2;">Welcome aboard, ${name}! 🎮</h1>
              <p style="color:#94a3b8;font-size:16px;margin:0;line-height:1.6;">Your gaming journey starts now. Track games, write reviews, and discover new worlds.</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background:#0f1629;padding:40px;border:1px solid rgba(255,255,255,0.08);border-top:none;border-bottom:none;">
              <p style="color:#cbd5e1;font-size:16px;line-height:1.8;margin:0 0 24px;">Here's what you can do with Vortex:</p>
              <!-- Features -->
              <table width="100%" cellpadding="0" cellspacing="0">
                ${[
                  ["📚", "Build your library", "Track playing, completed, and dropped games"],
                  ["⭐", "Rate & Review", "Share your thoughts and discover others"],
                  ["📁", "Create Collections", "Curate themed game lists to share"],
                  ["📊", "View Analytics", "See your gaming habits and statistics"],
                ].map(([icon, title, desc]) => `
                <tr>
                  <td style="padding:0 0 20px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:48px;height:48px;background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.2);border-radius:12px;text-align:center;vertical-align:middle;font-size:22px;">${icon}</td>
                        <td style="padding-left:16px;">
                          <p style="color:#f1f5f9;font-size:15px;font-weight:600;margin:0 0 4px;">${title}</p>
                          <p style="color:#64748b;font-size:14px;margin:0;">${desc}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`).join("")}
              </table>
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">
                      Go to my dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#0a0c14;padding:24px 40px;text-align:center;border:1px solid rgba(255,255,255,0.08);border-top:none;border-radius:0 0 16px 16px;">
              <p style="color:#475569;font-size:13px;margin:0 0 8px;">You're receiving this because you signed up at Vortex.</p>
              <p style="color:#475569;font-size:13px;margin:0;">© 2025 Vortex · <a href="${appUrl}/unsubscribe" style="color:#7c3aed;text-decoration:none;">Unsubscribe</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
