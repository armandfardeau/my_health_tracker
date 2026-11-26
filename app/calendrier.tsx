import {useState} from 'react';
import {EntryForm} from '../EntryForm';
import {EntryReview} from '../EntryReview';
import {View,Text,Pressable} from 'react-native';
import {Smile,NotebookPen} from 'lucide-react-native';
import {JournalPage,Button,symptomIcons,blue,ink,muted,paper,green,row,heading} from '../JournalUI';
import {useJournal} from '../JournalState';
import {day} from '../model';
import {answerSummary} from '../symptoms';
export default function Calendar(){
 const {selected,select,entries,chosen,today}=useJournal();
 const [editing,setEditing]=useState<string|null>(null);
 function choose(date:Date){setEditing(null);select(date)}
 const y=selected.getFullYear(),m=selected.getMonth(),offset=(new Date(y,m,1).getDay()+6)%7, count=new Date(y,m+1,0).getDate();

 return <JournalPage> <Text style={heading}>Calendrier</Text><View style={{...row,justifyContent:'space-between',alignItems:'center'}}><Button label="‹" onPress={()=>choose(new Date(y,m-1,1))}/><Text style={{color:ink,fontSize:18}}>{selected.toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}</Text><Button label="›" onPress={()=>choose(new Date(y,m+1,1))}/></View>
 <View style={{flexDirection:'row',flexWrap:'wrap'}}>{['L','M','M','J','V','S','D'].map((v,i)=><Text key={'h'+i} style={{width:'14.28%',textAlign:'center',color:muted,paddingBottom:8}}>{v}</Text>)}{Array.from({length:offset+count},(_,i)=>{const n=i-offset+1,d=new Date(y,m,n),key=day(d),list=entries.filter(e=>e.day===key),symptoms=list.filter(e=>e.category);return n<1?<View key={i} style={{width:'14.28%'}}/>:<Pressable key={i} accessibilityRole="button" accessibilityLabel={[d.toLocaleDateString("fr-FR",{day:"numeric",month:"long"}),symptoms.length ? symptoms.length+" symptôme"+(symptoms.length>1?"s":"") : list.length?"Je vais bien":"Aucune entrée"].join(", ")} onPress={()=>choose(d)} style={{width:'14.28%',minHeight:50,alignItems:'center',padding:4,borderRadius:10,backgroundColor:key===chosen?'#CCDEEF':'transparent'}}><Text style={{color:ink}}>{n}</Text>{symptoms.length>0 ? (
   <View style={{width:'100%',flexDirection:'row',flexWrap:'wrap',justifyContent:'center',gap:3,marginTop:4}}>
     {symptoms.map(entry=><View key={entry.id} style={{width:5,height:5,borderRadius:3,backgroundColor:blue}}/>)}
   </View>
 ) :list.length>0?<Smile size={15} color={green}/>:null}</Pressable>})}</View>
 <Text style={heading}>{selected.toLocaleDateString('fr-FR',{day:'numeric',month:'long'})}</Text>
 {chosen<today && (editing===chosen
   ? <><EntryForm key={chosen} date={selected} onSaved={()=>setEditing(null)}/><Button label="Annuler" onPress={()=>setEditing(null)}/></>
   : <Button label="Ajouter un événement à cette date" active onPress={()=>setEditing(chosen)}/>)}
 {entries.filter(e=>e.day===chosen).sort((a,b)=>a.time.localeCompare(b.time)).map(e=>{const Icon=e.category?(symptomIcons[e.category]??NotebookPen):Smile;return <View key={e.id} style={{padding:12,backgroundColor:paper,borderWidth:1,borderColor:'#C8D6E5',borderRadius:12}}><View style={{flexDirection:'row',alignItems:'center',gap:7}}><Icon size={18} color={e.category?blue:green}/><Text style={{color:e.category?blue:green,fontWeight:'700'}}>{new Date(e.time).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})} · {e.answers && e.category === 'Digestif' ? 'Digestion' : e.answers && e.category === 'Autre' ? 'Symptôme' : e.category || 'Je vais bien'}</Text></View>{!!e.note&&<Text>{e.note}</Text>}{e.answers && answerSummary(e.answers).map(([label, value]) => <Text key={label} style={{color:ink}}><Text style={{fontWeight:'600'}}>{label} · </Text>{value}</Text>)}{e.category && <EntryReview entry={e} entries={entries}/>}</View>})}{!entries.some(e=>e.day===chosen)&&<Text>Aucune entrée ce jour.</Text>}
</JournalPage>
}


