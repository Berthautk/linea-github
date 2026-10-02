// Catalogue des pièces demandées dans les dossiers (concours, emploi, études,
// visa, état civil, banque…), établi à partir des listes officielles et des
// guides cités dans PIECES.md. Chaque pièce :
//   id, cat (catégorie), fr / en (nom), abbr (sigle éventuel),
//   kind : 'doc' (page A4), 'card' (carte recto-verso), 'photo' (photo d'identité),
//   months : ancienneté maximale souvent exigée (vérifiée à titre indicatif),
//   rule : { fr, en } rappel affiché sous le nom.

export const CATEGORIES = [
  { id: 'identite', fr: 'Identité et état civil', en: 'Identity and civil status' },
  { id: 'etudes', fr: 'Études et diplômes', en: 'Education and diplomas' },
  { id: 'emploi', fr: 'Emploi et carrière', en: 'Employment and career' },
  { id: 'sante', fr: 'Santé et casier judiciaire', en: 'Health and criminal record' },
  { id: 'argent', fr: 'Argent et logement', en: 'Money and housing' },
  { id: 'voyage', fr: 'Voyage et visa', en: 'Travel and visa' },
  { id: 'formulaires', fr: 'Demandes et formulaires', en: 'Applications and forms' },
  { id: 'autre', fr: 'Autre', en: 'Other' },
];

const P = (cat, id, fr, en, extra = {}) => ({ cat, id, fr, en, kind: 'doc', ...extra });
const R = (fr, en) => ({ rule: { fr, en } });

