import { handle } from './lib/handler.mjs';

export default async (req) => handle(req);

export const config = { path: '/api/*' };
