//+------------------------------------------------------------------+
//| AEGIS_EURUSD.mq5                                                  |
//| Scalper de pullback en tendance, EURUSD, M5 (filtre H1).          |
//| Principe : peu de trades, entree seulement avec confluence,       |
//| stop dur immediat, sortie rapide si l'idee est invalidee,         |
//| coupe-circuits de risque (jour, serie de pertes, drawdown).       |
//| Pas de martingale, pas de grid, pas de moyenne a la baisse.       |
//+------------------------------------------------------------------+
#property copyright "AEGIS"
#property version   "1.00"
#property strict

#include <Trade/Trade.mqh>

//--- Identification
input long   InpMagic          = 20261021;   // Magic number
input string InpComment        = "AEGIS";

//--- Risque
input double InpRiskPercent    = 0.30;       // Risque par trade (% du solde)
input double InpMaxDailyLossPct= 1.50;       // Perte max par jour (% du solde de depart du jour)
input int    InpMaxConsecLoss  = 3;          // Pertes consecutives avant pause
input int    InpPauseMinutes   = 60;         // Duree de la pause (minutes)
input int    InpMaxTradesDay   = 8;          // Nb max de trades par jour
input double InpMaxDrawdownPct = 8.0;        // Drawdown max depuis le pic d'equity : arret total

//--- Filtres marche
input int    InpStartHour      = 9;          // Heure serveur debut (adapter a votre broker)
input int    InpEndHour        = 20;         // Heure serveur fin
input int    InpMaxSpreadPts   = 15;         // Spread max en points (15 = 1.5 pip)
input bool   InpNoFridayLate   = true;       // Pas de nouvelle entree le vendredi apres 18h
input double InpMinATRPips     = 3.0;        // ATR M5 minimal (pips) : evite marche mort
input double InpMaxATRPips     = 14.0;       // ATR M5 maximal (pips) : evite chaos

//--- Tendance (H1)
input int    InpH1FastEMA      = 50;
input int    InpH1SlowEMA      = 200;
input int    InpH1ADXPeriod    = 14;
input double InpH1ADXMin       = 20.0;       // Tendance seulement si ADX H1 > seuil

//--- Entree (M5)
input int    InpEMAPeriod      = 20;
input int    InpRSIPeriod      = 14;
input double InpRSIBuyLevel    = 40.0;       // RSI repasse au-dessus (achat)
input double InpRSISellLevel   = 60.0;       // RSI repasse en dessous (vente)
input int    InpATRPeriod      = 14;

//--- Sorties
input double InpSL_ATR         = 1.0;        // Stop = x ATR
input double InpTP_ATR         = 1.0;        // Objectif = x ATR
input bool   InpUsePartial     = true;       // Prise partielle a mi-chemin du TP + stop au point mort
input double InpPartialFrac    = 0.5;        // Fraction fermee en partielle
input double InpTrail_ATR      = 0.6;        // Trailing apres point mort (x ATR), 0 = off
input int    InpTimeStopBars   = 4;          // Sortie si pas en profit apres N bougies M5
input double InpInvalid_ATR    = 0.5;        // Invalidation : cloture au-dela de EMA20 -/+ x ATR

CTrade trade;
int hEma, hRsi, hAtr, hH1Fast, hH1Slow, hH1Adx;
datetime lastBar = 0;
datetime pauseUntil = 0;
double   peakEquity = 0;
bool     killed = false;

//+------------------------------------------------------------------+
double Buf(const int h, const int buffer, const int shift)
  {
   double b[1];
   if(CopyBuffer(h, buffer, shift, 1, b) != 1) return EMPTY_VALUE;
   return b[0];
  }

double PipSize() { return (_Digits == 3 || _Digits == 5) ? _Point * 10.0 : _Point; }

