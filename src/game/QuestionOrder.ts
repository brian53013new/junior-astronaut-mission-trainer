/** Stable per question: ordering changes presentation, never the stored answer IDs. */
export function questionOrder(id:string):readonly [number,number,number]{const options:readonly (readonly [number,number,number])[]=[[0,1,2],[1,0,2],[2,1,0],[1,2,0],[2,0,1],[0,2,1]];let n=0;for(const c of id)n=(n*31+c.charCodeAt(0))>>>0;return options[n%options.length];}
