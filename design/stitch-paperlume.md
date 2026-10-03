# Paperlume — cahier pour Google Stitch

Ce fichier décrit toute l'application Paperlume pour la redessiner dans **Google Stitch** (stitch.withgoogle.com).

## Mode d'emploi

1. Dans Stitch, créez un projet **Mobile app**.
2. Collez le **prompt 0** (style général). Gardez le résultat qui vous plaît : c'est le « design system ».
3. Collez ensuite les prompts **1 à 16**, **un par un**, en commençant chaque fois par la phrase : *« Same app, same design system as the previous screens. »* Stitch fonctionne mieux écran par écran.
4. Pour corriger un écran, demandez **une seule modification à la fois** (« make the bottom bar lighter », « bigger shutter button »…).
5. Exportez (Figma ou HTML/CSS) et envoyez-moi les captures ou le code : je reporte le design dans l'application. Le fonctionnement reste le même, seul l'habillage change.

Les prompts sont en anglais, car Stitch les comprend mieux ainsi. Les textes **entre guillemets** sont les vrais libellés de l'application en français, et doivent rester tels quels. Pour la version anglaise, demandez ensuite : *« Same screen with English labels »*.

Si Stitch refuse un prompt trop long, coupez-le en deux, à un intertitre.

---

## Prompt 0 — Style général (design system)

```
Design a mobile app called "Paperlume" — tagline "Scannez. Comprenez. Écoutez." (Scan. Understand. Listen.). It turns a phone into a desktop scanner, a reader and an audio player: users photograph documents or whole books, get clean PDFs/Word files, search the text, get a summary, and listen to it read aloud. Everything runs offline on the phone; no account, no ads.

Users: students and job applicants in Cameroon and French-speaking Africa, French first with English; mid-range Android phones, often outdoors in bright light, sometimes low literacy or poor eyesight. Many prepare official application files (ID card, birth certificate, diplomas).

Brand idea: "paper that lights up" — warm paper + a soft beam of light. Calm, trustworthy, modern, not childish. Feels like a premium utility (think Adobe Scan or Google Files), but warmer.

Design system:
- Colors: ink navy #0F2A44 (headers, primary text), paper white #FBF8F1 (backgrounds), card white #FFFFFF, lume amber #F5B83D (highlights, the sentence being read, active states), action blue #1769AA (primary buttons), success green #2FA864, warning #E8A317, danger #B3261E, muted grey #5D6B78. Dark mode for camera and page editor: #0B0F13 with light text.
- Typography: Atkinson Hyperlegible or Inter for UI (large, very legible); Literata (serif) for reading text. Base size 16–17 px, never under 13 px.
- Shapes: 12–16 px rounded corners, soft shadows, generous spacing, touch targets at least 48 px.
- Icons: Material Symbols Rounded, always with a short text label under or beside them (no icon-only actions except close/back).
- Few buttons per screen: one clear primary action, the rest secondary. Bottom navigation for the main actions, bottom sheets for extra actions.
- Light mode and dark mode. Material 3 feel, Android first.
- Privacy cue: small lock or "Sur votre téléphone" badge where documents are listed.

Start with the home screen (screen 1 below) using this design system.
```

---

## Prompt 1 — Accueil (document en cours)

```
Screen "Accueil" (home), light mode.
Top app bar: logo + "Paperlume" on the left; on the right a language pill "EN", an info icon, "Mes docs" (library) and "+ Nouveau".
Under the bar, a segmented control with two tabs: "Document" (selected) and "Dossier".
A 3-step progress indicator: "1 Photographier", "2 Vérifier", "3 Envoyer" — steps 1 and 2 done (green check), step 3 current (blue). One-line hint below: "3 page(s) prête(s). Ajoutez une page ou appuyez sur Envoyer."
Text field labelled "Nom du document" with value "Cours de biologie".
A card with 4 tools in a row (icon + label): "Écouter", "Chercher", "Résumé", "Corriger"; small line under it: "Reprendre page 37/312 · texte : 312/312 pages".
A 2-column grid of page thumbnails (A4 portrait), each with its page number in a navy circle, small left/right arrows to reorder, and one page with a small warning badge (blurry).
Bottom action bar (fixed): primary large button "📷 Scanner" (or "+ Page" when pages exist), secondary "Importer" (photo or PDF), and a green "Envoyer" button.
```

