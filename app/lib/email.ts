import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendConfirmationEmail(email: string) {
  try {
    await resend.emails.send({
      from: 'Lahara Team <no-reply@lahara.work>',
      to: email,
      subject: 'Welcome to Lahara! You’re officially on the waitlist 🚀',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
                    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; color: #333;">
          <h2 style="color: #6C59D5; margin-bottom: 0;">Hello from Lahara! 👋</h2>
          <p style="font-size: 16px; line-height: 1.5;">
            Thank you for joining Nepal's first freelancing and influencer marketplace — we’re thrilled to have you onboard!
          </p>
          <p style="font-size: 16px; line-height: 1.5;">
            You’re now part of a growing community of talented freelancers, influencers, and innovative brands ready to take their reach to the next level.
          </p>
          <p style="font-size: 16px; line-height: 1.5;">
            We’ll keep you updated with exclusive news, early access opportunities, and tips to maximize your experience once we launch.
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;" />
          <p style="font-size: 14px; color: #555;">
            In the meantime, if you have any questions or want to get in touch, feel free to email us anytime at
            <a href="mailto:support@lahara.work" style="color: #6C59D5; text-decoration: none;">support@lahara.work</a>.
          </p>
          <p style="font-size: 14px; color: #555;">
            Stay connected and follow our journey on social media:
          </p>
          <p>
            <a href="https://www.instagram.com/lahara.work/" target="_blank" rel="noopener noreferrer" style="color: #6C59D5; margin-right: 10px;">Instagram</a> |
            <a href="https://www.tiktok.com/@lahara.work" target="_blank" rel="noopener noreferrer" style="color: #6C59D5; margin: 0 10px;">TikTok</a> |
            <a href="https://www.facebook.com/profile.php?id=61577030906411" target="_blank" rel="noopener noreferrer" style="color: #6C59D5; margin: 0 10px;">Facebook</a> |
            <a href="https://x.com/Lahara_work" target="_blank" rel="noopener noreferrer" style="color: #6C59D5; margin-left: 10px;">Twitter</a>
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;" />
          <p style="font-size: 12px; color: #999;">
            © ${new Date().getFullYear()} Lahara. All rights reserved.<br/>
            Lahara - Nepal’s premier freelancing and influencer platform.
          </p>
        </div>
      `,
      text: `
        Hello from Lahara!

        Thank you for joining Nepal's first freelancing and influencer marketplace — we’re thrilled to have you onboard!

        You’re now part of a growing community of talented freelancers, influencers, and innovative brands ready to take their reach to the next level.

        We’ll keep you updated with exclusive news, early access opportunities, and tips to maximize your experience once we launch.

        If you have any questions or want to get in touch, email us anytime at support@lahara.work.

        Follow our journey on Instagram, TikTok, Facebook, and Twitter.

        © ${new Date().getFullYear()} Lahara. All rights reserved.
      `,
    });
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
  }
}
