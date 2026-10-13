// Garde-fous de l'ingestion : un sujet officiel sans source ou sans droit d'usage ne démarre pas.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadContent } from "./content.js";

const SRC = path.join(import.meta.dirname, "..", "content");
function withEpreuve(extra) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "weldon-content-"));
  fs.cpSync(SRC, dir, { recursive: true });
  const eps = JSON.parse(fs.readFileSync(path.join(dir, "epreuves.json"), "utf8"));
  const model = { ...eps.find((e) => e.concours === "gardiens-paix" && e.lang === "fr"), id: "gp-2030-test-fr", exemple: undefined };
  delete model.exemple;
  eps.push({ ...model, ...extra });
  fs.writeFileSync(path.join(dir, "epreuves.json"), JSON.stringify(eps));
  return dir;
}
const complete = { source: "Concours d'élèves gardiens de la paix, session 2030, DGSN", source_doc: "docs/sources/recueils/gp.pdf, p. 3", rights: "recueil_achete" };

test("un sujet officiel complet est accepté, et ses références internes ne sont pas dans le catalogue", () => {
  const c = loadContent(withEpreuve(complete));
  const e = c.epreuve("gp-2030-test-fr");
  assert.equal(e.source, complete.source);
  const listed = c.catalog("fr").epreuves.find((x) => x.id === "gp-2030-test-fr");
  assert.equal(listed.exemple, false);
  assert.ok(!("source_doc" in listed) && !("rights" in listed));
});

test("un sujet officiel sans source, sans droit d'usage ou avec un droit inconnu est refusé", () => {
  assert.throws(() => loadContent(withEpreuve({ ...complete, source: undefined })), /source manquante/);
  assert.throws(() => loadContent(withEpreuve({ ...complete, source_doc: undefined })), /source_doc manquant/);
  assert.throws(() => loadContent(withEpreuve({ ...complete, rights: undefined })), /rights inconnu/);
  assert.throws(() => loadContent(withEpreuve({ ...complete, rights: "pirate" })), /rights inconnu/);
});

test("un corrigé officiel ne peut pas rester non vérifié ; les passages douteux sont une liste", () => {
  assert.throws(() => loadContent(withEpreuve({ ...complete, corrige_source: "officiel", verifie: "non_verifie" })), /officiel/);
  assert.doesNotThrow(() => loadContent(withEpreuve({ ...complete, corrige_source: "officiel", verifie: "officiel" })));
  assert.throws(() => loadContent(withEpreuve({ ...complete, a_verifier: "ligne 3" })), /a_verifier/);
  assert.doesNotThrow(() => loadContent(withEpreuve({ ...complete, a_verifier: ["Ligne 3 illisible"] })));
});

test("les sujets d'entraînement Weldon n'exigent pas de source", () => {
  assert.doesNotThrow(() => loadContent(SRC));
});
