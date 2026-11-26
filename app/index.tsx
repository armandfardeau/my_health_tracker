import {Platform, Text, View} from 'react-native';
import {EntryForm} from '../EntryForm';
import {useJournal} from '../JournalState';
import {JournalPage, blue, heading, ink, muted, paper} from '../JournalUI';
import {day} from '../model';
import {answerSummary} from '../symptoms';

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
    const dayEntries = entries.filter(entry => entry.day === key)
      .sort((a, b) => a.time.localeCompare(b.time));
    return {key, date, dayEntries};
  });

  return (
    <JournalPage>
      <Text style={{color: blue, fontWeight: '700'}}>MON JOURNAL</Text>
      <Text accessibilityRole="header" style={{...heading, fontSize: 34}}>Comment vous sentez-vous aujourd’hui ?</Text>
      <View style={{backgroundColor: paper, borderRadius: 14, padding: 14, gap: 8}}>
        <Text accessibilityRole="header" style={{...heading, fontSize: 18}}>Les 5 derniers jours</Text>
        {recentDays.map(({key, date, dayEntries}) => (
          <View key={key} style={{gap: 6, paddingVertical: 4}}>
            <Text style={{color: ink, fontWeight: '700'}}>{dateFormat.format(date)}</Text>
            {dayEntries.length === 0 && <Text style={{color: muted}}>Aucune entrée</Text>}
            {dayEntries.map(entry => {
              const category = entry.answers && entry.category === 'Digestif' ? 'Digestion'
                : entry.answers && entry.category === 'Autre' ? 'Symptôme'
                : entry.category || 'Je vais bien';
              return (
                <View key={entry.id} style={{gap: 2, paddingLeft: 10}}>
                  <Text style={{color: ink, fontWeight: '600'}}>
                    {new Date(entry.time).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})} · {category}
                  </Text>
                  {entry.answers && answerSummary(entry.answers).map(([label, value]) => (
                    <Text key={label} style={{color: muted}}>{label} · {value}</Text>
                  ))}
                  {!!entry.note && <Text style={{color: muted}}>{entry.note}</Text>}
                </View>
              );
            })}
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
