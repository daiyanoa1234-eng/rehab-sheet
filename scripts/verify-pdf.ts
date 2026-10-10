import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {performance} from 'node:perf_hooks';
import {PDFDocument} from 'pdf-lib';
import {createPdf} from '../src/pdf';
import type {Exercise} from '../src/model';
const root=new URL('../public/',import.meta.url);
globalThis.fetch=async(input:any)=>{try{const url=String(input);if(url.includes('missing'))return new Response('',{status:404});const bytes=await readFile(new URL(url.replace(/^\//,''),root));return new Response(bytes);}catch{return new Response('',{status:404});}};
const master:Exercise[]=JSON.parse(await readFile(new URL('exercises.json',root),'utf8'));
const out=new URL('../artifacts/',import.meta.url);await mkdir(out,{recursive:true});
const result=[];
for(let n=1;n<=4;n++){
 const selected=[master[0],master[5],master[13],master[15]].slice(0,n).map(e=>({...e,freeText:'痛みや疲れを確認しながら、自分のペースで行いましょう。'}));
 const start=performance.now();const bytes=await createPdf(selected);const ms=performance.now()-start;
 const doc=await PDFDocument.load(bytes);const size=doc.getPage(0).getSize();if(doc.getPageCount()!==1||Math.abs(size.width-595.2756)>.01||Math.abs(size.height-841.8898)>.01)throw new Error('A4 single-page assertion failed');
 await writeFile(new URL(`sample-${n}.pdf`,out),bytes);result.push({count:n,ms:Math.round(ms),bytes:bytes.length,pages:doc.getPageCount(),size});
}
const worst=Array.from({length:4},(_,i)=>({...master[15],id:'worst'+i,name:'運動名'.repeat(6)+'運動',reps:'回'.repeat(12),sets:'組'.repeat(12),frequency:'日'.repeat(12),notes:'注'.repeat(60),freeText:'文'.repeat(40)}));
await writeFile(new URL('maximum-text.pdf',out),await createPdf(worst));
await writeFile(new URL('missing-image.pdf',out),await createPdf([{...master[0],image:'missing.png'}]));
await writeFile(new URL('pdf-verification.json',out),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