export const PIECES = [
  // Identité et état civil
  P('identite', 'cni', "Carte nationale d'identité", 'National identity card', {
    abbr: { fr: 'CNI', en: 'NIC' }, kind: 'card',
    ...R('Recto puis verso. En cours de validité ; copie certifiée conforme si elle est demandée.',
      'Front then back. Must be valid; certified copy if requested.'),
  }),
  P('identite', 'passeport', "Passeport (page d'identité)", 'Passport (data page)', R(
    'En cours de validité. Pour un visa : valable au moins 3 mois après le retour, 2 pages vierges.',
    'Must be valid. For a visa: valid 3 months after return, 2 blank pages.')),
  P('identite', 'sejour', 'Titre de séjour / carte de séjour', 'Residence permit', {
    kind: 'card', ...R('Recto puis verso, en cours de validité.', 'Front then back, must be valid.'),
  }),
  P('identite', 'photo', "Photo d'identité", 'ID photo', {
    kind: 'photo',
    ...R('Récente, fond blanc, sans lunettes ni couvre-chef. 4×4 cm (concours au Cameroun) ou 35×45 mm (visa). En ligne : souvent moins de 50 Ko.',
      'Recent, white background, no glasses or headwear. 4×4 cm (Cameroon exams) or 35×45 mm (visa). Online: often under 50 KB.'),
  }),
  P('identite', 'naissance', 'Acte de naissance', 'Birth certificate', {
    months: 3,
    ...R('Copie certifiée conforme, le plus souvent datée de moins de 3 mois.',
      'Certified copy, usually dated less than 3 months ago.'),
  }),
  P('identite', 'nationalite', 'Certificat de nationalité', 'Certificate of nationality', R(
    'Demandé pour les concours, la CNI et le passeport.',
    'Required for exams, ID card and passport applications.')),
  P('identite', 'mariage', 'Acte de mariage', 'Marriage certificate', R(
    'Si vous êtes marié(e) (CNI, passeport, recrutement).',
    'If married (ID card, passport, recruitment).')),
  P('identite', 'celibat', 'Certificat de célibat', 'Certificate of single status', R(
    'Dossier de mariage.', 'Marriage file.')),
  P('identite', 'deces', 'Acte de décès', 'Death certificate'),
  P('identite', 'jugement', 'Jugement (divorce, filiation…)', 'Court judgment (divorce, filiation…)'),
  P('identite', 'autorisation_parentale', 'Autorisation parentale', 'Parental authorization', R(
    "Pour un mineur, avec la pièce d'identité du parent ou du tuteur.",
    "For a minor, with the parent's or guardian's ID.")),
  P('identite', 'perte', 'Déclaration de perte ou de vol', 'Loss or theft report', R(
    'Délivrée par le commissariat ou la gendarmerie.', 'Issued by the police or gendarmerie.')),
  P('identite', 'livret_famille', 'Livret de famille', 'Family record book'),
  P('identite', 'certif_domicile', 'Certificat de domicile / de résidence', 'Certificate of residence'),

  // Études et diplômes
  P('etudes', 'diplome', 'Diplôme', 'Diploma / degree certificate', R(
    'Copie certifiée conforme du diplôme exigé.', 'Certified copy of the required diploma.')),
  P('etudes', 'presentation_original', "Attestation de présentation de l'original du diplôme", 'Certificate of presentation of the original diploma', R(
    'Signée par une autorité administrative (fonction publique, Cameroun).',
    'Signed by an administrative authority (public service, Cameroon).')),
  P('etudes', 'attestation_reussite', 'Attestation de réussite', 'Pass certificate'),
  P('etudes', 'releve_bac', 'Relevé de notes du Baccalauréat / GCE A Level', 'Baccalauréat / GCE A Level transcript'),
  P('etudes', 'releve_probatoire', 'Relevé de notes du Probatoire (ou équivalent)', 'Probatoire transcript (or equivalent)'),
  P('etudes', 'bulletins', 'Bulletins de notes (2nde, 1ère, Terminale)', 'School report cards (last three years)'),
  P('etudes', 'releves_univ', 'Relevés de notes universitaires', 'University transcripts', R(
    "Un par année d'études après le baccalauréat.", 'One per year of study after secondary school.')),
  P('etudes', 'scolarite', 'Certificat de scolarité', 'Certificate of enrolment'),
  P('etudes', 'carte_etudiant', "Carte d'étudiant", 'Student card', { kind: 'card' }),
  P('etudes', 'preinscription', "Attestation de pré-inscription / d'admission", 'Pre-enrolment / admission letter'),
  P('etudes', 'traduction', 'Traduction officielle', 'Certified translation', R(
    'Par exemple, bulletins anglophones traduits en français pour Campus France.',
    'For example, English-language reports translated into French for Campus France.')),
  P('etudes', 'attestation_bourse', 'Attestation de bourse', 'Scholarship certificate'),

  // Emploi et carrière
  P('emploi', 'cv', 'Curriculum vitae', 'CV / Résumé', { abbr: { fr: 'CV', en: 'CV' } }),
  P('emploi', 'motivation', 'Lettre de motivation', 'Cover letter'),
  P('emploi', 'demande', 'Demande manuscrite ou timbrée', 'Handwritten or stamped application letter', R(
    "Adressée à l'autorité compétente (ministre, maire, directeur…).",
    'Addressed to the competent authority (minister, mayor, director…).')),
  P('emploi', 'recommandation', 'Lettre de recommandation / références', 'Recommendation letter / references'),
  P('emploi', 'attestation_travail', "Attestation de travail (d'emploi)", 'Employment certificate', R(
    'Parfois exigée de moins de 3 mois (banque).', 'Sometimes required to be under 3 months old (bank).')),
  P('emploi', 'certificat_travail', 'Certificat de travail', 'Certificate of employment (end of contract)'),
  P('emploi', 'contrat', 'Contrat de travail', 'Employment contract'),
  P('emploi', 'bulletins_paie', 'Bulletins de paie', 'Payslips', R(
    'Souvent les 3 derniers.', 'Often the last 3.')),
  P('emploi', 'presence_poste', 'Attestation de présence effective au poste', 'Certificate of effective presence at post'),
  P('emploi', 'acte_admin', 'Acte administratif (recrutement, avancement, affectation)', 'Administrative act (recruitment, promotion, posting)'),
  P('emploi', 'notice', 'Notice individuelle / fiche antilope', 'Personal record form (notice individuelle)', R(
    'Dossiers de carrière de la fonction publique (Cameroun).', 'Public service career files (Cameroon).')),

  // Santé et casier judiciaire
  P('sante', 'casier', 'Extrait de casier judiciaire (bulletin n°3)', 'Criminal record extract (bulletin No. 3)', {
    months: 3,
    ...R('Le plus souvent daté de moins de 3 mois.', 'Usually dated less than 3 months ago.'),
  }),
  P('sante', 'certif_medical', 'Certificat médical', 'Medical certificate', {
    months: 3,
    ...R('Souvent de moins de 3 mois ; parfois exigé d\'un médecin du secteur public.',
      'Often under 3 months old; sometimes required from a public-sector doctor.'),
  }),
  P('sante', 'visite_medicale', 'Bulletin de visite et contre-visite médicale', 'Medical examination report'),
  P('sante', 'certif_taille', 'Certificat de taille', 'Height certificate', R(
    'Concours de la police, de l\'armée.', 'Police and army entrance exams.')),
  P('sante', 'aptitude_conduite', "Certificat médical d'aptitude à la conduite", 'Medical fitness-to-drive certificate', {
    months: 3, ...R('Permis de conduire, de moins de 3 mois.', 'Driving licence, under 3 months old.'),
  }),

  // Argent et logement
  P('argent', 'quittance', 'Quittance / reçu de paiement des frais', 'Payment receipt (fees)'),
  P('argent', 'releves_bancaires', 'Relevés bancaires', 'Bank statements', R(
    'Souvent les 3 derniers mois.', 'Often the last 3 months.')),
  P('argent', 'ressources', 'Attestation de ressources / de prise en charge', 'Proof of funds / sponsorship letter'),
  P('argent', 'domicile', 'Justificatif de domicile (facture ENEO, CDE, loyer)', 'Proof of address (utility bill, rent receipt)', {
    months: 6, ...R('Souvent de moins de 6 mois (titre de séjour en France).', 'Often under 6 months old (French residence permit).'),
  }),
  P('argent', 'plan_localisation', 'Plan de localisation', 'Location map'),
  P('argent', 'hebergement', "Attestation d'hébergement", 'Accommodation certificate', R(
    "Avec la pièce d'identité de l'hébergeant.", "With the host's ID document.")),
  P('argent', 'bail', 'Contrat de bail / titre de propriété', 'Lease / property deed'),
  P('argent', 'niu', "Attestation d'immatriculation (NIU)", 'Taxpayer number certificate (NIU)', { abbr: { fr: 'NIU', en: 'NIU' } }),
  P('argent', 'rib', "Relevé d'identité bancaire", 'Bank account details', { abbr: { fr: 'RIB', en: 'RIB' } }),
  P('argent', 'impots', "Avis d'imposition", 'Tax notice'),
  P('argent', 'cnps', "Livret d'assurance / attestation CNPS", 'Social security record (CNPS)'),

  // Voyage et visa
  P('voyage', 'form_visa', 'Formulaire de demande de visa (signé)', 'Visa application form (signed)'),
  P('voyage', 'billet', "Réservation de billet d'avion", 'Flight reservation'),
  P('voyage', 'hotel', "Réservation d'hôtel", 'Hotel booking'),
  P('voyage', 'assurance', 'Assurance voyage', 'Travel insurance', R(
    'Visa Schengen : au moins 30 000 € de couverture.', 'Schengen visa: at least €30,000 cover.')),
  P('voyage', 'invitation', "Lettre d'invitation", 'Invitation letter'),
  P('voyage', 'lettre_explicative', 'Lettre explicative (motif du voyage)', 'Cover letter (purpose of travel)'),
  P('voyage', 'visa', 'Visa (page du passeport)', 'Visa (passport page)'),

  // Demandes et formulaires
  P('formulaires', 'fiche_inscription', "Fiche d'inscription (timbrée)", 'Registration form (stamped)'),
  P('formulaires', 'preenrolement', 'Reçu de pré-enrôlement', 'Pre-enrolment receipt', R(
    'Passeport (PassCam), CNI.', 'Passport (PassCam), ID card.')),
  P('formulaires', 'formulaire', 'Formulaire rempli et signé', 'Completed and signed form'),
  P('formulaires', 'honneur', "Attestation / déclaration sur l'honneur", 'Sworn statement'),

  // Autre
  P('autre', 'autre', 'Autre pièce (nom au choix)', 'Other document (your own name)'),
];

