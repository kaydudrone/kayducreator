export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password } = req.body;

  if (!password || password !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Wrong password' });
  }

  // Set secure HttpOnly cookie — expires in 12 hours
  res.setHeader('Set-Cookie',
    `kd_admin_auth=${process.env.ADMIN_SECRET}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`
  );

  return res.status(200).json({ success: true });
}
