# Ajouter un recueil d'épreuves (ingestion)

Règle de contenu et de coût : les recueils s'achètent un par un. **On avance un concours à la fois**, et le concepteur ne fournit un recueil que quand il le décide. L'information (catalogue, orientation, calendrier) passe avant les épreuves.

## Ordre proposé (`tools/ingest/ordre.json`)
1. **Sessions annuelles à fort volume** : inspecteur de police (premier pilote), ENS niveau bac, ENAM, ENIEG et ENIET, EMIA.
2. **Fort volume mais cycle de plusieurs années** (armées, gendarmerie) : seulement à l'approche de la prochaine session probable (voir la fiche, « Périodicité »), ou si la demande est prouvée.
3. **Les autres** : santé, douanes, impôts, écoles techniques et d'agriculture.

Cet ordre peut changer selon la demande constatée.

## Déroulé pour un recueil
1. Le concepteur dépose le PDF (ou les photos) dans `docs/sources/recueils/<concours>.pdf` et dit lequel traiter.
2. Lecture et extraction : **texte transcrit des questions officielles**, jamais une image du document. Classement par concours, épreuve, année et langue.
3. **Pas de reprise des corrigés, commentaires, présentations ni mises en page des auteurs du recueil** : acheter un livre ne donne pas le droit de reproduire le travail de son auteur. Les corrigés sont **rédigés par Weldon** (voir `content/GUIDE-CORRIGES.md`). Un corrigé n'est marqué `officiel` que si le concepteur le demande pour ce corrigé précis.
4. Chaque épreuve officielle porte :
   - `source` : texte affiché aux élèves (« Concours d'élèves inspecteurs de police, session 2025, DGSN ») ;
   - `source_doc` : fichier du recueil ou lien, **interne**, jamais envoyé aux élèves ;
   - `rights` : `recueil_achete`, `officiel_public` ou `autorisation`, **interne** ;
   - `a_verifier` : liste des passages illisibles ou douteux (scan, photo). Ils sont affichés aux élèves et signalés au concepteur : **rien n'est deviné**.
   Le serveur refuse de démarrer si une épreuve officielle n'a pas sa source, son droit d'usage, ou si son corrigé officiel est « non_verifie ».
5. `node tools/ingest/report.mjs [concours]` : nombre d'épreuves, sessions, passages à vérifier, corrigés non vérifiés.
6. Le concepteur contrôle un échantillon, puis on publie.
7. L'interrupteur « Retirer » de l'espace concepteur retire une épreuve tout de suite en cas de problème de droits ou d'erreur grave.

## Exemple d'entrée
```json
{
  "id": "pol-2025-redaction-fr",
  "concours": "police-inspecteurs",
  "lang": "fr",
  "annee": 2025,
  "matiere": "Rédaction",
  "duree": 150,
  "source": "Concours d'élèves inspecteurs de police, session 2025, DGSN",
  "source_doc": "docs/sources/recueils/police-inspecteurs.pdf, p. 12",
  "rights": "recueil_achete",
  "a_verifier": ["Ligne 3 du sujet illisible sur le scan"],
  "sujet": "…texte transcrit…",
  "grille": ["dissertation"],
  "corrige": "…corrigé rédigé par Weldon…",
  "corrige_source": "propose",
  "verifie": "non_verifie"
}
```
Un sujet officiel n'a pas de champ `exemple`.
