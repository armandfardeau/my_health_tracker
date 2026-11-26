import {View,Text,Switch,Platform,Linking} from 'react-native';
import {JournalPage,Button,blue,row,heading} from '../JournalUI';
import {useJournal} from '../JournalState';
import {toggle,sync,download} from '../platform';
import {useState} from 'react';
const playStoreUrl = 'https://play.google.com/store/apps/details?id=local.carnet.symptomes';

export default function Settings(){
 const {rem,setRem}=useJournal();
 const [message,msg]=useState('');
 return <JournalPage><Text style={heading}>Réglages</Text> <View style={{...row,alignItems:'center'}}><Switch trackColor={{false:"#A7B6C6",true:blue}} accessibilityLabel="Rappel à 20 h" value={rem} onValueChange={async v=>{try{const ok=await toggle(v);setRem(ok);await sync();if(v&&!ok)msg('Notifications désactivées dans les réglages du téléphone.')}catch{msg('Rappel indisponible.')}}}/><Text>Rappel à 20 h{Platform.OS==='web'?' · page ouverte':''}</Text></View>
 <Button label="Exporter la sauvegarde JSON" onPress={()=>download().catch(()=>msg('Export impossible. Réessayez.'))}/>
 {(Platform.OS === 'android' || Platform.OS === 'web') && (
   <Button label="Télécharger sur Google Play" onPress={() => {
     msg('');
     Linking.openURL(playStoreUrl).catch(() => msg('Impossible d’ouvrir Google Play. Réessayez.'));
   }}/>
 )}
 {!!message&&<Text accessibilityLiveRegion="polite">{message}</Text>}</JournalPage>
}
