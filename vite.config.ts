import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function emailDispatcherPlugin(env: Record<string, string>) {
  return {
    name: 'email-dispatcher',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url === '/api/send-email' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const { to, subject, html, text } = data;
              // Reasons each configured provider refused, reported back if none delivers
              const failures: string[] = [];

              // 1. Direct Gmail SMTP via Nodemailer
              const gmailUser = env.GMAIL_USER || process.env.GMAIL_USER;
              const gmailPass = env.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD;

              if (gmailUser && gmailPass) try {
                const nodemailer = await import('nodemailer');
                const transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                    user: gmailUser.trim(),
                    pass: gmailPass.replace(/\s+/g, '') // remove spaces from 16-character Google App Password
                  }
                });

                const info = await transporter.sendMail({
                  from: `"VoyageAgent AI" <${gmailUser.trim()}>`,
                  to,
                  subject,
                  text: text || subject,
                  html
                });

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  provider: 'gmail_smtp',
                  messageId: info.messageId,
                  deliveredAt: new Date().toISOString()
                }));
                return;
              } catch (gmailErr: any) {
                console.error('[Email Dispatch] Gmail SMTP failed:', gmailErr?.message || gmailErr);
                failures.push(`Gmail SMTP (${gmailUser.trim()}): ${gmailErr?.message || gmailErr}`);
              }

              // 2. Resend REST API
              const resendKey = (env.RESEND_API_KEY || env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY || '').trim();
              if (resendKey && resendKey.length > 8) try {
                // If using default unverified domain, Resend requires onboarding@resend.dev
                const configuredFrom = env.VITE_EMAIL_FROM || env.EMAIL_FROM || '';
                const fromAddress = configuredFrom.includes('@resend.dev') 
                  ? configuredFrom 
                  : (configuredFrom && !configuredFrom.includes('voyageagent.ai') 
                      ? configuredFrom 
                      : 'VoyageAgent AI <onboarding@resend.dev>');

                const resendResponse = await fetch('https://api.resend.com/emails', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${resendKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    from: fromAddress,
                    to: [to],
                    subject,
                    html,
                    text: text || subject
                  })
                });

                const resendData = await resendResponse.json();
                if (!resendResponse.ok) {
                  throw new Error(resendData.message || 'Resend delivery failed');
                }

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  provider: 'resend',
                  messageId: resendData.id,
                  deliveredAt: new Date().toISOString()
                }));
                return;
              } catch (resendErr: any) {
                console.error('[Email Dispatch] Resend failed:', resendErr?.message || resendErr);
                failures.push(`Resend: ${resendErr?.message || resendErr}`);
              }

              // 3. Credentials are set but every provider refused them
              if (failures.length > 0) {
                res.statusCode = 502;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: failures.join(' | ') }));
                return;
              }

              // 4. Fallback: No live credentials set
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                requiresConfig: true,
                message: 'No live email credentials (GMAIL_USER + GMAIL_APP_PASSWORD or VITE_RESEND_API_KEY) found in .env.local'
              }));
            } catch (err: any) {
              console.error('[Email Dispatch Error]:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                error: err.message || 'Email delivery failed'
              }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        emailDispatcherPlugin(env)
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