## Prompt 2 — Accueil vide (premier lancement)

```
Same home screen, but empty (first launch). Instead of the grid, a friendly empty state with an illustration of a sheet of paper under a soft beam of light, title "Aucune page pour l'instant.", text "Posez le document à plat sur une surface plus foncée, dans un endroit bien éclairé, puis appuyez sur Scanner. Ou importez une photo ou un PDF, à convertir en Word ou à écouter." and small grey text "Gratuit, sans compte, sans publicité ; vos documents restent sur votre téléphone." Only step 1 "Photographier" is active. The "Scanner" button is large and highlighted; "Envoyer" is disabled.
```

## Prompt 3 — Caméra intégrée

```
Full-screen camera screen, dark. Live camera preview of a book page on a wooden table. A detected page outline is drawn over the page (rounded green border with a light translucent fill = ready; yellow while searching).
Top: close "✕" on the left, counter "12 pages · 1 en traitement" on the right, torch icon. Under it a short instruction: "✓ Ne bougez plus : photo automatique…".
Above the shutter, two rows:
1) Option chips: "⏱ Auto" (on, green), "↺ Reprendre", "📱 Photo classique".
2) A horizontal mode selector like the native camera: "Document", "Livre" (selected, amber pill), "Carte", "Reçu", "Tableau".
Bottom: last page thumbnail on the left (with a small warning badge if blurry), a big round white shutter button in the center with a circular progress ring (green, 70% filled = automatic photo countdown), and a blue pill "Terminé ✓" on the right.
```

## Prompt 4 — Recadrage

```
Crop screen, dark. Header: "← Retour", title "Recadrer", "Page 1/1".
The photo of a document on a table, with the detected document area outlined and 4 large round corner handles that can be dragged; a circular magnifier loupe near the finger showing the corner zoomed.
Bottom: hint "Faites glisser les 4 coins sur les bords du document." and three buttons: "✨ Auto", "⬜ Toute l'image", and primary "Valider ✓".
```

## Prompt 5 — Rendu d'une page (après le scan)

```
Page editor "Rendu", dark, uncluttered. Header: "← Retour", title "Rendu", "Page 3/12".
Optional amber warning banner at the top: "⚠️ Photo floue : le texte risque d'être illisible." with a button "📷 Reprendre".
Center: the scanned page (white, crisp, A4) as large as possible.
Bottom panel, three levels only:
1) Horizontally scrollable rendering chips: "Scanner de bureau" (selected), "Contrasté", "Gris", "Photocopie", "Couleur", "Original"; one line of description under: "Comme un scanner à plat : fond blanc, tons naturels, texte net, cachets en couleur".
2) A row of 5 icon buttons with labels: "Recadrer", "Tourner", "Signer", "Texte", "Plus".
3) Two large buttons: secondary "📷 Page suivante" and primary "Terminé ✓".
Also show the "Plus" bottom sheet open in a second variant: "Tourner à gauche", "Séparer 2 pages (livre ouvert)", "Écouter cette page", "Dupliquer la page", "Supprimer la page" (red), "Annuler".
```

## Prompt 6 — Signer, masquer

```
Annotation mode of the page editor, dark. The page with a blue handwritten signature placed on it, inside a dashed selection box with a resize handle. Hint: "Placez votre signature ou masquez une zone, puis validez." Buttons: "✍️ Signature", "⬛ Masquer une zone", a delete icon, and primary "Valider ✓".
Second variant: bottom sheet "Votre signature" with a large white drawing pad, color choice blue / black, "Effacer", "📷 Depuis une photo", primary "Placer sur la page", "Annuler".
```

## Prompt 7 — Enregistrer / envoyer

