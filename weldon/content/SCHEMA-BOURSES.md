# Schéma des bourses (`content/bourses.json`)

Une entrée par bourse. Les dates viennent des pages officielles ; tout est `to_verify` tant que le concepteur n'a pas validé.

```json
{
  "id": "daad-epos",
  "organisme": "DAAD, Allemagne",
  "pays_accueil": ["Allemagne"],
  "cameroun": "oui",                       // oui | non_precise (les « non » ne sont pas publiés)
  "niveaux": ["master"],                   // licence | master | doctorat | postdoc | autre
  "domaines": ["tous"],                    // « tous » ou des filières, voir ci-dessous
  "couverture_niveau": "complete",         // complete | partielle | variable
  "age_max": 36,
  "cycle": { "type": "annuelle", "ouverture_mois": "août–octobre", "cloture_mois": "octobre" },   // annuelle | irreguliere | unique
  "edition": { "libelle": "2027/28", "ouverture": "2026-08-01", "cloture": "2026-10-31", "confirme": true },
  "lien_officiel": "https://…",
  "sources": [ { "titre": "Page officielle", "url": "https://…" } ],
  "last_verified": "2026-10-19",
  "status": "to_verify",                   // to_verify | verified
  "fr": { "nom": "…", "resume": "…", "couverture_detail": "…", "diplome": "…", "langue": "…", "autres": ["…"], "dossier": ["…"], "conseil": "…", "edition_note": "…" },
  "en": { "…même structure…" }
}
```

## Filières (deux branches, comme le choix « Sciences ou Littérature », en anglais « Science ou Arts »)
- **Sciences** : `maths`, `informatique`, `physique-chimie`, `sante`, `ingenierie`, `agronomie-environnement`
- **Littérature** : `droit-politique`, `histoire-geographie`, `lettres-langues`, `philo-sociologie`, `communication`, `education`, `economie-gestion`

## Cycle de vie (calculé chaque jour, `server/bourses.js`)
| Statut | Quand |
|---|---|
| **Clôture proche** | clôture dans 14 jours ou moins |
| **Ouverte** | ouverte et clôture au-delà de 14 jours (ou ouverte sans date de clôture publiée) |
| **Bientôt ouverte** | ouverture datée dans le futur |
| **Relance attendue** | pas de dates d'édition, mais un cycle connu |
| **Expirée** | clôture passée : la fiche annonce la **relance probable** d'après le cycle (mois d'ouverture suivant) |
| **Dates non annoncées** | ni dates ni cycle |

Une date non confirmée reste marquée « dates à confirmer ». Le concepteur met à jour l'édition en cours depuis l'espace concepteur (« Bourses : dates de l'édition en cours ») : une bourse expirée repasse « Ouverte » dès qu'il y saisit les nouvelles dates.

## Ouverture au public
La section n'est visible que pour le concepteur tant que la variable `BOURSES_PUBLIC` n'est pas à `1`.

## Répertoire issu des guides du concepteur (`content/bourses-guide.json`)
Généré par `node tools/ingest/bourses-guide.mjs <dossier des .txt> content/bourses-guide.json` à partir des guides Word (extraits en texte). 314 bourses uniques après suppression des doublons ; celles déjà relevées à la main dans `bourses.json` ne sont pas reprises. Tout est `to_verify` : les dates des guides (éditions 2024-2026) passent « expirées » d'elles-mêmes et le concepteur saisit l'édition en cours dans son espace.

Champs en plus du schéma ci-dessus : `origine` (gouvernementale | universitaire | fondation), `vedette` (« À la une »), `apercu_gratuit` (fiche ouverte à tous), `edition.permanente` (candidatures ouvertes en continu), `fr.valeur`, `fr.eligibilite`, `fr.ne_couvre_pas`, `fr.cout_candidature`, `fr.resume_long`. Les textes anglais manquent : l'interface retombe sur le français.

## Accès : ce qui est gratuit, ce qui est verrouillé
Sans abonnement : nom, organisme, pays, niveau, valeur, type, éligibilité, dates et statut. Verrouillés **côté serveur** (jamais envoyés) : lien officiel, sources, documents à préparer, conseil, détail de couverture, texte long, coût de candidature. Une fiche peut être ouverte à tous (`apercu_gratuit`) depuis l'espace concepteur. `content/alertes-pays.json` : alerte affichée sur toutes les bourses d'un pays (visa étudiant britannique).

## Vérification et visibilité
`status: "verified"` = la page officielle de l'organisme a été lue le jour indiqué dans `verification.date` et ses points confirmés (`verification.points`). **Les élèves ne voient que les bourses vérifiées** ; le concepteur voit toutes les fiches, avec leur statut. Champs ajoutés : `langue_acces` (`fr` | `en` | absent = les deux sections), `editions` (une entrée par année de date limite connue : 2026, 2027, 2028…), `fr.etapes` / `en.etapes` (procédure), `verification`. Les bourses sont aussi traduites en anglais ; une bourse `langue_acces: "fr"` n'est montrée qu'à la section francophone.

## Deux achats distincts
Abonnement concours (15 000 FCFA/mois ou 100 000 FCFA/an) et **Pass Bourses** (250 000 FCFA, 365 jours, `PRICE_XAF_BOURSES`). Le Pass Bourses ouvre toutes les fiches (lien, pièces, étapes, conseils, articles « abonnés ») ; il n'ouvre pas les concours, et inversement.
