/* Original pixel scenery, drawn locally: no image downloads or asset licenses. */
function drawWorld(chapter, solved = false) {
 const canvas=document.getElementById('world'),ctx=canvas.getContext('2d');
 const css=getComputedStyle(document.body),p=['--paper','--wash','--mid','--ink'].map(v=>css.getPropertyValue(v).trim());
 const r=(x,y,w,h,c)=>{ctx.fillStyle=p[c];ctx.fillRect(x,y,w,h);};
 ctx.imageSmoothingEnabled=false;r(0,0,320,112,0);
 const cloud=(x,y)=>{r(x,y,20,4,1);r(x+5,y-4,10,4,1);};
 cloud(178,12);cloud(225,22);cloud(292,10);
 // Distant hills, a river, and a cobblestone path.
 for(let x=0;x<320;x+=8){const h=10+Math.round(Math.sin(x*.06)*5);r(x,66-h,8,h,1);}
 r(0,65,320,47,1);r(0,88,320,13,0);
 for(let x=0;x<320;x+=12){r(x,91+(x%3)*2,5,1,2);r(x+3,97,3,1,2);}
 const tree=(x,y)=>{r(x+7,y+15,4,13,3);r(x+3,y+4,12,16,3);r(x,y+8,18,8,3);r(x+4,y+3,10,12,2);r(x+7,y,4,3,2);r(x+3,y+8,3,3,1);};
 const house=(x,y,w,label)=>{r(x,y,w,31,2);r(x+3,y+3,w-6,28,0);r(x-3,y-3,w+6,5,3);r(x+1,y-7,w-2,4,2);r(x+5,y-10,w-10,3,3);r(x+w-13,y-18,5,10,3);r(x+7,y+7,8,9,3);r(x+8,y+8,6,3,1);r(x+w-15,y+7,8,9,3);r(x+w-14,y+8,6,3,1);r(x+w/2-4,y+16,9,15,3);r(x+w/2+1,y+23,2,2,0);ctx.fillStyle=p[3];ctx.font='5px monospace';ctx.fillText(label,x+4,y+28);};
 const person=(x,y,flip=false)=>{r(x+3,y,7,3,3);r(x+1,y+3,11,6,3);r(x+3,y+4,7,6,0);r(x+(flip?3:8),y+5,2,2,3);r(x+2,y+10,9,8,2);r(x,y+11,2,5,3);r(x+11,y+11,2,5,3);r(x+3,y+18,3,4,3);r(x+8,y+18,3,4,3);};
 if(chapter===0){house(225,44,54,'SCHOOL');tree(199,53);tree(288,56);r(175,76,14,3,3);r(178,79,2,7,3);r(186,79,2,7,3);}
 if(chapter===1){house(228,42,58,'PARTY');for(let i=0;i<8;i++){r(192+i*14,37+(i%2)*3,3,4,3);}tree(297,56);}
 if(chapter===2){r(200,34,105,51,2);r(204,38,97,42,0);r(210,44,19,18,3);r(212,46,15,14,1);r(260,71,36,4,3);r(263,75,3,12,3);r(289,75,3,12,3);r(245,80,13,3,3);r(245,71,12,9,3);r(247,73,8,5,1);r(249,74,2,3,3);}
 if(chapter===3){tree(292,48);house(235,43,45,'CLUB');r(207,72,10,14,3);r(209,74,6,8,0);r(211,76,2,4,2);}
 if(chapter>=4){tree(218,48);tree(281,42);r(242,74,31,3,3);r(242,68,31,4,2);r(245,77,3,9,3);r(267,77,3,9,3);}
 for(let i=0;i<20;i++){let x=(i*43)%320,y=103+(i%3)*3;r(x,y,1,3,2);r(x-1,y,3,1,2);}
 person(179,70);person(chapter>=4?255:199,71,true);
 if(solved){ctx.fillStyle=p[3];ctx.font='bold 9px monospace';ctx.fillText('♪',179,65);for(let i=0;i<3;i++){r(160+i*24,55-i%2*8,3,3,3);r(161+i*24,54-i%2*8,1,5,3);}}
 canvas.setAttribute('aria-label',['School and friends in a pixel town','A secret house party','A broken laptop at the party','Finding video evidence','Friends reunited in the park'][Math.min(chapter,4)]);
}