//+------------------------------------------------------------------+
int OnInit()
  {
   if(_Symbol != "EURUSD" && StringFind(_Symbol, "EURUSD") < 0)
      Print("AEGIS: concu pour EURUSD, symbole actuel = ", _Symbol);

   hEma    = iMA(_Symbol, PERIOD_M5, InpEMAPeriod, 0, MODE_EMA, PRICE_CLOSE);
   hRsi    = iRSI(_Symbol, PERIOD_M5, InpRSIPeriod, PRICE_CLOSE);
   hAtr    = iATR(_Symbol, PERIOD_M5, InpATRPeriod);
   hH1Fast = iMA(_Symbol, PERIOD_H1, InpH1FastEMA, 0, MODE_EMA, PRICE_CLOSE);
   hH1Slow = iMA(_Symbol, PERIOD_H1, InpH1SlowEMA, 0, MODE_EMA, PRICE_CLOSE);
   hH1Adx  = iADX(_Symbol, PERIOD_H1, InpH1ADXPeriod);
   if(hEma == INVALID_HANDLE || hRsi == INVALID_HANDLE || hAtr == INVALID_HANDLE ||
      hH1Fast == INVALID_HANDLE || hH1Slow == INVALID_HANDLE || hH1Adx == INVALID_HANDLE)
      return INIT_FAILED;

   trade.SetExpertMagicNumber(InpMagic);
   trade.SetDeviationInPoints(10);
   trade.SetTypeFillingBySymbol(_Symbol);
   peakEquity = AccountInfoDouble(ACCOUNT_EQUITY);
   return INIT_SUCCEEDED;
  }

void OnDeinit(const int reason)
  {
   IndicatorRelease(hEma); IndicatorRelease(hRsi); IndicatorRelease(hAtr);
   IndicatorRelease(hH1Fast); IndicatorRelease(hH1Slow); IndicatorRelease(hH1Adx);
  }

//+------------------------------------------------------------------+
//| Position du robot sur ce symbole                                  |
//+------------------------------------------------------------------+
bool SelectOwnPosition()
  {
   for(int i = PositionsTotal() - 1; i >= 0; i--)
     {
      ulong t = PositionGetTicket(i);
      if(t == 0) continue;
      if(PositionGetString(POSITION_SYMBOL) == _Symbol &&
         PositionGetInteger(POSITION_MAGIC) == InpMagic)
         return true;
     }
   return false;
  }

//+------------------------------------------------------------------+
//| Historique du jour : PnL, nb de trades, serie de pertes           |
//+------------------------------------------------------------------+
void DayStats(double &pnl, int &trades, int &consecLoss, datetime &lastCloseTime)
  {
   pnl = 0; trades = 0; consecLoss = 0; lastCloseTime = 0;
   MqlDateTime dt; TimeToStruct(TimeCurrent(), dt);
   dt.hour = 0; dt.min = 0; dt.sec = 0;
   datetime dayStart = StructToTime(dt);
   if(!HistorySelect(dayStart, TimeCurrent())) return;

   bool streakOpen = true;
   for(int i = HistoryDealsTotal() - 1; i >= 0; i--)
     {
      ulong d = HistoryDealGetTicket(i);
      if(HistoryDealGetInteger(d, DEAL_MAGIC) != InpMagic) continue;
      if(HistoryDealGetString(d, DEAL_SYMBOL) != _Symbol) continue;
      if(HistoryDealGetInteger(d, DEAL_ENTRY) != DEAL_ENTRY_OUT) continue;
      double p = HistoryDealGetDouble(d, DEAL_PROFIT) + HistoryDealGetDouble(d, DEAL_COMMISSION)
               + HistoryDealGetDouble(d, DEAL_SWAP);
      pnl += p;
      trades++;
      datetime tm = (datetime)HistoryDealGetInteger(d, DEAL_TIME);
      if(tm > lastCloseTime) lastCloseTime = tm;
      if(streakOpen)
        {
         if(p < 0) consecLoss++;
         else streakOpen = false;
        }
     }
  }

//+------------------------------------------------------------------+
//| Coupe-circuits : retourne true si on peut ouvrir un trade         |
//+------------------------------------------------------------------+
bool RiskAllows()
  {
   double eq = AccountInfoDouble(ACCOUNT_EQUITY);
   if(eq > peakEquity) peakEquity = eq;
   if(!killed && peakEquity > 0 && (peakEquity - eq) / peakEquity * 100.0 >= InpMaxDrawdownPct)
     {
      killed = true;
      Alert("AEGIS: drawdown max atteint, robot desactive. Validation manuelle requise.");
     }
   if(killed) return false;

   double pnl; int trades, consec; datetime lastClose;
   DayStats(pnl, trades, consec, lastClose);

   double bal = AccountInfoDouble(ACCOUNT_BALANCE);
   double dayStartBal = bal - pnl;
   if(dayStartBal > 0 && pnl <= -dayStartBal * InpMaxDailyLossPct / 100.0) return false;
   if(trades >= InpMaxTradesDay) return false;

   if(consec >= InpMaxConsecLoss)
     {
      // 5 pertes d'affilee = fin de journee, sinon pause limitee
      if(consec >= InpMaxConsecLoss + 2) return false;
      if(TimeCurrent() < lastClose + InpPauseMinutes * 60) return false;
     }
   return true;
  }

