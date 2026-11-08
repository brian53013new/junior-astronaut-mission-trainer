/** Wrap text without splitting ordinary English words; CJK remains breakable per character. */
export function wrapText(text:string,maxWidth:number,measure:(text:string)=>number,language:'zh'|'en'):string[]{
 const tokens=language==='zh'?Array.from(text):text.match(/\S+\s*|\s+/gu)??[];
 const rows:string[]=[];let row='';
 for(const token of tokens){
  const candidate=row+token;
  if(row.trim()&&measure(candidate.trimEnd())>maxWidth){rows.push(row.trimEnd());row=token.trimStart();}
  else row=candidate;
  if(measure(row.trimEnd())>maxWidth){
   let part='';for(const ch of row){if(part&&measure(part+ch)>maxWidth){rows.push(part.trimEnd());part=ch;}else part+=ch;}row=part;
  }
 }
 if(row.trim())rows.push(row.trimEnd());
 return rows;
}
