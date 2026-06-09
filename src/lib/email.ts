import { Resend } from "resend";
import { WelcomeEmail } from "@/emails/welcome";
import { ResetPasswordEmail } from "@/emails/reset-password";

const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@vortex.app";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendWelcomeEmail(to: string, name: string) {
  return getResend().emails.send({
    from: `Vortex <${FROM}>`,
    to,
    subject: "Welcome to Vortex 🎮",
    html: WelcomeEmail({ name, appUrl: APP_URL }),
  });
}

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  return getResend().emails.send({
    from: `Vortex <${FROM}>`,
    to,
    subject: "Reset your Vortex password",
    html: ResetPasswordEmail({ resetUrl, name }),
  });
}

export async function sendNotificationEmail(to: string, subject: string, html: string) {
  return getResend().emails.send({
    from: `Vortex <${FROM}>`,
    to,
    subject,
    html,
  });
}