//+------------------------------------------------------------------+
bool MarketAllows()
  {
   MqlDateTime dt; TimeToStruct(TimeCurrent(), dt);
   if(dt.hour < InpStartHour || dt.hour >= InpEndHour) return false;
   if(dt.day_of_week == 0 || dt.day_of_week == 6) return false;
   if(InpNoFridayLate && dt.day_of_week == 5 && dt.hour >= 18) return false;
   long spread = SymbolInfoInteger(_Symbol, SYMBOL_SPREAD);
   if(spread > InpMaxSpreadPts) return false;
   return true;
  }

//+------------------------------------------------------------------+
//| Lot selon le risque et la distance du stop                        |
//+------------------------------------------------------------------+
double LotForRisk(const double slDistance)
  {
   double tickVal  = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);
   double tickSize = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
   double step     = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
   double vmin     = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
   double vmax     = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX);
   if(tickVal <= 0 || tickSize <= 0 || slDistance <= 0 || step <= 0) return 0;

   double riskMoney = AccountInfoDouble(ACCOUNT_BALANCE) * InpRiskPercent / 100.0;
   double lossPerLot = slDistance / tickSize * tickVal;
   double lots = MathFloor(riskMoney / lossPerLot / step) * step;
   if(lots < vmin) return 0;           // jamais plus de risque que prevu
   return MathMin(lots, vmax);
  }

//+------------------------------------------------------------------+
//| Recherche de signal sur la bougie M5 qui vient de se fermer       |
//+------------------------------------------------------------------+
int Signal(double &atr)
  {
   atr = Buf(hAtr, 0, 1);
   double ema1 = Buf(hEma, 0, 1);
   double rsi1 = Buf(hRsi, 0, 1), rsi2 = Buf(hRsi, 0, 2);
   double f = Buf(hH1Fast, 0, 1), s = Buf(hH1Slow, 0, 1);
   double adx = Buf(hH1Adx, 0, 1);
   if(atr == EMPTY_VALUE || ema1 == EMPTY_VALUE || rsi1 == EMPTY_VALUE || rsi2 == EMPTY_VALUE ||
      f == EMPTY_VALUE || s == EMPTY_VALUE || adx == EMPTY_VALUE) return 0;

   double pip = PipSize();
   if(atr < InpMinATRPips * pip || atr > InpMaxATRPips * pip) return 0;
   if(adx < InpH1ADXMin) return 0;                       // pas de tendance : on ne fait rien

   double o = iOpen(_Symbol, PERIOD_M5, 1), c = iClose(_Symbol, PERIOD_M5, 1);
   double h = iHigh(_Symbol, PERIOD_M5, 1), l = iLow(_Symbol, PERIOD_M5, 1);
   double body = MathAbs(c - o), range = h - l;
   if(range <= 0) return 0;

   // Tendance H1 obligatoire, puis 2 confirmations sur 3 en M5
   if(f > s)
     {
      int score = 0;
      if(l <= ema1 && c > ema1) score++;                         // rebond sur EMA20
      if(rsi2 <= InpRSIBuyLevel && rsi1 > InpRSIBuyLevel) score++; // RSI repart
      if(c > o && body >= 0.5 * range) score++;                  // bougie haussiere pleine
      if(score >= 2 && l <= ema1) return +1;                     // le pullback doit avoir eu lieu
     }
   if(f < s)
     {
      int score = 0;
      if(h >= ema1 && c < ema1) score++;
      if(rsi2 >= InpRSISellLevel && rsi1 < InpRSISellLevel) score++;
      if(c < o && body >= 0.5 * range) score++;
      if(score >= 2 && h >= ema1) return -1;
     }
   return 0;
  }

