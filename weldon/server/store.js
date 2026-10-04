// Stockage clé → valeur des comptes, quotas et Pulses déjà traités.
// Avec DATABASE_URL (PostgreSQL, ex. Neon gratuit) les données survivent aux redémarrages.
// Sans, un fichier JSON local sert au développement.

import fs from "node:fs";
import path from "node:path";

function fileBackend(dir) {
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "store.json");
  let db = {};
  if (fs.existsSync(file)) {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    // Ancien format { devices, deliveries, quotas } : on repart à zéro.
    db = raw.kv || {};
  }
  const save = () => {
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify({ kv: db }));
    fs.renameSync(tmp, file);
  };
  return {
    kind: "file",
    async get(k) {
      return db[k] ?? null;
    },
    async set(k, v) {
      db[k] = v;
      save();
    },
    // Insère seulement si la clé n'existe pas ; renvoie true si inséré.
    async insert(k, v) {
      if (k in db) return false;
      db[k] = v;
      save();
      return true;
    },
    async incr(k) {
      db[k] = (db[k] || 0) + 1;
      save();
      return db[k];
    },
    async list(prefix) {
      return Object.entries(db)
        .filter(([k]) => k.startsWith(prefix))
        .map(([, v]) => v);
    },
  };
}

async function pgBackend(url) {
  const { default: pg } = await import("pg");
  const pool = new pg.Pool({ connectionString: url, ssl: url.includes("localhost") ? false : { rejectUnauthorized: false }, max: 5 });
  await pool.query("CREATE TABLE IF NOT EXISTS weldon_kv (k text PRIMARY KEY, v jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())");
  return {
    kind: "postgres",
    async get(k) {
      const r = await pool.query("SELECT v FROM weldon_kv WHERE k = $1", [k]);
      return r.rows[0]?.v ?? null;
    },
    async set(k, v) {
      await pool.query(
        "INSERT INTO weldon_kv (k, v) VALUES ($1, $2) ON CONFLICT (k) DO UPDATE SET v = EXCLUDED.v, updated_at = now()",
        [k, JSON.stringify(v)]
      );
    },
    async insert(k, v) {
      const r = await pool.query("INSERT INTO weldon_kv (k, v) VALUES ($1, $2) ON CONFLICT (k) DO NOTHING", [k, JSON.stringify(v)]);
      return r.rowCount === 1;
    },
    async incr(k) {
      const r = await pool.query(
        "INSERT INTO weldon_kv (k, v) VALUES ($1, '1'::jsonb) ON CONFLICT (k) DO UPDATE SET v = to_jsonb((weldon_kv.v)::text::int + 1), updated_at = now() RETURNING v",
        [k]
      );
      return Number(r.rows[0].v);
    },
    async list(prefix) {
      const r = await pool.query("SELECT v FROM weldon_kv WHERE k LIKE $1 ORDER BY k", [prefix.replace(/[%_]/g, "\\$&") + "%"]);
      return r.rows.map((x) => x.v);
    },
  };
}

export async function createStore({ databaseUrl, dir }) {
  const kv = databaseUrl ? await pgBackend(databaseUrl) : fileBackend(dir);

  return {
    kind: kv.kind,
    getUser: (email) => kv.get(`user:${email}`),
    saveUser: (user) => kv.set(`user:${user.email}`, user),
    createUser: (user) => kv.insert(`user:${user.email}`, user),
    listUsers: () => kv.list("user:"),

    // true si cette livraison de Pulse a déjà été traitée
    async seenDelivery(id) {
      return !(await kv.insert(`delivery:${id}`, Date.now()));
    },

    async logEvent(entry) {
      await kv.set(`pulse:${entry.at}:${entry.delivery_id || Math.random().toString(36).slice(2)}`, entry);
    },

    // Corrections IA par compte et par mois (maîtrise des coûts).
    async takeCorrectionQuota(email, perMonth) {
      const key = `quota:${email}:${new Date().toISOString().slice(0, 7)}`;
      const used = await kv.incr(key);
      return used <= perMonth;
    },
  };
}
