// Fonction Netlify : reçoit tous les appels /api/* (voir netlify.toml) et les confie à app.js.
import { handle } from "../app.js";

export default async (request, context) => {
  const url = new URL(request.url);
  // Selon le routage Netlify, le chemin peut arriver sous sa forme interne.
  url.pathname = url.pathname.replace(/^\/\.netlify\/functions\/api/, "/api");
  const raw = Buffer.from(await request.arrayBuffer());
  const r = await handle({
    method: request.method,
    url,
    headers: Object.fromEntries(request.headers),
    ip: context?.ip || request.headers.get("x-nf-client-connection-ip") || "",
    raw,
  });
  return new Response(JSON.stringify(r.body), {
    status: r.status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
};
