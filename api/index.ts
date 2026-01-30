import type { VercelRequest, VercelResponse } from '@vercel/node';

// @ts-expect-error - Build output is created at build time, not available during typecheck
import * as build from '../build/server/index.js';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { default: handler } = build;

    // Create a Web Request from Vercel request
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const webRequest = new Request(url, {
      method: req.method,
      headers: req.headers as HeadersInit,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    // Get response from React Router handler
    const webResponse = await handler(webRequest);

    // Convert Web Response to Vercel response
    const statusCode = webResponse.status;
    const headers = Object.fromEntries(webResponse.headers);

    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    res.status(statusCode);
    const body = await webResponse.text();
    res.send(body);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
