import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,start,move,whip,wait,pause,tile} from '../src/engine.js';
import {createLevel,WIDTH,HEIGHT} from '../src/levels.js';
function arena(){const g=newGame();start(g);g.monsters=[];g.grid=Array.from({length:HEIGHT},(_,y)=>Array.from({length:WIDTH},(_,x)=>!x||!y||x===WIDTH-1||y===HEIGHT-1?'#':'.'));g.player={x:5,y:5};return g;}
test('title and pause freeze the simulation; blocked moves do not cost turns',()=>{const g=newGame();assert.equal(move(g,1,0),false);start(g);pause(g);assert.equal(wait(g),false);pause(g);g.player={x:1,y:1};assert.equal(move(g,-1,0),false);assert.equal(g.turn,0);});
test('gems heal with a cap, supplies replenish and keys unlock exits',()=>{const g=arena();g.gems=59;g.grid[5][6]='g';move(g,1,0);assert.equal(g.gems,60);assert.equal(g.score,25);g.grid[5][7]='w';move(g,1,0);assert.equal(g.whips,11);g.grid[5][8]='E';assert.equal(move(g,1,0),false);g.grid[6][7]='k';move(g,0,1);assert.ok(g.key);move(g,0,-1);move(g,1,0);assert.equal(g.level,1);assert.equal(g.key,false);assert.equal(g.whips,13);});
test('whip clears all eight neighboring cells but not distant enemies',()=>{const g=arena();g.grid[4][4]=':';g.grid[6][6]=':';g.monsters=[{x:4,y:5,id:1},{x:6,y:6,id:2},{x:9,y:5,id:3}];whip(g);assert.equal(g.whips,7);assert.equal(tile(g,4,4),'.');assert.equal(tile(g,6,6),'.');assert.equal(g.monsters.length,1);assert.equal(g.score,120);assert.equal(g.turn,1);});
test('zero whips does not advance time',()=>{const g=arena();g.whips=0;assert.equal(whip(g),false);assert.equal(g.turn,0);});
test('monsters move every second turn and collisions drain life',()=>{const g=arena();g.monsters=[{x:7,y:5,id:1}];wait(g);assert.equal(g.monsters[0].x,7);wait(g);assert.equal(g.monsters[0].x,6);wait(g);wait(g);assert.equal(g.gems,34);assert.equal(g.monsters.length,0);});
test('traps can kill; terminal states reject further actions',()=>{const g=arena();g.gems=4;g.grid[5][6]='^';move(g,1,0);assert.equal(g.phase,'dead');assert.equal(g.gems,0);const turn=g.turn;move(g,1,0);whip(g);wait(g);assert.equal(g.turn,turn);});
test('boulders push into empty floor and stop at occupied cells',()=>{const g=arena();g.grid[5][6]='B';move(g,1,0);assert.equal(tile(g,7,5),'B');assert.equal(g.player.x,6);g.grid[5][8]='g';assert.equal(move(g,1,0),false);assert.equal(tile(g,8,5),'g');});
test('runes teleport exactly once per entry',()=>{const g=arena();g.grid[5][6]='O';g.grid[10][20]='O';move(g,1,0);assert.deepEqual(g.player,{x:20,y:10});assert.equal(g.turn,1);move(g,1,0);move(g,-1,0);assert.deepEqual(g.player,{x:6,y:5});});
test('crown requires key and awards the victory bonus once',()=>{const g=arena();g.grid[5][6]='C';assert.equal(move(g,1,0),false);g.key=true;move(g,1,0);assert.equal(g.phase,'won');assert.equal(g.score,1400);move(g,1,0);assert.equal(g.score,1400);});
function route(g,target){
  const q=[{...g.player,path:[]}],seen=new Set([`${g.player.x},${g.player.y}`]);
  while(q.length){const p=q.shift();for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){let x=p.x+dx,y=p.y+dy;const c=tile(g,x,y);if(['#',':','B'].includes(c)||((c==='E'||c==='C')&&!g.key))continue;const path=[...p.path,[dx,dy]];if(c===target)return path;if(c==='O'){for(let ry=0;ry<HEIGHT;ry++)for(let rx=0;rx<WIDTH;rx++)if(tile(g,rx,ry)==='O'&&(rx!==x||ry!==y)){x=rx;y=ry;ry=HEIGHT;break;}}
    const id=`${x},${y}`;if(!seen.has(id)){seen.add(id);q.push({x,y,path});}
  }}return null;
}
test('all five generated chambers have valid bounds, paired runes and reachable keys/exits',()=>{for(let i=0;i<5;i++){const level=createLevel(i);assert.equal(level.grid.length,HEIGHT);assert.ok(level.grid.every(r=>r.length===WIDTH));assert.equal(level.grid.flat().filter(c=>c==='k').length,1);const g={...newGame(),...level,level:i};assert.ok(route(g,'k'),`key ${i}`);g.key=true;assert.ok(route(g,i===4?'C':'E'),`exit ${i}`);assert.equal(g.grid.flat().filter(c=>c==='O').length,i===2?2:0);}});
test('complete campaign can be won with real movement, resources and active enemies',()=>{
  const g=newGame();start(g);
  for(let i=0;i<5;i++){
    assert.equal(g.level,i);
    for(const target of ['k',i===4?'C':'E']){
      const path=route(g,target);assert.ok(path,`route to ${target} in chamber ${i+1}`);
      for(const [dx,dy] of path){
        if(g.monsters.some(m=>Math.max(Math.abs(m.x-g.player.x),Math.abs(m.y-g.player.y))<=1)&&g.whips>0)whip(g);
        assert.ok(move(g,dx,dy),`move chamber ${i+1}, ${g.message}`);assert.notEqual(g.phase,'dead',`died in chamber ${i+1}`);
      }
    }
  }
  assert.equal(g.phase,'won');assert.ok(g.score>=2250);assert.ok(g.gems>0);
});
