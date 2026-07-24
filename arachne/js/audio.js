// Prozedurale WebAudio-SFX — keine Asset-Downloads
AR.Audio = {
  ctx: null, master: null, droneOsc: null, droneGain: null,

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    } catch(e) {}
  },

  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },

  tone(freq, dur, type='sine', vol=.3, slide=0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(.001, t + dur);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dur);
  },

  noise(dur, vol=.3, low=400) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime, n = this.ctx.sampleRate * dur;
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = low;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start(t);
  },

  // Benannte Effekte
  silk()      { this.tone(1200, .12, 'sine', .18, 600); },
  webBuild()  { this.tone(700, .3, 'triangle', .22, 500); this.tone(1400, .4, 'sine', .12, 300); },
  collect()   { this.tone(880, .1, 'sine', .25); setTimeout(() => this.tone(1320, .14, 'sine', .25), 80); },
  perk()      { [660,880,1100].forEach((f,i) => setTimeout(() => this.tone(f, .18, 'triangle', .2), i*90)); },
  jump()      { this.tone(300, .15, 'square', .1, 250); },
  land()      { this.tone(150, .1, 'sine', .15, -60); },
  warn()      { this.tone(220, .3, 'sawtooth', .16, -40); },
  stomp()     { this.noise(.25, .5, 200); this.tone(70, .3, 'sine', .5, -30); },
  vacuum(on)  {
    if (!this.ctx) return;
    if (on && !this.droneOsc) {
      this.droneOsc = this.ctx.createOscillator(); this.droneGain = this.ctx.createGain();
      this.droneOsc.type = 'sawtooth'; this.droneOsc.frequency.value = 65;
      this.droneGain.gain.value = .14;
      this.droneOsc.connect(this.droneGain); this.droneGain.connect(this.master);
      this.droneOsc.start();
    } else if (!on && this.droneOsc) {
      try { this.droneOsc.stop(); } catch(e) {}
      this.droneOsc = null;
    }
  },
  death()     { this.noise(.5, .5, 300); this.tone(160, .8, 'sawtooth', .3, -120); },
  freed()     { [520,660,780,1040].forEach((f,i) => setTimeout(() => this.tone(f, .3, 'sine', .2), i*140)); },
  bossHit()   { this.tone(190, .3, 'square', .3, -80); this.noise(.2, .3, 600); },
  bossDead()  { [392,494,587,784].forEach((f,i) => setTimeout(() => this.tone(f, .4, 'triangle', .25), i*160)); },
  click()     { this.tone(900, .05, 'sine', .12); },
  buy()       { this.tone(660, .12, 'sine', .2); setTimeout(() => this.tone(990, .18, 'sine', .2), 90); },
  denied()    { this.tone(180, .2, 'square', .15); },
};
