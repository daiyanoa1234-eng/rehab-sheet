export interface Exercise { id:string; name:string; category:string; posture?:string; image:string; reps:string; sets:string; frequency:string; notes:string; freeText:string }
export const limits={reps:12,sets:12,frequency:12,notes:60,freeText:40} as const;
export type Field=keyof typeof limits;
export const fields:Field[]=['reps','sets','frequency','notes','freeText'];
export const labels:Record<Field,string>={reps:'回数・保持時間',sets:'セット数',frequency:'頻度',notes:'注意点',freeText:'自由記述'};
export const STORAGE_KEY='rehab-sheet.defaults.v1';
export const count=(s:string)=>Array.from(s).length;
export const clean=(s:string,max:number)=>Array.from(s.replace(/[\r\n\t]/g,' ').replace(/[\u0000-\u001f\u007f]/g,'')).slice(0,max).join('');
export function validateBackup(input:unknown,master:Exercise[]):Exercise[]{
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('標準値のJSONファイルを選んでください。');
 const data=input as {version:unknown;exercises:unknown};
 if(data.version!==1||!Array.isArray(data.exercises)||data.exercises.length!==master.length)throw new Error('ファイルのバージョン、または運動の数が一致しません。');
 const seen=new Set<string>();const map=new Map(master.map(e=>[e.id,e]));
 const result=data.exercises.map((row:unknown)=>{
  if(!row||typeof row!=='object'||Array.isArray(row))throw new Error('運動データの形式が正しくありません。');
  const e=row as Record<string,unknown>;
  if(typeof e.id!=='string'||!map.has(e.id)||seen.has(e.id))throw new Error('運動IDが不明、または重複しています。');
  seen.add(e.id);
  for(const f of fields){if(typeof e[f]!=='string'||count(e[f] as string)>limits[f]||/[\u0000-\u001f\u007f]/.test(e[f] as string))throw new Error(`${labels[f]}の文字数、または形式が正しくありません。`);}
  const base=map.get(e.id)!;
  // Restore editable defaults only. Imported names and paths never override bundled assets.
  return {...base,...Object.fromEntries(fields.map(f=>[f,e[f]]))} as Exercise;
 });
 return master.map(e=>result.find(r=>r.id===e.id)!);
}
export function selectExercise(selected:Exercise[],e:Exercise):Exercise[]{
 if(selected.some(x=>x.id===e.id))return selected.filter(x=>x.id!==e.id);
 if(selected.length>=4)throw new Error('運動は最大4つまで選べます。');
 return [...selected,{...e}];
}
export function moveExercise(selected:Exercise[],index:number,direction:number){
 const next=[...selected];const target=index+direction;if(target<0||target>=next.length)return next;
 [next[index],next[target]]=[next[target],next[index]];return next;
}