```
Bottom sheet or full dialog "Enregistrer / envoyer".
Fields: "Nom du fichier" (value "Attestation_de_scolarite"); "Format" dropdown open showing: "PDF (comme un scan)", "PDF avec texte cherchable", "Word (.docx) : texte modifiable", "PDF propre : texte remis au propre", "Texte seul (.txt)", "Markdown (.md)", "Page web (.html)", "Images JPG"; "Mise en page" (A4 / Carte d'identité recto + verso sur une page A4 / Lettre US / Taille du document); "Qualité" (Légère 150 ppp / Standard 200 ppp / Scanner 300 ppp); "Taille maximale du fichier" (300 Ko); checkbox "Noms acceptés par les sites (sans espaces ni accents)"; "Filigrane de protection (facultatif)".
Info line: "2 page(s) · 1 fichier · 274 Ko · 300 ppp · texte cherchable". Optional amber warning line.
Small link button "✏️ Corriger le texte avant d'envoyer".
Bottom: "⬇️ Télécharger" and primary "📤 Partager" (WhatsApp, e-mail, Drive), "Fermer".
Make it feel simple: group advanced options in a collapsible "Options" section.
```

## Prompt 8 — Écouter (mode lecture)

```
Reading / listening screen, light (also show a dark variant). Header: "← Retour", document name "Cours de biologie", "Page 37/312".
Thin status line: "✓ Texte prêt pour toutes les pages."
Main area: the page text in a large serif font (Literata 20 px, line height 1.6), comfortable margins; the sentence currently read aloud is highlighted with a soft amber background.
Bottom player panel: five round controls — previous page, previous paragraph, a large blue play/pause button, next paragraph, next page. Under it: "Page [37]" input, "Vitesse 1,25×" selector (0,75× to 3×), "A−" "A+" text size, image toggle (see the page photo), and "✏️" (correct the text).
Feel: like an audiobook / e-reader app, calm and focused.
```

## Prompt 9 — Chercher

```
Search screen. Header "← Retour", title "Rechercher".
Search field with the query "photosynthèse", and a segmented control "Ce document" / "Toute la bibliothèque".
Status line: "5 page(s) trouvée(s) · ✓ Texte prêt pour les 312 page(s)."  (variant: "Texte prêt pour 120 pages sur 312" with a button "📖 Lire le texte des 192 pages restantes").
Result cards: bold blue "Page 24 · 3 fois", then a 2–3 line excerpt with the found word highlighted in amber: "…la photosynthèse permet aux plantes de transformer la lumière…". Tapping a card opens the reader at that sentence. In library mode, each card starts with the document name.
```

## Prompt 10 — Résumé et fiche de révision

```
Summary screen. Header "← Retour", document name. Segmented control: "Express" / "Détaillé" / "Fiche" (selected).
Status line "✓ Texte prêt pour les 312 page(s)."
Section "MOTS-CLÉS": a wrap of tappable chips ("photosynthèse", "chlorophylle", "cellule", "énergie"…).
Section "QUESTIONS À TROUS (touchez pour voir la réponse)": numbered sentences where one key word is replaced by an underlined blank; one blank revealed in green; each item ends with a small page tag "p. 24".
Section "PHRASES CLÉS": numbered key sentences, each with "p. 12".
Small grey note: "Résumé automatique : les phrases les plus importantes du document, reprises telles quelles, avec leur page. Calculé sur le téléphone."
Bottom bar: "🔊 Écouter", "📋 Copier", primary "📤 Partager".
```

## Prompt 11 — Corriger le texte

