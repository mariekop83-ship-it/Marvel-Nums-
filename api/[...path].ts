import { app } from '../server';

export default function handler(req: any, res: any) {
  // Vercel can pass either /api/auth/login or /auth/login to a catch-all
  // function. Normalize only the pathname so query strings are preserved.
  const originalUrl = String(req.url || req.originalUrl || '/');
  const queryIndex = originalUrl.indexOf('?');
  const pathname = queryIndex === -1 ? originalUrl : originalUrl.slice(0, queryIndex);
  const query = queryIndex === -1 ? '' : originalUrl.slice(queryIndex);
  const normalizedPath = pathname.startsWith('/api')
    ? pathname
    : `/api${pathname.startsWith('/') ? pathname : `/${pathname}`}`;

  req.url = `${normalizedPath}${query}`;
  req.originalUrl = req.url;
  return app(req, res);
}
