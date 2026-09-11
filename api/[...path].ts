import { app } from '../server';

export default function handler(req: any, res: any) {
  // Vercel may strip the catch-all function prefix before handing the request
  // to Express, while the application routes are mounted under /api.
  if (!req.url?.startsWith('/api')) {
    req.url = `/api${req.url?.startsWith('/') ? req.url : `/${req.url || ''}`}`;
  }

  return app(req, res);
}
