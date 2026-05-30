export const config = {
  matcher: ['/admin/:path*', '/dashboard.html'],
};

export default function middleware(req) {
  const cookie = req.cookies.get('kd_admin_auth');
  const secret = process.env.ADMIN_SECRET;

  // Valid session cookie → allow through
  if (cookie && secret && cookie.value === secret) {
    return; // pass through
  }

  // Not authenticated → redirect to login page
  const loginUrl = new URL('/admin/login', req.url);
  loginUrl.searchParams.set('from', new URL(req.url).pathname);
  return Response.redirect(loginUrl, 302);
}