```
Text correction screen. Header "← Retour", document name, "Page 2/7".
Toolbar: green button "⤵ À vérifier (12)", "✍️ Écrit à la main", "+ Paragraphe".
Hint: "Touchez un mot pour le corriger. 12 mot(s) surligné(s) à vérifier sur cette page."
Paragraphs shown as soft cards; doubtful words highlighted in yellow; a small pencil at the end of each paragraph.
Bottom: "‹ Page", primary "Terminé ✓", "Page ›".
Variant A (bottom sheet "Corriger le mot"): a zoomed crop of the photo with the word boxed in orange, a text field with the word, buttons "✓ Valider", primary "✓ Suivant ⤵", "✏️ Tout le paragraphe", delete.
Variant B (handwritten page detected): an amber info card "✍️ Cette page semble écrite à la main… Le texte qu'il a trouvé n'a pas de sens." with a primary button "✍️ Transcrire ligne par ligne", and a collapsed link "Voir quand même le texte lu (non fiable)".
```

## Prompt 12 — Transcrire une page manuscrite

```
Handwriting transcription screen. Header "← Retour", "Transcription", "Ligne 2/7".
Hint: "Recopiez ou dictez (🎤 du clavier) la ligne agrandie, puis « Ligne suivante »."
A large zoomed image of one handwritten line (blue ink on lined paper).
A big text area under it with the typed text "Je vous écris pour vous remercier".
Small buttons: "¶ Nouveau paragraphe" (toggle), "↺ Relire les lignes".
Bottom: "◀ Ligne", primary "Ligne suivante ▶", and a text link "Terminer maintenant ✓". Keyboard with microphone key visible.
```

## Prompt 13 — Dossier de candidature : ajouter une pièce

```
Home screen, tab "Dossier" selected. Field "Nom du dossier" = "Dossier de concours ENS 2026".
Segmented control: "➕ Ajouter une pièce" (selected) / "📁 Mon dossier" with a green count badge "3".
Search field "Chercher une pièce (CNI, diplôme, casier…)" with the query "certificat de réussite".
Catalog grouped by category headers ("Identité et état civil", "Études et diplômes", "Emploi", "Santé et casier"…). Each item is a row card: bold name "Carte nationale d'identité (CNI)", grey rule under it "Recto puis verso" or "⏳ À dater de moins de 3 mois"; items already in the file show "✓ Déjà dans le dossier".
At the end, a dashed card "+ Ajouter « Certificat de réussite » comme pièce".
Bottom bar: "➕ Pièce", "🔎 Vérifier", green "📤 Envoyer".
Variant: bottom sheet for one piece — title "Diplôme", rule "Copie certifiée conforme du diplôme exigé.", editable field "Nom de la pièce (modifiable)" = "Certificat de réussite", buttons primary "📷 Scanner" and "📥 Photo ou PDF", "Annuler".
```

## Prompt 14 — Mon dossier, vérifier, envoyer le dossier

```
Tab "Dossier", segment "📁 Mon dossier". A numbered list of documents, each a card with a page thumbnail: "01 · Carte nationale d'identité (CNI)", file name in monospace "01_CNI.pdf", meta "2 page(s)", and small actions "✏️ Modifier", "+ Page", "🔄 Recommencer", up/down arrows, delete. Second item "02 · Acte de naissance — ⏳ À dater de moins de 3 mois".
Variant A — sheet "Vérification du dossier": field "Nom du titulaire", button "🔎 Lancer la vérification", results per document with icons: green "✓ Nom retrouvé", amber "⚠️ La date la plus récente lue est le 12 mars 2025 : la pièce semble avoir plus de 3 mois.", grey "❔ Date non trouvée". Note: "Indicatif : vérifiez toujours vous-même."
Variant B — sheet "Envoyer le dossier": name with suggestions, format "Un PDF par pièce / Images JPG / Un seul PDF", "Taille maximale par fichier: 300 Ko", "Photo d'identité: 4 × 4 cm", list of files with sizes and ✓ / "⚠️ trop lourd", buttons "📦 Tout en .zip" and primary "📤 Partager les fichiers".
```

## Prompt 15 — Ma bibliothèque

