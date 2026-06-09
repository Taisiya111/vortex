import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { randomBytes } from "crypto";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const { email } = parsed.data;

    // Always return the same response to prevent email enumeration
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      // Return success anyway to prevent email enumeration
      return NextResponse.json(
        { message: "If that email exists, a reset link has been sent." },
        { status: 200 }
      );
    }

    // Invalidate existing tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: email.toLowerCase() },
    });

    // Generate a secure token
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        email: email.toLowerCase(),
        token,
        expires,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    // Send email via Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "Vortex <noreply@vortex.gg>",
      to: [user.email],
      subject: "Reset your Vortex password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0f; color: #e2e2e7; margin: 0; padding: 20px;">
            <div style="max-width: 560px; margin: 0 auto; background: #111118; border-radius: 16px; padding: 40px; border: 1px solid #1e1e2d;">
              <div style="margin-bottom: 32px;">
                <span style="font-size: 24px; font-weight: 900; background: linear-gradient(135deg, #7c3aed, #4f46e5); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">VORTEX</span>
              </div>
              <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 16px; color: #ffffff;">Reset your password</h1>
              <p style="color: #a1a1b5; line-height: 1.6; margin: 0 0 24px;">
                Hi ${user.name ?? "there"}, you requested a password reset for your Vortex account. Click the button below to set a new password.
              </p>
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; margin-bottom: 24px;">
                Reset Password
              </a>
              <p style="color: #6b6b80; font-size: 13px; line-height: 1.6; margin: 0 0 8px;">
                This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
              </p>
              <p style="color: #4a4a5a; font-size: 12px; margin: 24px 0 0; padding-top: 24px; border-top: 1px solid #1e1e2d;">
                If the button doesn't work, copy and paste this URL into your browser:<br />
                <span style="color: #7c3aed; word-break: break-all;">${resetUrl}</span>
              </p>
            </div>
          </body>
        </html>
      `,
    });

    return NextResponse.json(
      { message: "If that email exists, a reset link has been sent." },
      { status: 200 }
    );
  } catch (err) {
    console.error("[FORGOT_PASSWORD]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
