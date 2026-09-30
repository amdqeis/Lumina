"""Email service using aiosmtplib for async SMTP delivery."""
import logging
import random
import string
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib

from app.config import settings

logger = logging.getLogger(__name__)


def generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP code."""
    return "".join(random.choices(string.digits, k=length))


async def send_email(to_email: str, subject: str, html_body: str) -> None:
    """Send an email via SMTP. Raises on failure."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM_EMAIL
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    try:
        await aiosmtplib.send(
            msg,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USERNAME,
            password=settings.SMTP_PASSWORD,
            use_tls=settings.SMTP_USE_TLS,
            start_tls=settings.SMTP_START_TLS,
        )
        logger.info("Email sent to %s [subject: %s]", to_email, subject)
    except Exception as exc:
        logger.error("Failed to send email to %s: %s", to_email, exc)
        raise


async def send_otp_email(to_email: str, otp: str, purpose: str) -> None:
    """Send a branded OTP email for verification or password reset."""
    if purpose == "verify_email":
        subject = "Lumina — Verify your email address"
        action_text = "Email Verification"
        message_text = "Use the code below to verify your email address. It expires in 10 minutes."
    else:
        subject = "Lumina — Password reset code"
        action_text = "Password Reset"
        message_text = "Use the code below to reset your password. It expires in 10 minutes."

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {{ margin: 0; padding: 0; background: #0e0e0e; font-family: 'Georgia', serif; color: #bac4b8; }}
        .container {{ max-width: 520px; margin: 40px auto; background: #141414; border: 1px solid rgba(186,196,184,0.12); }}
        .header {{ padding: 32px 40px 24px; border-bottom: 1px solid rgba(186,196,184,0.1); }}
        .logo {{ font-family: 'Arial Narrow', Arial, sans-serif; font-size: 20px; letter-spacing: 0.15em; text-transform: uppercase; color: #bac4b8; font-weight: 700; }}
        .body {{ padding: 40px; }}
        .label {{ font-family: monospace; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #6E756C; margin-bottom: 16px; }}
        .action {{ font-family: 'Georgia', serif; font-style: italic; font-size: 26px; color: #fff; margin-bottom: 20px; }}
        .message {{ font-size: 14px; line-height: 1.7; color: #bac4b8; margin-bottom: 36px; }}
        .otp-box {{ background: #1a1a1a; border: 1px solid rgba(204,153,51,0.3); padding: 24px; text-align: center; margin-bottom: 32px; }}
        .otp-code {{ font-family: monospace; font-size: 40px; letter-spacing: 0.3em; color: #cc9933; font-weight: 700; }}
        .footer {{ padding: 24px 40px; border-top: 1px solid rgba(186,196,184,0.1); font-family: monospace; font-size: 10px; letter-spacing: 0.1em; color: #4a4a4a; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">LUMINA</div>
        </div>
        <div class="body">
          <div class="label">[ {action_text} ]</div>
          <div class="action">{action_text}</div>
          <div class="message">{message_text}</div>
          <div class="otp-box">
            <div class="otp-code">{otp}</div>
          </div>
          <div class="message" style="font-size:12px; color: #6E756C;">
            If you did not request this, you can safely ignore this email.
          </div>
        </div>
        <div class="footer">
          &copy; Lumina Cloud Photography Archive &mdash; {to_email}
        </div>
      </div>
    </body>
    </html>
    """
    await send_email(to_email, subject, html)
