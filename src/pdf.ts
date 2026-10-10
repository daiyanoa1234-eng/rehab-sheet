import {PDFDocument,rgb,type PDFFont} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {createFont} from 'fonteditor-core';
import {makeScene,PAGE,type Measure} from './layout';
import type {Exercise} from './model';
let fontBytes:Promise<ArrayBuffer>|undefined;
export const asset=(path:string)=>`${import.meta.env?.BASE_URL ?? '/'}${path}`;
export function preloadFont(){fontBytes??=fetch(asset('fonts/NotoSansJP-Regular.ttf')).then(r=>{if(!r.ok)throw new Error('日本語フォントを読み込めませんでした。再読み込みしてください。');return r.arrayBuffer();});return fontBytes;}
let fontObject:any;
export async function getMeasure():Promise<Measure>{const bytes=await preloadFont();fontObject??=fontkit.create(new Uint8Array(bytes));return (t,size)=>fontObject.layout(t).glyphs.reduce((total:number,g:any)=>total+g.advanceWidth,0)/fontObject.unitsPerEm*size;}
const color=(hex:string)=>rgb(parseInt(hex.slice(1,3),16)/255,parseInt(hex.slice(3,5),16)/255,parseInt(hex.slice(5,7),16)/255);
export async function createPdf(exercises:Exercise[]){
 if(exercises.length<1||exercises.length>4)throw new Error('運動を1〜4つ選んでください。');
 const doc=await PDFDocument.create();doc.registerFontkit(fontkit);
 const measure=await getMeasure();
 const scene=makeScene(exercises,measure),page=doc.addPage([PAGE.width,PAGE.height]);
 const text=scene.map(el=>el.type==='text'?el.text:el.type==='image'?el.name:'').join('');
 const codePoints=[...new Set(Array.from(text,c=>c.codePointAt(0)!))];
 if(codePoints.some(c=>!fontObject.hasGlyphForCodePoint(c)))throw new Error('入力に日本語フォントで表示できない文字があります。絵文字などを除いてください。');
 // Build a complete small TTF first: fontkit's CJK subset writer drops some glyphs.
 const smallFont=createFont(await preloadFont(),{type:'ttf',subset:codePoints,compound2simple:true});
 const subset=smallFont.write({type:'ttf',hinting:false}) as ArrayBuffer;
 const font:PDFFont=await doc.embedFont(subset,{subset:false});
 const imgs=new Map<string,Awaited<ReturnType<typeof doc.embedPng>>|null>();
 await Promise.all(exercises.map(async e=>{try{const r=await fetch(asset(e.image));if(!r.ok)throw new Error();imgs.set(e.image,await doc.embedPng(await r.arrayBuffer()));}catch{imgs.set(e.image,null);}}));
 const supported=new Set(font.getCharacterSet());
 for(const el of scene){
  switch(el.type){
   case 'text':
    if(Array.from(el.text).some(c=>!supported.has(c.codePointAt(0)!)))throw new Error('入力に日本語フォントで表示できない文字があります。絵文字などを除いてください。');
    page.drawText(el.text,{x:el.x,y:PAGE.height-el.y,size:el.size,font,color:color(el.color)});break;
   case 'rect':page.drawRectangle({x:el.x,y:PAGE.height-el.y-el.height,width:el.width,height:el.height,color:color(el.fill),borderWidth:el.stroke?0.6:0,borderColor:el.stroke?color(el.stroke):undefined});break;
   case 'line':page.drawLine({start:{x:el.x,y:PAGE.height-el.y},end:{x:el.x2,y:PAGE.height-el.y2},thickness:0.6,color:color(el.color)});break;
   case 'image':{
    const img=imgs.get(el.src);if(img)page.drawImage(img,{x:el.x,y:PAGE.height-el.y-el.height,width:el.width,height:el.height});
    else{page.drawRectangle({x:el.x,y:PAGE.height-el.y-el.height,width:el.width,height:el.height,color:rgb(.94,.94,.94)});page.drawText(el.name,{x:el.x+4,y:PAGE.height-el.y-el.height/2,font,size:8,color:rgb(.3,.3,.3)});}break;
   }
  }
 }
 doc.setTitle('リハビリ自主トレシート');doc.setCreator('自主トレシート作成アプリ');
 return doc.save();
}
export function download(blob:Blob,name:string){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
