import { wrapText } from './TextWrap';
export type TextParagraph={text:string;size?:number;bold?:boolean;color?:string};
/** Independent readable text layout. Backing resolution is capped independently of WebGL DPR. */
export class TextSystem {
 private value=1;
 private readonly listeners=new Set<()=>void>();
 get scale(){return this.value;}
 setScale(value:number){const next=Math.max(1,Math.min(2,value));if(next===this.value)return;this.value=next;for(const listener of this.listeners)listener();}
 subscribe(listener:()=>void){this.listeners.add(listener);return()=>this.listeners.delete(listener);}
 draw(canvas:HTMLCanvasElement,paragraphs:TextParagraph[],language:'zh'|'en',width=640){
  const context=canvas.getContext('2d')!;const padding=24;const rows:{text:string;y:number;size:number;bold:boolean;color:string}[]=[];let y=padding;
  for(const paragraph of paragraphs){const size=(paragraph.size??22)*this.value;const bold=paragraph.bold??false;context.font=`${bold?'bold ':''}${size}px Arial`;const lines=wrapText(paragraph.text,width-padding*2,text=>context.measureText(text).width,language);for(const text of lines){y+=size*1.35;rows.push({text,y,size,bold,color:paragraph.color??'#eef3f6'});}y+=12;}
  const height=Math.ceil(y+padding),dpr=Math.min(2,Math.max(1,globalThis.devicePixelRatio||1));canvas.width=Math.ceil(width*dpr);canvas.height=Math.ceil(height*dpr);context.setTransform(dpr,0,0,dpr,0,0);context.fillStyle='#132b3c';context.fillRect(0,0,width,height);
  for(const row of rows){context.fillStyle=row.color;context.font=`${row.bold?'bold ':''}${row.size}px Arial`;context.fillText(row.text,padding,row.y);}
  return{width,height,rows:rows.length};
 }
}
export const textSystem=new TextSystem();
