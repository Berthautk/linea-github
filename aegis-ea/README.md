# AEGIS : EA MetaTrader 5 pour EURUSD

Scalper de **pullback en tendance** : peu de trades, entrées avec confluence,
stop dur immédiat, sortie rapide si l'idée est invalidée, coupe-circuits de risque.
Pas de martingale, pas de grid, pas de moyenne à la baisse.

> Ce code n'a pas été compilé ni backtesté dans l'environnement où il a été écrit
> (pas de MetaEditor). Compilez-le, corrigez d'éventuelles erreurs, puis suivez
> la procédure de validation ci-dessous avant tout argent réel.
> Aucun robot ne garantit de gains.

## Installation
1. MT5 > Fichier > Ouvrir le dossier de données > `MQL5/Experts/`, copier `AEGIS_EURUSD.mq5`.
2. Ouvrir dans MetaEditor, compiler (F7).
3. Graphique **EURUSD M5**, glisser l'EA, autoriser le trading algo.

## Logique
| Bloc | Règle |
|---|---|
| Régime | H1 : EMA50 vs EMA200 donne le sens, ADX(14) > 20 sinon aucun trade |
| Volatilité | ATR M5 entre 3 et 14 pips |
| Horaires | 9h-20h heure serveur (à adapter au broker), pas le week-end, pas le vendredi après 18h |
| Spread | refus si > 1,5 pip |
| Entrée | tendance H1 obligatoire + pullback sur l'EMA20 M5 + au moins 2 confirmations sur 3 (rebond EMA20, RSI qui repasse 40/60, bougie pleine dans le sens) |
| Stop | 1 x ATR, posé dès l'ouverture côté courtier |
| Objectif | 1 x ATR, partielle de 50 % à mi-chemin, stop au point mort, trailing 0,6 x ATR |
| Sortie rapide | invalidation (clôture au-delà de l'EMA20 de 0,5 ATR) ou pas en profit après 4 bougies |
| Risque | 0,30 % par trade, perte jour max 1,5 %, 3 pertes d'affilée = pause 1h, 5 = fin de journée, 8 trades/jour max, drawdown 8 % = arrêt total |

## Pas couvert (à faire vous-même)
- **Calendrier des news** : à ajouter, ou couper l'EA à la main avant NFP, FOMC, BCE, CPI.
- Heures de session : vérifier le décalage GMT de votre broker.

## Procédure de validation
1. Strategy Tester, EURUSD M5, mode "Every tick based on real ticks", 5 ans, **spread réel du broker + commission**.
2. Ne pas optimiser plus de 2 ou 3 paramètres (SL_ATR, TP_ATR, ADXMin). Optimiser sur 2019-2023, tester sans y toucher sur 2024-2026 (walk-forward).
3. Cibles : facteur de profit > 1,4, drawdown < 10 %, plus de 1000 trades. Un taux de réussite proche de 95 % est suspect, pas rassurant.
4. Stress : doubler le spread, ajouter du slippage, tester mars 2020 et juin 2016.
5. Compte démo 2 à 3 mois, puis réel en micro-lots (0,01).
