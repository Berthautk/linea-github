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
