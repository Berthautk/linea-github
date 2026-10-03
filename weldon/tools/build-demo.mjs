// Construit une page de démonstration autonome (un seul fichier HTML) à partir de web/.
// Usage : node tools/build-demo.mjs  →  dist/weldon-demo.html
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => fs.readFileSync(path.join(root, "web", f), "utf8");
const fonts = read("index.html").match(/<link rel="stylesheet" href="(https:\/\/fonts[^"]+)">/)[1];

const html = `<title>Weldon</title>
<meta name="description" content="Prototype Weldon : préparation aux concours camerounais.">
<link rel="stylesheet" href="${fonts}">
<style>
${read("styles.css")}
</style>
<div id="root"></div>
<script>
${read("data.js")}
</script>
<script>
${read("app.js")}
</script>
`;
fs.mkdirSync(path.join(root, "dist"), { recursive: true });
fs.writeFileSync(path.join(root, "dist", "weldon-demo.html"), html);
console.log("dist/weldon-demo.html", (html.length / 1024).toFixed(0) + " Ko");
