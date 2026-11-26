import * as SQL from 'expo-sqlite';
import * as N from 'expo-notifications';
import {File,Paths} from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {Platform} from 'react-native';
import {Entry,day,backup} from './model';
const db=(async()=>{const d=await SQL.openDatabaseAsync('journal.db',{},Platform.OS==='ios'?Paths.document.uri.replace(/\/?$/, '/Journal'):undefined);await d.execAsync('CREATE TABLE IF NOT EXISTS entries(id TEXT PRIMARY KEY,day TEXT,time TEXT,category TEXT,note TEXT);CREATE TABLE IF NOT EXISTS settings(k TEXT PRIMARY KEY,v INTEGER)');const columns = await d.getAllAsync<{name:string}>('PRAGMA table_info(entries)');
if (!columns.some(column => column.name === 'answers')) {
  await d.execAsync('ALTER TABLE entries ADD COLUMN answers TEXT');
}
return d})();
export async function all(): Promise<Entry[]> {
  const rows = await (await db).getAllAsync<Omit<Entry, 'answers'> & {answers: string | null}>('SELECT * FROM entries ORDER BY time');
  return rows.map(({answers, ...entry}) => answers === null ? entry : {...entry, answers: JSON.parse(answers)});
}
export async function save(e:Entry){await (await db).runAsync('INSERT INTO entries (id,day,time,category,note,answers) VALUES (?,?,?,?,?,?)',e.id,e.day,e.time,e.category,e.note,e.answers ? JSON.stringify(e.answers) : null)}
export async function enabled(){return !!(await (await db).getFirstAsync<{v:number}>("SELECT v FROM settings WHERE k='reminder'"))?.v}
export async function toggle(v:boolean){if(v){if(Platform.OS==='android')await N.setNotificationChannelAsync('journal',{name:'Journal',importance:N.AndroidImportance.DEFAULT});v=(await N.requestPermissionsAsync()).granted}await (await db).runAsync("INSERT OR REPLACE INTO settings VALUES ('reminder',?)",Number(v));return v}
let queue=Promise.resolve();
export function sync(){queue=queue.catch(()=>{}).then(async()=>{const now=new Date(), dates=new Set((await all()).map(e=>e.day)),wanted=new Map<string,Date>();if(await enabled())for(let i=0;i<30;i++){const d=new Date(now);d.setDate(d.getDate()+i);d.setHours(20,0,0,0);if(d>now&&!dates.has(day(d)))wanted.set('journal-'+d.getTime(),d)}for(const item of await N.getAllScheduledNotificationsAsync()){if(item.identifier.startsWith('journal-')&&!wanted.delete(item.identifier))await N.cancelScheduledNotificationAsync(item.identifier)}for(const [identifier,date] of wanted)await N.scheduleNotificationAsync({identifier,content:{title:'Mon journal',body:'Comment vous sentez-vous aujourd’hui ?'},trigger:{type:N.SchedulableTriggerInputTypes.DATE,date,channelId:'journal'}})});return queue}
export async function download(){const f=new File(Paths.cache,'journal-'+day(new Date())+'.json');f.create({overwrite:true});f.write(backup(await all()));await Sharing.shareAsync(f.uri,{mimeType:'application/json'})}

