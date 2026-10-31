// js-dos 6.22.60 uses Asyncify's sync_sleep hook, not Emscripten's main loop.
// Hold its next wake-up to freeze the whole machine, including timers.
export function pauseController(dos) {
  const sleep = dos.sync_sleep.bind(dos);
  let paused = false, pending = null;
  dos.sync_sleep = wake => { if (paused) pending = wake; else sleep(wake); };
  return {
    pause() { if (paused) return; paused = true; dos.pause(); dos.SDL?.audioContext?.suspend().catch(()=>{}); },
    resume() {
      if (!paused) return;
      paused = false;
      const wake = pending; pending = null;
      if (wake) setTimeout(wake, 0);
      dos.resume(); dos.SDL?.audioContext?.resume().catch(()=>{});
    },
  };
}
