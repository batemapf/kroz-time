const $=id=>document.getElementById(id);
const frame=$('emulator');let ready=false,frozen=false,launched=false,loadTimer;
const held=new Set();
const send=(type,details={})=>{if(frame.contentWindow)frame.contentWindow.postMessage({source:'kroz-shell',type,...details},location.origin);};
function focusGame(){send('focus');frame.focus({preventScroll:true});}
function releaseAll(){for(const code of held)send('key',{code,pressed:false});held.clear();}
function setFrozen(value){if(!ready)return;releaseAll();frozen=value;send(value?'freeze':'resume');$('frozen').hidden=!value;$('pause').textContent=value?'▶ Resume emulator':'Ⅱ Pause emulator';$('runtime-status').textContent=value?'PAUSED — YOUR PROGRESS IS SAFE.':'ORIGINAL DOS GAME · RUNNING';if(!value)focusGame();}
function fail(message){clearTimeout(loadTimer);ready=false;$('boot').hidden=false;frame.hidden=true;$('launch').disabled=false;$('launch').textContent='↻ RETRY BOOT';$('load-status').textContent='Unable to start: '+message;$('power').textContent='● ERROR';for(const id of ['pause','reboot'])$(id).disabled=true;}
function launch(){
 if(launched&&ready)return;launched=true;ready=false;$('launch').disabled=true;$('launch').textContent='BOOTING DOS…';$('load-status').textContent='Loading the self-hosted emulator and original game…';$('power').textContent='● BOOTING';
 frame.src='./player.html?v=2.0.1';frame.hidden=false;
 loadTimer=setTimeout(()=>fail('loading timed out. Check your connection and try again.'),45000);
}
$('launch').addEventListener('click',launch);
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==frame.contentWindow||event.data?.source!=='kroz-player')return;
 if(event.data.type==='ready'){clearTimeout(loadTimer);ready=true;$('boot').hidden=true;$('power').textContent='● DOS ONLINE';$('runtime-status').textContent='ORIGINAL DOS GAME · RUNNING';$('pause').disabled=false;$('reboot').disabled=false;focusGame();}
 if(event.data.type==='error')fail(event.data.message);
 if(event.data.type==='storage-warning')$('runtime-status').textContent='SAVES LAST THIS SESSION ONLY — BROWSER STORAGE UNAVAILABLE.';
});
for(const button of document.querySelectorAll('[data-key]')){
 const code=Number(button.dataset.key);
 if(button.hasAttribute('data-hold')){
  button.addEventListener('pointerdown',event=>{if(!ready||frozen)return;event.preventDefault();button.setPointerCapture(event.pointerId);held.add(code);send('key',{code,pressed:true});});
  const release=()=>{if(held.delete(code))send('key',{code,pressed:false});};
  button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
  button.addEventListener('click',event=>{if(event.detail===0)tap(code);});
 }else button.addEventListener('click',()=>tap(code));
}
function tap(code){if(!ready)return;if(frozen)setFrozen(false);send('key',{code,pressed:true});held.add(code);setTimeout(()=>{send('key',{code,pressed:false});held.delete(code);},100);}
$('pause').addEventListener('click',()=>setFrozen(!frozen));$('resume').addEventListener('click',()=>setFrozen(false));
$('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('screen').requestFullscreen();if(ready)focusGame();}catch{$('runtime-status').textContent='Fullscreen is unavailable in this browser. Try rotating your device.';}});
let wasFrozen=false;
$('reboot').addEventListener('click',()=>{wasFrozen=frozen;setFrozen(true);$('reboot-dialog').showModal();});
$('cancel-reboot').addEventListener('click',()=>$('reboot-dialog').close('cancel'));
$('confirm-reboot').addEventListener('click',()=>$('reboot-dialog').close('reboot'));
$('reboot-dialog').addEventListener('close',()=>{if($('reboot-dialog').returnValue==='reboot'){releaseAll();ready=false;frozen=false;$('frozen').hidden=true;$('boot').hidden=false;$('pause').disabled=true;$('reboot').disabled=true;$('pause').textContent='Ⅱ Pause emulator';launch();}else setFrozen(wasFrozen);});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&ready&&!frozen)setFrozen(true);});
window.addEventListener('blur',releaseAll);
if(matchMedia('(pointer:coarse)').matches||innerWidth<700)$('touch-panel').open=true;
