export type SymptomCategory = 'Inflammation' | 'Digestif';

export type SymptomAnswers = {
  details?: string[];
  otherDetail?: string;
  pain?: number;
  signs?: string[];
  fatigue?: string[];
  fatigueContext?: string[];
  activity?: string;
  diet?: string;
};

export const categories = [
  { value: 'Inflammation', label: 'Inflammation' },
  { value: 'Digestif', label: 'Digestion' },
] as const;

export const detailsByCategory: Record<SymptomCategory, readonly string[]> = {
  Inflammation: ['Mains', 'Peau', 'Avant-bras', 'Épaules', 'Bas du dos', 'Utérus', 'Nuque', 'Mâchoire', 'Aphtes', 'Autres'],
  Digestif: ['Crampes', 'Coliques', 'Aérophagie', '« Point »', 'Autres'],
};

export const painLevels = [
  'Inconfortable / je peux m’adapter',
  'Inconfortable / je peux ne pas y penser',
  'Inconfortable / difficultés de concentration',
  'Pénible / limite les activités et le sommeil',
  'Pénible / besoin d’aide pour certaines activités',
  'Sévère / alitement, je ne peux pas converser',
  'Intense / malaise possible',
];

export const signs = [
  'Nausées', 'Fièvre', 'Ganglions', 'Maux de tête', 'Acouphène', 'Gaz',
  'Fourmis', 'Troubles de la vue', 'Perte d’appétit', 'Downs moral', 'Colère',
];

export const fatigue = [
  'Non', 'Lassitude', 'Downs ponctuels', 'Difficultés de concentration',
  'Nervosité', 'Difficultés à rester éveillée',
];

export const fatigueContext = [
  'Grosse journée', 'Plusieurs grosses journées', 'Mauvaise nuit',
  'Grosse émotion', 'Ennui', 'Interactions sociales',
];

export const activity = ['Sédentaire', 'Modérée', 'Soutenue', 'Intense'];

export function answerSummary(answers: SymptomAnswers) {
  const { details, otherDetail, pain, signs, fatigue, fatigueContext, activity, diet } = answers;
  return [
    ['Détails', details?.map(detail => detail === 'Autres' && otherDetail ? otherDetail : detail).join(', ')],
    ['Intensité de la douleur', pain === undefined ? undefined : pain + ' / 7 · ' + painLevels[pain - 1]],
    ['Autres signes', signs?.join(', ')],
    ['Fatigue', fatigue?.join(', ')],
    ['Contexte de la fatigue', fatigueContext?.join(', ')],
    ['Activité physique', activity],
    ['Alimentation', diet],
  ].filter(([, value]) => value);
}
