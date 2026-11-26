import React,{createContext,useContext,useEffect,useState,useRef} from 'react';
import {AppState,Platform} from 'react-native';
import {all,save,enabled,sync} from './platform';
import {Entry,day} from './model';
import type {SymptomAnswers} from './symptoms';
function useJournalState(){
 const [entries,setEntries]=useState<Entry[]>([]),[clock,setClock]=useState(new Date()),[selected,select]=useState(new Date()),[rem,setRem]=useState(false),[message,msg]=useState('');
 const busy=useRef(false), today=day(clock), chosen=day(selected);
 async function refresh(){try{setClock(new Date());setEntries(await all());setRem(await enabled());await sync()}catch{msg('Le journal local est inaccessible. Réessayez.')}} 
 useEffect(()=>{void refresh();const timer=setInterval(()=>setClock(new Date()),15000);const sub=AppState.addEventListener('change',s=>{if(s==='active')void refresh()});const visible=()=>{if(document.visibilityState==='visible')void refresh()};if(Platform.OS==='web')document.addEventListener('visibilitychange',visible);return()=>{clearInterval(timer);sub.remove();if(Platform.OS==='web')document.removeEventListener('visibilitychange',visible)}},[]);
 async function record(category:string|null,note:string,when:Date,answers?:SymptomAnswers){
   if(busy.current || !Number.isFinite(when.getTime()) || when.getTime()>Date.now()) return false;
   busy.current=true;
   try{
     await save({id:Date.now()+'-'+Math.random().toString(36).slice(2),day:day(when),time:when.toISOString(),category,note,...(answers && {answers})});
     select(when);msg('Entrée enregistrée.');await refresh();return true;
   }catch{return false}finally{busy.current=false}
 }
 return {entries,clock,selected,select,rem,setRem,message,msg,today,chosen,record};
}
const JournalContext=createContext<ReturnType<typeof useJournalState>|null>(null);
export function JournalProvider({children}:React.PropsWithChildren){
 const journal=useJournalState();
 return <JournalContext.Provider value={journal}>{children}</JournalContext.Provider>
}
export function useJournal(){
 const journal=useContext(JournalContext);
 if(!journal) throw new Error('JournalProvider manquant');
 return journal;
}

