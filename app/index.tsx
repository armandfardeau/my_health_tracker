import {Platform, Text, View} from 'react-native';
import {EntryForm} from '../EntryForm';
import {useJournal} from '../JournalState';
import {JournalPage, blue, heading, ink, muted, paper} from '../JournalUI';
import {day} from '../model';

const dateFormat = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

export default function Today() {
  const {entries, clock, rem, message, today} = useJournal();
  const recentDays = Array.from({length: 5}, (_, index) => {
    const date = new Date(clock.getFullYear(), clock.getMonth(), clock.getDate() - index - 1);
    const key = day(date);
    const labels = new Set(entries.filter(entry => entry.day === key).map(entry => {
      if (entry.answers && entry.category === 'Digestif') return 'Digestion';
      if (entry.answers && entry.category === 'Autre') return 'Symptôme';
      return entry.category || 'Je vais bien';
    }));
    return {key, date, labels: [...labels]};
  });

  return (
    <JournalPage>
      <Text style={{color: blue, fontWeight: '700'}}>MON JOURNAL</Text>
      <Text accessibilityRole="header" style={{...heading, fontSize: 34}}>Comment vous sentez-vous aujourd’hui ?</Text>
      <View style={{backgroundColor: paper, borderRadius: 14, padding: 14, gap: 8}}>
        <Text accessibilityRole="header" style={{...heading, fontSize: 18}}>Les 5 derniers jours</Text>
        {recentDays.map(({key, date, labels}) => (
          <View key={key} style={{flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 2}}>
            <Text style={{color: ink, fontWeight: '600', minWidth: 145}}>{dateFormat.format(date)}</Text>
            <Text style={{color: muted, flexShrink: 1}}>{labels.length ? labels.join(' · ') : 'Aucune entrée'}</Text>
          </View>
        ))}
      </View>
      {Platform.OS === 'web' && rem && clock.getHours() >= 20 && !entries.some(entry => entry.day === today) && (
        <Text>Votre rappel du soir · Prenez un instant pour noter votre ressenti.</Text>
      )}
      <EntryForm/>
      {!!message && <Text accessibilityLiveRegion="polite">{message}</Text>}
    </JournalPage>
  );
}
