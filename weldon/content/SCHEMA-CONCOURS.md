# Schéma des conditions d'accès d'un concours

Les conditions servent à deux choses : la section **« Conditions d'accès »** des fiches, et l'orientation **« Quel concours pour moi ? »** (`server/orientation.js`). Elles engagent le candidat : **rien n'est deviné**. Une valeur absente reste « à vérifier ».

## Champs de `content/concours.json`

```json
{
  "id": "gardiens-paix",
  "acces": {
    "niveaux_min": "bepc",          // cep | bepc | probatoire | bac | bac+2 | licence | master | doctorat | absent = non précisé
    "niveaux_max": null,
    "series": ["C", "D"],            // absent = série non précisée ; à utiliser seulement si les séries sont restreintes
    "age_min": 17, "age_max": 27,    // absents = limite non trouvée (le candidat verra « à vérifier »)
    "age_aucune": true,              // seulement si un texte affirme qu'il n'y a AUCUNE limite d'âge
    "nationalite": "camerounaise",
    "annee_conditions": 2026,        // année de l'arrêté ou du communiqué source
    "confiance": "secondaire"        // arrete | site_officiel | secondaire | non_trouve
  },
  "calendrier": { "mois_lancement": "juin–juillet", "mois_limite_depot": "…", "mois_epreuves": "…", "marque": "probable", "frais_fcfa": 16000 },
  "lien_inscription": "https://…",
  "sources": [ { "titre": "…", "url": "…", "type": "arrete | officiel | secondaire", "annee": 2026 } ],
  "last_verified": "2026-10-12",
  "status": "to_verify",             // to_verify | verified (après votre validation)
  "fr": { "acces_txt": { "diplomes": "…", "series_note": "…", "age_note": "…", "autres": ["…"] },
          "cal_txt": { "frais_note": "…", "pieces": ["…"] }, "debouches": "…", "variantes": [ { "nom": "…", "difference": "…" } ] },
  "en": { "…même structure…" }
}
```

Le serveur refuse de démarrer si un code est inconnu (`checkAcces` dans `server/content.js`).

## Règles de l'orientation

| Résultat | Quand |
|---|---|
| **Bien adapté** | Niveau, série et âge répondent aux conditions, et rien n'est à vérifier. |
| **Adapté** | Conditions remplies, mais niveau très supérieur à celui demandé, ou centres d'intérêt différents. |
| **Possible** | Un point reste à confirmer : âge limite selon la date de naissance, limite d'âge absente des données, niveau non précisé, série d'un autre système (A, C, D… et Arts, Science…), élève en Terminale pour un concours qui exige le bac. |
| **Improbable** | Une condition n'est pas remplie **selon une source non officielle** : on ne l'exclut pas, on le dit. |
| **Non** | Une condition n'est pas remplie **selon une source solide** (`arrete` ou `site_officiel`). |
| **Inconnu** | Conditions pas encore renseignées. |

L'âge se calcule avec la seule année de naissance : l'âge réel est l'un de deux entiers consécutifs. Dès septembre, on raisonne sur l'année suivante.

## Valider une fiche

1. Lire l'arrêté de la session (jamais un site relais seul).
2. Corriger les champs, mettre `confiance` à `arrete` ou `site_officiel`, `annee_conditions`, `sources`.
3. Passer `status` à `verified`.
