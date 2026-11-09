import { expect, test } from '@playwright/test';
import { wrapText } from '../src/game/TextWrap';

test('paper text wraps words and remains readable in both languages',()=>{
 const measure=(value:string)=>Array.from(value).length;
 expect(wrapText('How can we see a distant place without going there ourselves?',18,measure,'en')).toEqual(['How can we see a','distant place','without going','there ourselves?']);
 expect(wrapText('一起探索月球基地',4,measure,'zh')).toEqual(['一起探索','月球基地']);
 expect(wrapText('extraordinarily',5,measure,'en')).toEqual(['extra','ordin','arily']);
});
