import {useState} from 'react';
import {Text, View} from 'react-native';
import {Button, ink, muted} from './JournalUI';
import type {Entry} from './model';
import {answerSummary} from './symptoms';

function fields(entry: Entry): [string, string[]][] {
  const a = entry.answers;
  return [
    ['Détails', a?.details?.map(value => value === 'Autres' ? a.otherDetail ?? '' : value) ?? []],
    ['Douleur', a?.pain ? [a.pain + ' / 7'] : []],
    ['Autres signes', a?.signs ?? []],
    ['Fatigue', a?.fatigue ?? []],
    ['Contexte de la fatigue', a?.fatigueContext ?? []],
    ['Activité physique', a?.activity ? [a.activity] : []],
    ['Alimentation', a?.diet ? [a.diet] : []],
  ];
}

function normalized(value: string) {
  return value.trim().toLocaleLowerCase('fr').replace(/\s+/g, ' ');
}

export function reviewEntry(event: Entry, entries: Entry[]) {
  const time = Date.parse(event.time);
  const earlier = entries.filter(entry => entry.id !== event.id && Date.parse(entry.time) < time);
  const recent = earlier.filter(entry => time - Date.parse(entry.time) <= 86400000)
    .sort((a, b) => Date.parse(b.time) - Date.parse(a.time));
  const comparable = earlier.filter(entry => entry.category === event.category && entry.day < event.day)
    .map(entry => ({day: entry.day, fields: fields(entry)}));
  const patterns = fields(event).flatMap(([label, values], index) => values.filter(value => value.trim()).flatMap(value => {
    const known = new Set<string>();
    const matches = new Set<string>();
    for (const entry of comparable) {
      const reported = entry.fields[index][1].map(normalized).filter(Boolean);
      if (reported.length) known.add(entry.day);
      if (reported.includes(normalized(value))) matches.add(entry.day);
    }
    return matches.size >= 2 ? [{label, value, count: matches.size, total: known.size}] : [];
  }));
  return {recent, patterns};
}

export function EntryReview({entry, entries}: {entry: Entry; entries: Entry[]}) {
  const [open, setOpen] = useState(false);
  const review = open ? reviewEntry(entry, entries) : null;
  return <View style={{gap: 8, marginTop: 8}}>
    <Button label={open ? 'Masquer le contexte' : 'Explorer le contexte'} onPress={() => setOpen(!open)}/>
    {review && <>
      <Text accessibilityRole="header" style={{color: ink, fontWeight: '700'}}>Dans les 24 heures précédentes</Text>
      {!review.recent.length && <Text style={{color: muted}}>Aucune entrée enregistrée pendant cette période.</Text>}
      {review.recent.map(previous => <View key={previous.id} style={{gap: 4, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: '#C8D6E5'}}>
        <Text style={{color: ink, fontWeight: '600'}}>{previous.day.split('-').reverse().join('/')} · {new Date(previous.time).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})} · {previous.category === 'Digestif' ? 'Digestion' : previous.category === 'Autre' ? 'Symptôme' : previous.category || 'Je vais bien'}</Text>
        {!!previous.note && <Text style={{color: ink}}>{previous.note}</Text>}
        {previous.answers && answerSummary(previous.answers).map(([label, value]) =>
          <Text key={label} style={{color: ink}}>{label} · {value}</Text>)}
      </View>)}
      <Text accessibilityRole="header" style={{color: ink, fontWeight: '700'}}>Ce qui revient dans les épisodes de même catégorie</Text>
      <Text style={{color: muted}}>Chaque réponse de cet épisode est comparée aux jours précédents où un épisode de la même catégorie et une réponse à cette question ont été renseignés.</Text>
      {!review.patterns.length && <Text style={{color: muted}}>Aucune réponse de cet épisode ne revient sur au moins deux jours précédents.</Text>}
      {review.patterns.map(({label, value, count, total}) => <Text key={label + value} style={{color: ink}}>
        {label} · {value} ({count} sur {total} jours renseignés)
      </Text>)}
      <Text style={{color: muted}}>Ces rapprochements décrivent votre journal. Ils ne permettent pas de déterminer la cause de l’épisode.</Text>
    </>}
  </View>;
}
