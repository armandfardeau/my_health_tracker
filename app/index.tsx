import {View,Text,Platform,TextInput} from 'react-native';
import {EntryForm} from '../EntryForm';
import {JournalPage,Button,SymptomCarousel,symptomIcons,blue,ink,muted,paper,row,heading} from '../JournalUI';
import {useJournal} from '../JournalState';
export default function Today(){
 const {entries,clock,rem,message,today}=useJournal();
 return <JournalPage> <Text style={{color:blue,fontWeight:'700'}}>MON JOURNAL</Text><Text style={{...heading,fontSize:34}}>Comment vous sentez-vous aujourd’hui ?</Text>
 {Platform.OS==='web'&&rem&&clock.getHours()>=20&&!entries.some(e=>e.day===today)&&<Text>Votre rappel du soir · Prenez un instant pour noter votre ressenti.</Text>}
 <EntryForm/>
 {!!message&&<Text accessibilityLiveRegion="polite">{message}</Text>}
</JournalPage>
}