export const DOSSIER_NAMES = {
  fr: ['Dossier de concours', 'Dossier Campus France', 'Dossier de visa', 'Dossier de passeport',
    'Dossier CNI', 'Dossier de recrutement', "Dossier d'inscription universitaire", 'Dossier de bourse',
    'Dossier de mariage', "Dossier d'ouverture de compte", 'Dossier de pension CNPS',
    'Dossier de permis de conduire', 'Dossier de titre de séjour'],
  en: ['Exam application', 'Campus France application', 'Visa application', 'Passport application',
    'ID card application', 'Job application', 'University enrolment', 'Scholarship application',
    'Marriage file', 'Bank account opening', 'CNPS pension file', 'Driving licence application',
    'Residence permit application'],
};

// Autres noms sous lesquels on cherche une pièce (recherche du catalogue).
export const SYNONYMS = {
  cni: "carte d'identité pièce d'identité ID card identity",
  passeport: 'passport',
  naissance: "extrait de naissance acte de naissance copie intégrale birth",
  diplome: 'licence master doctorat bts hnd dut deug bac baccalauréat probatoire bepc cep cap gce brevet ' +
    'diplôme de licence certificat de réussite parchemin attestation de diplôme degree bachelor',
  attestation_reussite: 'certificat de réussite attestation de succès relevé provisoire attestation de diplôme ' +
    'licence master bts bac success certificate',
  releves_univ: 'relevé de notes licence master transcript bulletin',
  releve_bac: 'bac baccalauréat gce a level',
  scolarite: "certificat d'inscription attestation d'inscription enrolment",
  casier: 'casier judiciaire bulletin 3 criminal record',
  certif_medical: 'visite médicale aptitude physique medical',
  domicile: 'facture eneo camwater cde loyer quittance de loyer',
  quittance: 'reçu paiement frais de concours bordereau receipt',
  cv: 'cv curriculum resume',
  motivation: 'lettre de motivation cover letter',
  attestation_travail: "attestation d'emploi certificat de travail employment",
  honneur: "déclaration sur l'honneur",
};

export function pieceById(id) {
  return PIECES.find(p => p.id === id);
}

// Nom de fichier sûr pour les sites de dépôt : lettres sans accents,
// chiffres et « _ » seulement.
export function slug(s, max = 48) {
  return (s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/['’]/g, ' ')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, max)
    .replace(/_+$/g, '') || 'Piece';
}
