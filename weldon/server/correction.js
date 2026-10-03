// Correction d'une copie manuscrite photographiée, à la manière d'un bon répétiteur.
// L'IA reçoit le sujet, le corrigé de référence Weldon et les photos de la copie.

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";

const MODEL = "claude-opus-5-5";

const Correction = z.object({
  lisible: z.boolean().describe("false si les photos sont illisibles ou ne montrent pas une copie"),
  transcription_resume: z.string().describe("Résumé fidèle de ce que le candidat a écrit"),
  note_sur_20: z.number().describe("Note estimée sur 20, au demi-point près"),
  appreciation: z.string().describe("Appréciation générale en 2-3 phrases, ton d'un répétiteur bienveillant mais exigeant"),
  points_forts: z.array(z.string()),
  points_faibles: z.array(z.string()),
  erreurs_langue: z.array(z.string()).describe("Fautes d'orthographe, de grammaire ou de syntaxe relevées, avec la correction"),
  conseils: z.array(z.string()).describe("Conseils concrets pour progresser avant le concours"),
  gestion_du_temps: z.string(),
});

let client = null;

export function aiEnabled() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const SYSTEM = `Tu es correcteur de concours administratifs et des grandes écoles au Cameroun \
(ENAM, ENS, EMIA, Police, Gendarmerie, FMSB, etc.). Tu corriges la copie manuscrite d'un candidat \
qui s'entraîne sur l'application Weldon. Lis les photos de la copie, compare-la au corrigé de \
référence et au barème fournis, puis rends une évaluation honnête : ne surnote pas, un concours \
est sélectif. Explique chaque point faible de façon que le candidat sache quoi faire. \
Si les photos sont illisibles ou hors sujet, mets lisible à false et explique pourquoi dans l'appréciation. \
Réponds en français (en anglais si la copie est rédigée en anglais).`;

export async function correctCopy(input) {
  client ??= new Anthropic();

  const contexte = [
    `Concours : ${input.concours}`,
    `Épreuve : ${input.epreuve}`,
    input.duree_minutes ? `Durée officielle : ${input.duree_minutes} min` : "",
    input.temps_utilise_minutes ? `Temps utilisé par le candidat : ${input.temps_utilise_minutes} min` : "",
    `\n<sujet>\n${input.sujet}\n</sujet>`,
    input.bareme ? `\n<bareme>\n${input.bareme}\n</bareme>` : "",
    `\n<corrige_de_reference>\n${input.corrige}\n</corrige_de_reference>`,
    "\nLes photos ci-dessus sont les pages de la copie du candidat, dans l'ordre. Corrige-la.",
  ]
    .filter(Boolean)
    .join("\n");

  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium", format: betaZodOutputFormat(Correction) },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          ...input.images.map((im) => ({
            type: "image",
            source: { type: "base64", media_type: im.media_type, data: im.data },
          })),
          { type: "text", text: contexte },
        ],
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    const e = new Error("La correction automatique n'a pas pu être faite pour cette copie.");
    e.status = 422;
    throw e;
  }
  if (!response.parsed_output) {
    const e = new Error("La correction n'a pas pu être lue. Réessayez.");
    e.status = 502;
    throw e;
  }
  return response.parsed_output;
}
