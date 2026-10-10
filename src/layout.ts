import type {Exercise} from './model';
export const PAGE={width:595.2756,height:841.8898,margin:28.3465};
export type Shape=
 |{type:'text';x:number;y:number;text:string;size:number;color:string}
 |{type:'rect';x:number;y:number;width:number;height:number;fill:string;stroke?:string}
 |{type:'line';x:number;y:number;x2:number;y2:number;color:string}
 |{type:'image';x:number;y:number;width:number;height:number;src:string;name:string};
export type Measure=(text:string,size:number)=>number;
export function wrap(text:string,width:number,size:number,measure:Measure):string[]{
 if(!text)return [];
 const lines:string[]=[];let line='';
 for(const c of Array.from(text)){
  if(line&&measure(line+c,size)>width){lines.push(line);line=c;}else line+=c;
 }
 if(line)lines.push(line);return lines;
}
export function makeScene(exercises:Exercise[],measure:Measure):Shape[]{
 if(exercises.length>4)throw new Error('運動は最大4つです。');
 const s:Shape[]=[];const ink='#203334',muted='#536365',border='#657578',light='#f1f4f3';
 const rect=(x:number,y:number,w:number,h:number,fill:string,stroke?:string)=>s.push({type:'rect',x,y,width:w,height:h,fill,stroke});
 const text=(t:string,x:number,y:number,size:number,color=ink)=>s.push({type:'text',text:t,x,y,size,color});
 const line=(x:number,y:number,x2:number,y2:number,color=border)=>s.push({type:'line',x,y,x2,y2,color});
 const block=(t:string,x:number,y:number,w:number,size:number)=>{const lines=wrap(t,w,size,measure);lines.forEach((v,i)=>text(v,x,y+i*size*1.4,size));return lines.length*size*1.4;};
 const m=PAGE.margin,w=PAGE.width-m*2;
 text('わたしの自主トレ',m,m+23,23);
 text('氏名',m+w-225,m+19,12);line(m+w-188,m+27,m+w-22,m+27);text('様',m+w-15,m+19,12);
 text('無理のない範囲で、ひとつずつ続けましょう。',m,m+46,10.5,muted);
 line(m,m+58,m+w,m+58);
 const top=m+72,areaH=PAGE.height-m-100-top,gap=10;
 const n=exercises.length,cols=n===4?2:1,rows=n===4?2:Math.max(1,n);
 const cw=(w-gap*(cols-1))/cols,ch=(areaH-gap*(rows-1))/rows;
 exercises.forEach((e,i)=>{
  const x=m+(i%cols)*(cw+gap),y=top+Math.floor(i/cols)*(ch+gap),pad=12;
  rect(x,y,cw,ch,'#ffffff',border);
  rect(x+pad,y+pad,22,22,light);text(String(i+1),x+pad+7,y+pad+16,12);
  const titleH=block(e.name,x+pad+31,y+pad+16,cw-pad*2-31,14);
  const bodyTop=y+pad+Math.max(22,titleH)+9;
  let tx=x+pad,ty=bodyTop,tw=cw-2*pad;
  if(cols===2){
   const textHeight=wrap(`${e.reps}  /  ${e.sets}`,tw,12,measure).length*16.8+wrap(e.frequency,tw,12,measure).length*16.8+5+wrap(e.notes,tw,10.5,measure).length*14.7+(e.freeText?wrap(e.freeText,tw,10.5,measure).length*14.7+5:0);
   const imageSize=Math.min(146,Math.max(86,ch-(bodyTop-y)-textHeight-pad-6));
   s.push({type:'image',x:x+(cw-imageSize)/2,y:bodyTop,width:imageSize,height:imageSize,src:e.image,name:e.name});
   ty=bodyTop+imageSize+6;
  }else{
   const imageSize=Math.min(n===1?260:n===2?190:145,ch-60);
   s.push({type:'image',x:x+pad,y:bodyTop,width:imageSize,height:imageSize,src:e.image,name:e.name});
   tx=x+pad+imageSize+18;tw=cw-(tx-x)-pad;
   if(n===1)ty+=55;else if(n===2)ty+=10;
  }
  ty+=block(`${e.reps}  /  ${e.sets}`,tx,ty+12,tw,12);
  ty+=block(e.frequency,tx,ty+12,tw,12)+5;
  ty+=block(e.notes,tx,ty+10.5,tw,10.5);
  if(e.freeText)ty+=block(e.freeText,tx,ty+15.5,tw,10.5)+5;
  if(ty>y+ch-pad+1)throw new Error(`${e.name}の文章が枠に収まりません。文字数を減らしてください。`);
 });
 const fy=PAGE.height-m-92;
 text('1か月の実施チェック',m,fy+12,12);
 text('できた日にチェックをつけましょう',m+175,fy+12,10.5,muted);
 // 31 equal-sized daily cells, across two rows (16 + 15).
 const cell=w/16;
 for(let d=1;d<=31;d++){
  const cx=m+((d-1)%16)*cell,cy=fy+22+Math.floor((d-1)/16)*27;
  rect(cx,cy,cell,27,'#ffffff',border);text(String(d),cx+4,cy+11,8.5);
 }
 text('※ 氏名は印刷後に手書きしてください。',m,PAGE.height-m-2,9,muted);
 return s;
}
