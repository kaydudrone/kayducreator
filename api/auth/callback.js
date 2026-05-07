// Instagram OAuth Callback
// Exchanges the code for a long-lived access token and stores it

export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error) {
    return res.redirect('/?auth=error');
  }

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    // Step 1: Exchange code for short-lived token
    const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.IG_APP_ID,
        client_secret: process.env.IG_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: 'https://kayducreator.com/auth/callback',
        code,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error('Token exchange error:', tokenData);
      return res.redirect('/?auth=error');
    }

    const shortToken = tokenData.access_token;

    // Step 2: Exchange for long-lived token (60 days)
    const longRes = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.IG_APP_SECRET}&access_token=${shortToken}`
    );

    const longData = await longRes.json();

    if (longData.error) {
      console.error('Long token exchange error:', longData);
      return res.redirect('/?auth=error');
    }

    // Token obtained — store it in the response as a cookie (or show to user to save in Vercel env)
    // For personal dashboard: show token so you can save it to Vercel env vars
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Kay Du Dashboard — Auth Success</title>
      <style>
        body { font-family: sans-serif; background: #0a0a0f; color: #e8e8f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        .box { background: #1a1a2e; border: 1px solid #ffffff15; border-radius: 16px; padding: 32px; max-width: 600px; width: 90%; }
        h2 { color: #68d391; margin-bottom: 8px; }
        p { color: #8892a4; font-size: 14px; line-height: 1.6; }
        .token { background: #0a0a0f; border: 1px solid #ffffff20; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 12px; word-break: break-all; color: #818cf8; margin: 16px 0; }
        .steps { background: #f6ad5510; border: 1px solid #f6ad5530; border-radius: 8px; padding: 16px; margin-top: 16px; }
        .steps ol { margin: 8px 0 0 16px; color: #f6ad55; font-size: 13px; line-height: 1.8; }
      </style>
      </head>
      <body>
        <div class="box">
          <h2>✅ Instagram Connected!</h2>
          <p>Your long-lived access token (valid 60 days):</p>
          <div class="token">${longData.access_token}</div>
          <div class="steps">
            <strong style="color:#f6ad55">⚡ Save this token now:</strong>
            <ol>
              <li>Go to <strong>vercel.com</strong> → your project → Settings → Environment Variables</li>
              <li>Add variable: <code>IG_ACCESS_TOKEN</code></li>
              <li>Paste the token above as the value</li>
              <li>Redeploy your project</li>
            </ol>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('Auth callback error:', err);
    res.redirect('/?auth=error');
  }
}
