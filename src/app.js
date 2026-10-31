import {newGame,start,pause,move,whip,wait} from './engine.js';
import {render} from './render.js';
const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d');
let game=newGame(),sound=false,audio,best=0,lastAction=0,effectTimer,guidePaused=false;
try{best=Number(localStorage.getItem('kroz-best'))||0;}catch{}
const pad=(n,length=6)=>String(n).padStart(length,'0');
function beep(type){if(!sound)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),v=audio.createGain();o.type='square';o.frequency.setValueAtTime(type==='hurt'?110:type==='whip'?220:660,audio.currentTime);o.frequency.exponentialRampToValueAtTime(type==='hurt'?55:330,audio.currentTime+.12);v.gain.setValueAtTime(.035,audio.currentTime);v.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.14);o.connect(v);v.connect(audio.destination);o.start();o.stop(audio.currentTime+.15);}catch{}}
function update(){
  if(game.score>best){best=game.score;try{localStorage.setItem('kroz-best',String(best));}catch{}}
  $('gems').textContent=game.gems;$('whips').textContent=game.whips;$('score').textContent=pad(game.score);$('best').textContent=pad(best);
  $('health-fill').style.width=(game.gems/60*100)+'%';$('health-fill').style.background=game.gems<12?'#cf7668':'#a7d9ad';
  $('key').textContent=game.key?'FOUND':'NOT FOUND';$('key').style.color=game.key?'#eab85f':'';
  $('level-number').textContent=`CHAMBER ${pad(game.level+1,2)} / 05`;$('level-name').textContent=game.name;$('level-description').textContent=game.description;
  $('objective').textContent=game.key?(game.level===4?'Claim the crown in the heart of the chamber.':'The stairs are unlocked. Find your way down.'):game.hint;
  $('message').textContent=game.message;$('turns').textContent='TURN '+pad(game.turn,3);$('pause').textContent=game.phase==='paused'?'▶ RESUME':'Ⅱ PAUSE';
  const overlay=$('overlay');overlay.hidden=game.phase==='playing';
  const states={title:['THE EXPEDITION AWAITS','Some treasures<br>should stay buried.','Five chambers stand between you and the lost crown.<br>Find the key. Reach the stairs. Keep your gems close.','ENTER THE KINGDOM ↗'],paused:['A MOMENT IN THE DARK','Catch your breath.','The kingdom can wait.<br>Your expedition is right where you left it.','CONTINUE EXPEDITION ↗'],confirm:['A FRESH EXPEDITION?','Leave this trail behind?','Restarting resets your current expedition.<br>Your personal best will stay with you.','START AGAIN ↗'],dead:['THE KINGDOM KEEPS ITS SECRETS','A brave attempt.<br>A deeper mystery.',`You reached chamber ${game.level+1} with ${game.score} points.<br>There’s always another way through.`,'TRY AGAIN ↗'],won:['THE LOST CROWN IS YOURS','Some legends<br>make it home.',`Five chambers conquered. ${game.score} points earned.<br>The kingdom will remember this expedition.`,'ANOTHER ADVENTURE ↗']};
  if(states[game.phase]){const [k,t,c,b]=states[game.phase];$('overlay-kicker').textContent=k;$('overlay-title').innerHTML=t;$('overlay-copy').innerHTML=c;$('primary').textContent=b;$('overlay-hint').textContent=game.phase==='confirm'?'PRESS ESCAPE TO KEEP EXPLORING':'ARROW KEYS TO MOVE · SPACE TO WHIP';}
  render(ctx,game,1);clearTimeout(effectTimer);effectTimer=setTimeout(()=>render(ctx,game,0),160);
}
function act(action){if($('guide').open)return;const old=game.turn;action();if(game.turn!==old)beep(game.effect?.type||'step');update();}
function begin(){if(game.phase==='paused'){pause(game);}else{game=newGame();start(game);}update();canvas.focus({preventScroll:true});}
$('primary').addEventListener('click',begin);
$('pause').addEventListener('click',()=>act(()=>pause(game)));
let beforeRestart='playing';
$('restart').addEventListener('click',()=>{if(game.phase==='title')return;if(game.phase==='confirm'){game.phase=beforeRestart;}else{beforeRestart=game.phase;game.phase='confirm';}update();});
$('sound').addEventListener('click',()=>{sound=!sound;$('sound').textContent=sound?'♪ SOUND ON':'♪ SOUND OFF';$('sound').setAttribute('aria-pressed',String(sound));if(sound)beep('gem');});
const moves={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};
document.addEventListener('keydown',e=>{
  if($('guide').open||e.ctrlKey||e.metaKey||e.altKey)return;
  const key=e.key.length===1?e.key.toLowerCase():e.key;
  if(key==='Escape'&&game.phase==='confirm'){game.phase=beforeRestart;update();return;}
  if(key==='p'||key==='Escape'){e.preventDefault();act(()=>pause(game));return;}
  if(key==='Enter'&&['title','dead','won','paused'].includes(game.phase)){e.preventDefault();begin();return;}
  // Preserve native keyboard activation of focused buttons.
  if(e.target.closest('button')&&key===' ')return;
  if(moves[key]||key===' '||key==='.'){e.preventDefault();if(game.phase!=='playing')return;const now=performance.now();if(e.repeat&&now-lastAction<110)return;lastAction=now;act(()=>moves[key]?move(game,...moves[key]):key===' '?whip(game):wait(game));}
});
for(const b of document.querySelectorAll('[data-move]'))b.addEventListener('click',()=>act(()=>move(game,...b.dataset.move.split(',').map(Number))));
$('touch-whip').addEventListener('click',()=>act(()=>whip(game)));$('touch-wait').addEventListener('click',()=>act(()=>wait(game)));
$('help').addEventListener('click',()=>{guidePaused=game.phase==='playing';if(guidePaused)pause(game);update();$('guide').showModal();});
function closeGuide(){$('guide').close();}
$('close-guide').addEventListener('click',closeGuide);$('guide-done').addEventListener('click',closeGuide);
$('guide').addEventListener('close',()=>{if(guidePaused&&game.phase==='paused')pause(game);guidePaused=false;update();canvas.focus({preventScroll:true});});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&game.phase==='playing'){pause(game);update();}});
update();