//+------------------------------------------------------------------+
void TryEntry()
  {
   if(!MarketAllows() || !RiskAllows()) return;

   double atr;
   int sig = Signal(atr);
   if(sig == 0) return;

   double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double slDist = InpSL_ATR * atr;
   double tpDist = InpTP_ATR * atr;

   double minStop = SymbolInfoInteger(_Symbol, SYMBOL_TRADE_STOPS_LEVEL) * _Point;
   if(slDist < minStop) slDist = minStop;
   if(tpDist < minStop) tpDist = minStop;

   double lots = LotForRisk(slDist);
   if(lots <= 0) return;

   if(sig > 0)
      trade.Buy(lots, _Symbol, ask, NormalizeDouble(ask - slDist, _Digits),
                NormalizeDouble(ask + tpDist, _Digits), InpComment);
   else
      trade.Sell(lots, _Symbol, bid, NormalizeDouble(bid + slDist, _Digits),
                 NormalizeDouble(bid - tpDist, _Digits), InpComment);
  }

//+------------------------------------------------------------------+
//| Gestion de la position ouverte (a chaque tick)                    |
//+------------------------------------------------------------------+
void ManagePosition()
  {
   if(!SelectOwnPosition()) return;

   ulong  ticket = PositionGetInteger(POSITION_TICKET);
   long   type   = PositionGetInteger(POSITION_TYPE);
   double open   = PositionGetDouble(POSITION_PRICE_OPEN);
   double sl     = PositionGetDouble(POSITION_SL);
   double tp     = PositionGetDouble(POSITION_TP);
   double vol    = PositionGetDouble(POSITION_VOLUME);
   double profit = PositionGetDouble(POSITION_PROFIT);
   datetime opened = (datetime)PositionGetInteger(POSITION_TIME);
   bool isBuy = (type == POSITION_TYPE_BUY);
   double price = isBuy ? SymbolInfoDouble(_Symbol, SYMBOL_BID) : SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   double atr = Buf(hAtr, 0, 1);
   bool atBreakEven = (sl != 0) && (isBuy ? sl >= open : sl <= open);

   // 1) Invalidation / temps : seulement tant qu'on n'est pas deja protege
   if(!atBreakEven)
     {
      double ema1 = Buf(hEma, 0, 1);
      double c1 = iClose(_Symbol, PERIOD_M5, 1);
      if(ema1 != EMPTY_VALUE && atr != EMPTY_VALUE && InpInvalid_ATR > 0)
        {
         bool invalid = isBuy ? (c1 < ema1 - InpInvalid_ATR * atr) : (c1 > ema1 + InpInvalid_ATR * atr);
         if(invalid && opened < iTime(_Symbol, PERIOD_M5, 1)) { trade.PositionClose(ticket); return; }
        }
      if(InpTimeStopBars > 0 && profit <= 0 &&
         TimeCurrent() - opened >= InpTimeStopBars * PeriodSeconds(PERIOD_M5))
        { trade.PositionClose(ticket); return; }
     }

   // 2) Partielle a mi-chemin du TP puis stop au point mort
   if(InpUsePartial && !atBreakEven && tp != 0)
     {
      double trigger = open + (tp - open) * 0.5;
      bool reached = isBuy ? price >= trigger : price <= trigger;
      if(reached)
        {
         double step = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
         double vmin = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
         double part = MathFloor(vol * InpPartialFrac / step) * step;
         if(part >= vmin && vol - part >= vmin) trade.PositionClosePartial(ticket, part);
         double spreadAdj = SymbolInfoInteger(_Symbol, SYMBOL_SPREAD) * _Point;
         double newSl = isBuy ? open + spreadAdj : open - spreadAdj;
         trade.PositionModify(ticket, NormalizeDouble(newSl, _Digits), tp);
         return;
        }
     }

   // 3) Trailing serre une fois protege
   if(atBreakEven && InpTrail_ATR > 0 && atr != EMPTY_VALUE)
     {
      double newSl = isBuy ? price - InpTrail_ATR * atr : price + InpTrail_ATR * atr;
      newSl = NormalizeDouble(newSl, _Digits);
      double minStop = SymbolInfoInteger(_Symbol, SYMBOL_TRADE_STOPS_LEVEL) * _Point;
      bool better = isBuy ? (newSl > sl && price - newSl >= minStop) : (newSl < sl && newSl - price >= minStop);
      if(better) trade.PositionModify(ticket, newSl, tp);
     }
  }

//+------------------------------------------------------------------+
void OnTick()
  {
   ManagePosition();

   datetime bar = iTime(_Symbol, PERIOD_M5, 0);
   if(bar == lastBar) return;
   lastBar = bar;

   if(!SelectOwnPosition()) TryEntry();
  }
//+------------------------------------------------------------------+
