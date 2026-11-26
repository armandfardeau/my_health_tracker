import type { SymptomAnswers } from './symptoms';

export type Entry = {id:string; day:string; time:string; category:string|null; note:string; answers?:SymptomAnswers};
export function day(d:Date){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
export function backup(entries:Entry[]){return JSON.stringify({version:1,entries:entries.map(e=>({...e,type:e.category?'symptome':'bien'}))},null,2)}
