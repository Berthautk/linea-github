/**
 * Illustrative Mobile Money SMS fixtures for MTN Cameroon and Orange Money Cameroun.
 * Clearly marked as examples for testing and on-device parser evaluation.
 */

export interface MomoFixture {
  id: string;
  operator: 'MTN' | 'Orange';
  lang: 'fr' | 'en';
  type: 'envoi' | 'retrait' | 'paiement' | 'reception' | 'depot' | 'recharge';
  sms: string;
  expected: {
    amount: number;
    fee?: number;
    ref?: string;
    who?: string;
    balanceAfter?: number;
  };
}

export const MOMO_FIXTURES: MomoFixture[] = [
  // 1. MTN FR - Envoi d'argent avec frais
  {
    id: 'mtn-fr-envoi-frais',
    operator: 'MTN',
    lang: 'fr',
    type: 'envoi',
    sms: 'Transfert effectue avec succes. Vous avez envoye 25 000 FCFA a CABREL KAMGA (677123456). Frais: 250 FCFA. Nouveau solde: 145 200 FCFA. ID transaction: 18274910283.',
    expected: {
      amount: 25000,
      fee: 250,
      ref: '18274910283',
      who: 'CABREL KAMGA',
      balanceAfter: 145200,
    },
  },
  // 2. MTN FR - Réception d'argent
  {
    id: 'mtn-fr-reception',
    operator: 'MTN',
    lang: 'fr',
    type: 'reception',
    sms: 'Vous avez recu 50.000 FCFA de JEAN FOTSO (670987654). Votre nouveau solde est de 195 200 FCFA. Ref: MP260930.1415.B12345.',
    expected: {
      amount: 50000,
      ref: 'MP260930.1415.B12345',
      who: 'JEAN FOTSO',
      balanceAfter: 195200,
    },
  },
  // 3. MTN FR - Paiement marchand / facture
  {
    id: 'mtn-fr-paiement',
    operator: 'MTN',
    lang: 'fr',
    type: 'paiement',
    sms: 'Paiement de 12 500 FCFA effectue avec succes a ENEO CAMEROON. Frais: 0 FCFA. Solde restant: 132 700 FCFA. TxID: 8493029104.',
    expected: {
      amount: 12500,
      fee: 0,
      ref: '8493029104',
      who: 'ENEO CAMEROON',
      balanceAfter: 132700,
    },
  },
  // 4. MTN EN - Cash Out (Retrait)
  {
    id: 'mtn-en-cashout',
    operator: 'MTN',
    lang: 'en',
    type: 'retrait',
    sms: 'Cash Out successful. You withdrew 30,000 FCFA from Agent KIOSK BONAMOUSSADI (671234567). Fee: 600 FCFA. New Balance: 102,100 FCFA. Financial Transaction Id: 9482710394.',
    expected: {
      amount: 30000,
      fee: 600,
      ref: '9482710394',
      who: 'Agent KIOSK BONAMOUSSADI',
      balanceAfter: 102100,
    },
  },
  // 5. MTN EN - Transfer to number
  {
    id: 'mtn-en-transfer',
    operator: 'MTN',
    lang: 'en',
    type: 'envoi',
    sms: 'Yello! 15000 FCFA transferred to MARIE NGU (675554433). Fee: 150 FCFA. Balance: 86950 FCFA. Transaction ID: 294810395.',
    expected: {
      amount: 15000,
      fee: 150,
      ref: '294810395',
      who: 'MARIE NGU',
      balanceAfter: 86950,
    },
  },
  // 6. MTN FR - Achat de crédit / Recharge
  {
    id: 'mtn-fr-recharge',
    operator: 'MTN',
    lang: 'fr',
    type: 'recharge',
    sms: 'Recharge reussie de 2000 FCFA pour le numero 677889900. Nouveau solde MoMo: 84 950 FCFA. Txn ID: 736291048.',
    expected: {
      amount: 2000,
      ref: '736291048',
      balanceAfter: 84950,
    },
  },
  // 7. Orange Money FR - Transfert national
  {
    id: 'om-fr-transfert',
    operator: 'Orange',
    lang: 'fr',
    type: 'envoi',
    sms: 'Transfert reussi. Vous avez transfere 10 000 FCFA a MAMAN (699112233). Frais: 100 FCFA. Nouveau solde: 74 850 FCFA. Ref: CI260930.1234.A56789.',
    expected: {
      amount: 10000,
      fee: 100,
      ref: 'CI260930.1234.A56789',
      who: 'MAMAN',
      balanceAfter: 74850,
    },
  },
  // 8. Orange Money FR - Réception d'argent
  {
    id: 'om-fr-reception',
    operator: 'Orange',
    lang: 'fr',
    type: 'reception',
    sms: 'Vous avez recu un transfert de 35 000 FCFA de PAUL BIKELE (691234567). Nouveau solde: 109 850 FCFA. ID transaction: OM-987456123.',
    expected: {
      amount: 35000,
      ref: 'OM-987456123',
      who: 'PAUL BIKELE',
      balanceAfter: 109850,
    },
  },
  // 9. Orange Money FR - Retrait d'argent en point relais
  {
    id: 'om-fr-retrait',
    operator: 'Orange',
    lang: 'fr',
    type: 'retrait',
    sms: 'Retrait effectue. Vous avez retire 20000 FCFA chez ETS LA GLOIRE. Frais: 400 FCFA. Votre solde est de 89 450 FCFA. Ref transaction: OM2609300099.',
    expected: {
      amount: 20000,
      fee: 400,
      ref: 'OM2609300099',
      who: 'ETS LA GLOIRE',
      balanceAfter: 89450,
    },
  },
  // 10. Orange Money FR - Paiement marchand
  {
    id: 'om-fr-paiement',
    operator: 'Orange',
    lang: 'fr',
    type: 'paiement',
    sms: 'Paiement marchand valide. 8 500 FCFA payes a SUPERMARCHE DOVV. Frais: 0 FCFA. Solde OM: 80 950 FCFA. Ref: PP260930.9988.',
    expected: {
      amount: 8500,
      fee: 0,
      ref: 'PP260930.9988',
      who: 'SUPERMARCHE DOVV',
      balanceAfter: 80950,
    },
  },
  // 11. Orange Money EN - Transfer to customer
  {
    id: 'om-en-transfer',
    operator: 'Orange',
    lang: 'en',
    type: 'envoi',
    sms: 'You transferred 17,500 XAF to CABREL (698765432). Fee: 175 XAF. New balance: 63,275 XAF. Txn ID: OM-EN-8371920.',
    expected: {
      amount: 17500,
      fee: 175,
      ref: 'OM-EN-8371920',
      who: 'CABREL',
      balanceAfter: 63275,
    },
  },
  // 12. Orange Money EN - Cash deposit
  {
    id: 'om-en-deposit',
    operator: 'Orange',
    lang: 'en',
    type: 'depot',
    sms: 'Orange Money: Cash In successful. 100 000 FCFA deposited by Agent TOTAL BASTOS. Fee: 0 FCFA. Balance: 163 275 FCFA. Transaction ID: DP-94820194.',
    expected: {
      amount: 100000,
      fee: 0,
      ref: 'DP-94820194',
      who: 'Agent TOTAL BASTOS',
      balanceAfter: 163275,
    },
  },
];
