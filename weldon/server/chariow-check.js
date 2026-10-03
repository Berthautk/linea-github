// Vérifie la connexion à Chariow et affiche les produits publiés avec leur identifiant.
// Usage : npm run check-chariow   (lit CHARIOW_API_KEY dans .env)
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "./env.js";

loadEnv(path.join(path.dirname(fileURLToPath(import.meta.url)), ".env"));
const key = process.env.CHARIOW_API_KEY || "";
if (!key.startsWith("sk_")) {
  console.error("✗ CHARIOW_API_KEY absente ou invalide dans server/.env (elle commence par sk_live_).");
  process.exit(1);
}

async function get(route) {
  const res = await fetch(`https://api.chariow.com/v1${route}`, { headers: { Authorization: `Bearer ${key}` } });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${json.message || res.statusText}`);
  return json.data;
}

try {
  const store = await get("/store");
  console.log(`✓ Connexion réussie à la boutique « ${store.name} » (${store.url})`);
} catch (e) {
  console.error(`✗ Connexion refusée par Chariow : ${e.message}`);
  console.error("  Vérifiez la clé : Chariow → Settings → API Keys.");
  process.exit(1);
}

const data = await get("/products?per_page=100");
const products = Array.isArray(data) ? data : data?.data || [];
if (!products.length) {
  console.log("! Aucun produit publié. Créez et publiez le produit « Weldon – Accès 1 an » dans Chariow.");
  process.exit(0);
}
console.log("\nProduits publiés :");
for (const p of products) {
  const price = p.pricing?.current_price?.formatted || p.pricing?.price?.formatted || "";
  console.log(`  ${p.id}  ${p.name}  ${price}  (${p.type})`);
}
const wanted = process.env.CHARIOW_PRODUCT_ID;
if (!wanted) console.log("\n→ Copiez l'identifiant prd_… du produit Weldon dans CHARIOW_PRODUCT_ID (server/.env).");
else if (products.some((p) => p.id === wanted || p.slug === wanted)) console.log(`\n✓ CHARIOW_PRODUCT_ID (${wanted}) correspond à un produit publié.`);
else console.log(`\n✗ CHARIOW_PRODUCT_ID (${wanted}) ne correspond à aucun produit publié.`);
