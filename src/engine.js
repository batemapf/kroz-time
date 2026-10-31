import {createLevel, CHAPTERS, WIDTH, HEIGHT} from './levels.js';
export function newGame(){return {level:0,...createLevel(0),gems:40,whips:8,score:0,key:false,turn:0,phase:'title',message:'An ancient kingdom stirs. Your story starts here.',effect:null};}
export function start(game){game.phase='playing';game.message='The gate closes behind you. Find the golden key.';}
export function pause(game){if(game.phase==='playing')game.phase='paused';else if(game.phase==='paused')game.phase='playing';}
export function tile(game,x,y){return game.grid[y]?.[x]??'#';}
function award(game,points){game.score+=points;}
function hurt(game,n){game.gems=Math.max(0,game.gems-n);game.effect={type:'hurt',x:game.player.x,y:game.player.y};if(game.gems===0){game.phase='dead';game.message='Your last gem goes dark. The kingdom keeps its secrets.';}}
function finishTurn(game){
  game.turn++;
  if(game.phase!=='playing'||game.turn%2!==0)return;
  const survivors=[];
  for(const monster of game.monsters){
    if(game.phase!=='playing'){survivors.push(monster);continue;}
    const dx=game.player.x-monster.x,dy=game.player.y-monster.y;
    if(Math.abs(dx)+Math.abs(dy)>10){survivors.push(monster);continue;}
    let dirs=Math.abs(dx)>=Math.abs(dy)?[[Math.sign(dx),0],[0,Math.sign(dy)]]:[[0,Math.sign(dy)],[Math.sign(dx),0]];
    let hit=false;
    for(const [mx,my] of dirs){
      if(!mx&&!my)continue;
      const x=monster.x+mx,y=monster.y+my;
      if(x===game.player.x&&y===game.player.y){hurt(game,6);if(game.phase!=='dead')game.message='A creature strikes! −6 gems. Use your whip before it gets close.';hit=true;break;}
      if(tile(game,x,y)==='.'&&!game.monsters.some(m=>m!==monster&&m.x===x&&m.y===y)&&!survivors.some(m=>m.x===x&&m.y===y)){monster.x=x;monster.y=y;break;}
    }
    if(!hit)survivors.push(monster);
  }
  game.monsters=survivors;
}
export function move(game,dx,dy){
  if(game.phase!=='playing'||Math.abs(dx)+Math.abs(dy)!==1)return false;
  game.effect=null;
  const x=game.player.x+dx,y=game.player.y+dy,c=tile(game,x,y);
  if(c==='#'){game.message='Solid stone. Try another way.';return false;}
  if(c===':'){game.message='Crumbling stone. A crack of your whip will clear it.';return false;}
  if((c==='E'||c==='C')&&!game.key){game.message='Sealed by old magic. Find this chamber’s golden key.';return false;}
  if(c==='B'){
    const bx=x+dx,by=y+dy;
    if(tile(game,bx,by)!=='.'||game.monsters.some(m=>m.x===bx&&m.y===by)){game.message='The boulder will not budge. It needs empty ground behind it.';return false;}
    game.grid[by][bx]='B';game.grid[y][x]='.';game.message='Stone scrapes stone. A new path opens.';
  }
  game.player={x,y};
  const enemy=game.monsters.findIndex(m=>m.x===x&&m.y===y);
  if(enemy>=0){game.monsters.splice(enemy,1);hurt(game,6);if(game.phase!=='dead')game.message='You collide with a creature. −6 gems.';}
  if(c==='g'){game.gems=Math.min(60,game.gems+3);award(game,25);game.grid[y][x]='.';game.message='A little light in the dark. +3 gems, +25 score.';game.effect={type:'gem',x,y};}
  if(c==='w'){game.whips+=3;award(game,15);game.grid[y][x]='.';game.message='A fresh coil of leather. +3 whips.';}
  if(c==='+'){game.gems=Math.min(60,game.gems+12);game.grid[y][x]='.';game.message='An ancient elixir. +12 gems. Surprisingly refreshing.';}
  if(c==='k'){game.key=true;award(game,100);game.grid[y][x]='.';game.message='The golden key is yours. Find '+(game.level===4?'the crown!':'the stairs!');game.effect={type:'key',x,y};}
  if(c==='^'){hurt(game,4);if(game.phase!=='dead')game.message='A hidden spike catches you. −4 gems. Watch your step.';}
  if(c==='O'){
    for(let ry=0;ry<HEIGHT;ry++)for(let rx=0;rx<WIDTH;rx++)if(game.grid[ry][rx]==='O'&&(rx!==x||ry!==y))game.player={x:rx,y:ry};
    game.message='The air folds around you. Somewhere else, the same darkness.';game.effect={type:'portal',...game.player};
  }
  if(c==='E'){
    award(game,250);game.level++;Object.assign(game,createLevel(game.level));game.key=false;game.gems=Math.min(60,game.gems+8);game.whips+=2;
    game.turn++;game.message=`${CHAPTERS[game.level].name}. A moment to recover: +8 gems, +2 whips.`;game.effect={type:'level',...game.player};return true;
  }
  if(c==='C'){award(game,1000+game.gems*10);game.phase='won';game.message='The lost crown sees daylight again. The kingdom remembers your name.';game.turn++;return true;}
  finishTurn(game);return true;
}
export function whip(game){
  if(game.phase!=='playing')return false;
  if(game.whips<=0){game.message='Your last whip is gone. Look for a golden coil.';return false;}
  game.whips--;let hits=0;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const x=game.player.x+dx,y=game.player.y+dy;if(tile(game,x,y)===':'){game.grid[y][x]='.';award(game,10);hits++;}}
  game.monsters=game.monsters.filter(m=>{if(Math.max(Math.abs(m.x-game.player.x),Math.abs(m.y-game.player.y))<=1){award(game,50);hits++;return false;}return true;});
  game.message=hits?`CRACK! ${hits} obstacle${hits===1?'':'s'} cleared. Keep moving.`:'CRACK! Your whip cuts through empty air.';
  finishTurn(game);game.effect={type:'whip',...game.player};return true;
}
export function wait(game){if(game.phase!=='playing')return false;game.effect=null;game.message='You listen. Something listens back.';finishTurn(game);return true;}
