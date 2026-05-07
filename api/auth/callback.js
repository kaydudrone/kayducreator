// Instagram OAuth Callback (via Facebook Graph API)
export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error) {
    return res.redirect('/?auth=error');
  }

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    // Step 1: Exchange code for Facebook user access token
    const tokenRes = await fetch(
      `https://graph.facebook.com/oauth/access_token?client_id=${process.env.IG_APP_ID}&redirect_uri=https://kayducreator.com/auth/callback&client_secret=${process.env.IG_APP_SECRET}&code=${code}`
    );
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error('Token exchange error:', tokenData);
      return res.redirect('/?auth=error');
    }

    const fbToken = tokenData.access_token;

    // Step 2: Get Facebook Pages linked to this account
    const pagesRes = await fetch(
      `https://graph.facebook.com/me/accounts?access_token=${fbToken}`
    );
    const pagesData = await pagesRes.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      return res.status(400).send('No Facebook Pages found. Make sure your Instagram is linked to a Facebook Page.');
    }

    // Step 3: Get Instagram Business Account from the first Page
    const pageToken = pagesData.data[0].access_token;
    const pageId = pagesData.data[0].id;

    const igRes = await fetch(
      `https://graph.facebook.com/${pageId}?fields=instagram_business_account&access_token=${pageToken}`
    );
    const igData = await igRes.json();

    const igAccountId = igData.instagram_business_account?.id;

    if (!igAccountId) {
      return res.status(400).send('No Instagram Business Account found linked to your Facebook Page.');
    }

    // Step 4: Get long-lived page token (60 days)
    const longRes = await fetch(
      `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.IG_APP_ID}&client_secret=${process.env.IG_APP_SECRET}&fb_exchange_token=${fbToken}`
    );
    const longData = await longRes.json();
    const longToken = longData.access_token || fbToken;

    // Show token + IG Account ID for saving to Vercel env vars
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Kay Du Dashboard — Auth Success</title>
      <style>
        body { font-family: sans-serif; background: #0a0a0f; color: #e8e8f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        .box { background: #1a1a2e; border: 1px solid #ffffff15; border-radius: 16px; padding: 32px; max-width: 640px; width: 90%; }
        h2 { color: #68d391; margin-bottom: 8px; }
        p { color: #8892a4; font-size: 14px; line-height: 1.6; }
        .token { background: #0a0a0f; border: 1px solid #ffffff20; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 11px; word-break: break-all; color: #818cf8; margin: 8px 0 16px; }
        .label { font-size: 12px; color: #8892a4; margin-top: 12px; }
        .steps { background: #f6ad5510; border: 1px solid #f6ad5530; border-radius: 8px; padding: 16px; margin-top: 20px; }
        .steps ol { margin: 8px 0 0 16px; color: #f6ad55; font-size: 13px; line-height: 2; }
        code { background: #ffffff10; padding: 2px 6px; border-radius: 4px; }
      </style>
      </head>
      <body>
        <div class="box">
          <h2>✅ Instagram Connected!</h2>
          <div class="label">Long-lived Access Token (60 days):</div>
          <div class="token">${longToken}</div>
          <div class="label">Instagram Account ID:</div>
          <div class="token">${igAccountId}</div>
          <div class="steps">
            <strong style="color:#f6ad55">⚡ Save these to Vercel now:</strong>
            <ol>
              <li>Go to <strong>vercel.com</strong> → your project → Settings → Environment Variables</li>
              <li>Add <code>IG_ACCESS_TOKEN</code> → paste the token above</li>
              <li>Add <code>IG_ACCOUNT_ID</code> → paste the Account ID above</li>
              <li>Redeploy your project</li>
            </ol>
          </div>
        </div>
      </body>
      </html>
    `);

  } catch (err) {
    console.error('Auth callback error:', err);
    res.status(500).send('Auth error: ' + err.message);
  }
}
