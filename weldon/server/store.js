// Petit stockage fichier JSON pour le prototype (appareils, quotas, journal des Pulses).
// En production, remplacer par une vraie base (PostgreSQL, Supabase, Firestore…).
import fs from "node:fs";
import path from "node:path";

export function createStore(dir) {
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "store.json");
  const logFile = path.join(dir, "pulses.jsonl");
  let db = { devices: {}, deliveries: {}, quotas: {} };
  if (fs.existsSync(file)) db = { ...db, ...JSON.parse(fs.readFileSync(file, "utf8")) };

  const save = () => {
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(db));
    fs.renameSync(tmp, file);
  };

  return {
    // Enregistre l'appareil pour cet achat ; renvoie null si la limite est atteinte.
    addDevice(saleId, deviceId, max) {
      const list = db.devices[saleId] || [];
      if (!list.includes(deviceId)) {
        if (list.length >= max) return null;
        list.push(deviceId);
        db.devices[saleId] = list;
        save();
      }
      return list;
    },

    seenDelivery(id) {
      if (db.deliveries[id]) return true;
      db.deliveries[id] = Date.now();
      save();
      return false;
    },

    logEvent(entry) {
      fs.appendFileSync(logFile, JSON.stringify(entry) + "\n");
    },

    // Limite le nombre de corrections IA par achat et par mois (maîtrise des coûts).
    takeCorrectionQuota(saleId, perMonth) {
      const month = new Date().toISOString().slice(0, 7);
      const key = `${saleId}:${month}`;
      const used = db.quotas[key] || 0;
      if (used >= perMonth) return false;
      db.quotas[key] = used + 1;
      save();
      return true;
    },
  };
}