```
Library screen (full screen or large sheet) "Ma bibliothèque".
Search field "Chercher un document…", under it a link button "🔎 Chercher « photo » dans le texte de tous les documents" (shown while typing).
Horizontal category chips: "Tous (12)" selected, "📚 Études (5)", "💼 Travail (2)", "🏛 Administration (3)", "💰 Finance (1)", "📖 Personnel (1)".
A prominent card "▶ Continuer la lecture — Cours de biologie — Page 184/312".
Document list: each row has a thumbnail, bold name with 📄 (document) or 📂 (dossier), meta "312 page(s) · 🎧 p. 184 · 3 oct. 2026", a small category dropdown, and a delete icon. The open document is outlined in blue.
Footer: grey note "Tout est enregistré sur ce téléphone seulement…", buttons "💾 Sauvegarde complète" and "📥 Restaurer".
```

## Prompt 16 — Réglages, verrouillage, petits écrans

```
Three small screens with the same design system:
A) Settings / "À propos": logo, "Paperlume", tagline "Votre papier s'éclaire : scannez, comprenez, écoutez.", privacy text "Aucune photo, aucun texte n'est envoyé sur internet.", tips, "Langue" (Français / English), "Rendu par défaut des nouvelles pages", row "🔒 Code de verrouillage" with button "Choisir un code", link "Politique de confidentialité", version "2.0.0".
B) Lock screen: navy background, logo, "Entrez votre code", large PIN field with dots, numeric keypad, button "Déverrouiller", small message "Code incorrect." in amber.
C) PDF imported dialog: title "Cours de droit", text "312 page(s) importée(s). Le texte est déjà dans le PDF : lecture à voix haute et Word sont immédiats.", buttons primary "🎧 Lire et écouter", "📝 Convertir en Word", text button "✓ Garder dans mes documents". Also a progress overlay: "PDF : page 37 sur 312…" with a progress bar and "⏹ Arrêter l'import".
```

---

## Annexe — Ce que fait l'application (pour garder le design fidèle)

| Écran | Rôle | Éléments indispensables |
|---|---|---|
| Accueil — Document | Document en cours | Étapes Photographier / Vérifier / Envoyer, nom, outils Écouter · Chercher · Résumé · Corriger, pages, barre Scanner / Importer / Envoyer |
| Accueil — Dossier | Dossier de candidature | Catalogue de 65 pièces en 8 catégories, recherche, Mon dossier numéroté, Vérifier, Envoyer en .zip |
| Caméra | Scanner vite | Cadre en direct, prise auto, modes Document / Livre / Carte / Reçu / Tableau, compteur, reprendre |
| Recadrage | Ajuster les bords | 4 coins, loupe, Auto, Toute l'image, Valider |
| Rendu | Choisir l'aspect | 6 rendus, 5 icônes (Recadrer, Tourner, Signer, Texte, Plus), Page suivante, Terminé |
| Signer / masquer | Annoter | Signature au doigt ou depuis une photo, zone masquée |
| Envoyer | Exporter | 8 formats, mise en page, qualité, taille maximale, filigrane, partager |
| Écouter | Lecture à voix haute | Phrase surlignée, lecture/pause, paragraphe, page, vitesse jusqu'à 3×, reprise |
| Chercher | Recherche dans le texte | Document ou bibliothèque, passages surlignés, ouvre la lecture |
| Résumé | Comprendre vite | Express, Détaillé, Fiche (mots-clés, questions à trous), pages citées |
| Corriger | Texte exact | Mots douteux, correction avec la photo, paragraphes, écriture à la main détectée |
| Transcrire | Manuscrit | Une ligne agrandie à la fois, dictée, paragraphes |
| Bibliothèque | Retrouver | Catégories, Continuer la lecture, recherche, sauvegarde |
| Réglages | Préférences | Langue, rendu par défaut, code de verrouillage, confidentialité |

**À garder quel que soit le design :**
- l'application est en français **et** en anglais ;
- un seul bouton principal par écran ;
- les étiquettes texte sous les icônes ;
- des boutons d'au moins 48 px ;
- un fort contraste (usage en plein soleil) ;
- la caméra et le rendu d'une page en sombre ;
- la promesse « vos documents restent sur votre téléphone » visible.
