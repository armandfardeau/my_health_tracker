import {Entry,backup,day} from './model';
const db = new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('journal',1);r.onupgradeneeded=()=>r.result.createObjectStore('entries',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
export async function all():Promise<Entry[]>{const r=(await db).transaction('entries').objectStore('entries').getAll();return new Promise((ok,no)=>{r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
export async function save(e:Entry){const tx=(await db).transaction('entries','readwrite');tx.objectStore('entries').add(e);await new Promise<void>((ok,no)=>{tx.oncomplete=()=>ok();tx.onabort=()=>no(tx.error)})}
export async function enabled(){return localStorage.getItem('reminder')==='1'}
export async function toggle(v:boolean){localStorage.setItem('reminder',v?'1':'0');return v}
export async function sync(){}
export async function download(){const url=URL.createObjectURL(new Blob([backup(await all())],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='journal-'+day(new Date())+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
