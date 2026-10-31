(function startPlayer() {
  const canvas = document.getElementById('dos');
  const tell = (type, details = {}) => parent.postMessage({ source: 'kroz-player', type, ...details }, location.origin);
  let ci;
  let controls;

  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== parent || !event.data || event.data.source !== 'kroz-shell' || !ci) return;
    const { type, code, pressed } = event.data;
    if (type === 'key' && Number.isInteger(code) && code >= 8 && code <= 122) ci.simulateKeyEvent(code, Boolean(pressed));
    if (type === 'focus') canvas.focus();
    if (type === 'freeze') controls.pause();
    if (type === 'resume') { controls.resume(); canvas.focus(); }
  });

  (async () => {
    try {
      const base = new URL('.', location.href);
      const runtime = await Dos(canvas, {
        wdosboxUrl: new URL('vendor/js-dos/wdosbox.js', base).href,
        cycles: 1200,
        autolock: false,
        onprogress: () => tell('loading'),
        onerror: message => tell('error', { message: String(message) }),
      });
      await runtime.fs.extract(new URL('games/kingdom.zip', base).href, '/kroz-ii');
      ci = await runtime.main(['-c', 'cd KROZ-II', '-c', 'kingdom.exe']);
      controls = globalThis.KrozPauseController(ci.dos);
      canvas.focus();
      tell('ready');
    } catch (error) {
      tell('error', { message: String(error) });
      console.error(error);
    }
  })();
}());
