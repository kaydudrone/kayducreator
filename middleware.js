export const config = {
  // '/dashboard' must be listed alongside '/dashboard.html': Vercel 308-redirects the
  // .html form to the clean URL, and a matcher covering only '/dashboard.html' never
  // runs on the destination — which left the dashboard publicly readable.
  matcher: ['/admin/:path*', '/dashboard', '/dashboard.html'],
};

export default function middleware(req) {
  try {
    const url = new URL(req.url);

    // Parse cookies from header manually (req.cookies not available in plain Vercel Edge)
    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = {};
    cookieHeader.split(';').forEach(c => {
      const idx = c.indexOf('=');
      if (idx > -1) {
        const key = c.slice(0, idx).trim();
        const val = c.slice(idx + 1).trim();
        cookies[key] = val;
      }
    });

    const authCookie = cookies['kd_admin_auth'];
    const secret     = process.env.ADMIN_SECRET;

    // Skip login page itself — always allow
    if (url.pathname === '/admin/login') {
      return; // pass through
    }

    // Valid session → allow through
    if (authCookie && secret && authCookie === secret) {
      return; // pass through
    }

    // Not authenticated → redirect to login
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set('from', url.pathname);
    return Response.redirect(loginUrl, 302);

  } catch (err) {
    // Safety net — never crash the middleware, just pass through
    console.error('middleware error:', err);
    return;
  }
}
