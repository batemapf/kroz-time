import {WIDTH,HEIGHT} from './levels.js';
const S=24;
const sprites={
  player:['..aaaa..','..aaaa..','...bb...','.cccccc.','...cc...','..cccc..','..c..c..','.cc..cc.'],
  monster:['.a....a.','..aaaa..','.aaaaaa.','.abaaba.','..aaaa..','...aa...','..a..a..','.a....a.'],
  gem:['...aa...','..abba..','.abbbba.','abbbbbba','.abbbba.','..abba..','...aa...','........'],
  key:['.aaa....','ab.ba...','.aaa....','...a....','...aaaa.','...a.a..','........','........'],
  whip:['..aaaa..','.a....a.','.a..aaa.','..aa....','....a...','...a....','..a.....','.a......'],
  potion:['...aa...','...bb...','..abba..','.abbbba.','.abbbba.','.abbbba.','..aaaa..','........'],
  crown:['a..a..a.','aa.a.aa.','aaaaaaa.','.aaaaa..','.ababa..','.aaaaa..','........','........']
};
function sprite(ctx,name,x,y,a,b){const rows=sprites[name];for(let j=0;j<8;j++)for(let i=0;i<8;i++){const c=rows[j]?.[i];if(c==='a'||c==='b'){ctx.fillStyle=c==='a'?a:b;ctx.fillRect(x+4+i*2,y+4+j*2,2,2);}}}
export function render(ctx,g,time=0){
  ctx.fillStyle='#0b150f';ctx.fillRect(0,0,WIDTH*S,HEIGHT*S);
  for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
    const c=g.grid[y][x],px=x*S,py=y*S,noise=(x*17+y*31)%7;
    if(c==='#'){
      ctx.fillStyle=noise<3?'#334535':'#2b3c2d';ctx.fillRect(px+1,py+1,22,22);
      ctx.fillStyle='#42543b';ctx.fillRect(px+2,py+2,20,2);ctx.fillRect(px+2,py+3,2,7);
      ctx.fillStyle='#192a21';ctx.fillRect(px+2,py+12,20,2);ctx.fillRect(px+11,py+3,2,8);ctx.fillRect(px+6,py+14,2,8);
      if(noise===1){ctx.fillStyle='#6b7945';ctx.fillRect(px+16,py+5,4,3);}
      continue;
    }
    if(noise<2){ctx.fillStyle='#1b2a1e';ctx.fillRect(px+7+noise*5,py+14,2,2);}
    if(c===':'){ctx.fillStyle='#726346';for(let j=0;j<3;j++)for(let i=0;i<3;i++){ctx.fillRect(px+3+i*7+(j%2),py+3+j*7,5,5);}ctx.fillStyle='#a6905a';ctx.fillRect(px+4,py+4,3,2);}
    if(c==='g')sprite(ctx,'gem',px,py,'#69bbb2','#abe1cb');
    if(c==='k')sprite(ctx,'key',px,py,'#efc76d','#fff2bb');
    if(c==='w')sprite(ctx,'whip',px,py,'#d6a663','#f1ca91');
    if(c==='+')sprite(ctx,'potion',px,py,'#639e7a','#a3d79a');
    if(c==='C')sprite(ctx,'crown',px,py,'#efc76d','#f5f0c0');
    if(c==='E'){ctx.fillStyle='#9ead80';for(let i=0;i<4;i++)ctx.fillRect(px+4+i*4,py+4+i*4,16-i*4,3);ctx.fillStyle='#d7daa9';ctx.fillRect(px+4,py+4,2,15);}
    if(c==='B'){ctx.fillStyle='#84917b';ctx.fillRect(px+5,py+3,14,18);ctx.fillRect(px+3,py+6,18,12);ctx.fillStyle='#a3ad93';ctx.fillRect(px+6,py+5,10,3);ctx.fillStyle='#4c5b49';ctx.fillRect(px+12,py+16,6,3);}
    if(c==='^'){ctx.fillStyle='#b77364';for(let i=0;i<3;i++){ctx.fillRect(px+3+i*7,py+14,5,4);ctx.fillRect(px+5+i*7,py+9,1,5);}}
    if(c==='O'){ctx.strokeStyle='#aa8bd3';ctx.lineWidth=2;ctx.strokeRect(px+5,py+5,14,14);ctx.strokeRect(px+9,py+9,6,6);ctx.fillStyle='#665286';ctx.fillRect(px+11,py+1,2,3);ctx.fillRect(px+11,py+20,2,3);}
  }
  for(const m of g.monsters)sprite(ctx,'monster',m.x*S,m.y*S,'#cf7668','#fff0c6');
  ctx.fillStyle='#edcf6925';ctx.fillRect(g.player.x*S,g.player.y*S,S,S);
  sprite(ctx,'player',g.player.x*S,g.player.y*S,'#f1c66a','#f4e4b4');
  if(g.effect&&time){const e=g.effect;ctx.strokeStyle=e.type==='hurt'?'#df8876':e.type==='whip'?'#f4e4b4':'#edd171';ctx.lineWidth=2;const r=e.type==='whip'?1:0;ctx.strokeRect((e.x-r)*S+2,(e.y-r)*S+2,(r*2+1)*S-4,(r*2+1)*S-4);}
}
