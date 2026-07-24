// Bootstrap, State-Machine, Game-Loop
AR.Main = {
  canvas: null, ctx: null,
  run: null,
  state: 'title',
  lastT: 0,

  init() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    AR.Save.load();
    AR.Input.init();
    AR.Screens.init();
    AR.Nexus.init();

    AR.Assets.load(() => {
      document.getElementById('loading').classList.add('hidden');
      document.getElementById('screen-title').classList.remove('hidden');
    });

    // Endlos-Modus-Modifikatoren via startRun-Flag
    requestAnimationFrame(t => this.loop(t));
  },

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
  },

  toNexus() {
    this.run = null;
    this.state = 'nexus';
    AR.Audio.vacuum(false);
    document.getElementById('hud').classList.add('hidden');
    AR.Nexus.show();
  },

  startRun(biomeId, bossMode, endless) {
    AR.Nexus.hide();
    document.getElementById('screen-death').classList.add('hidden');
    document.getElementById('screen-victory').classList.add('hidden');
    this.run = new AR.Run(biomeId, bossMode);
    if (endless) {
      // Ewiger Sommer: dichter, härter, ertragreicher
      this.run.biome = Object.assign({}, this.run.biome, {
        eventMin: this.run.biome.eventMin * .5,
        eventMax: this.run.biome.eventMax * .5,
      });
      this.run.threats.run = this.run;
      this.run.stats = Object.assign({}, this.run.stats,
        { essenceMul: this.run.stats.essenceMul * 1.5 });
      this.run.toast('☀️ EWIGER SOMMER — alles will dich töten. Viel Glück.', 4);
    }
    this.state = 'run';
  },

  loop(t) {
    const dt = Math.min(.05, (t - this.lastT) / 1000 || .016);
    this.lastT = t;
    const ctx = this.ctx, cv = this.canvas;

    if (this.state === 'run' && this.run) {
      this.run.update(dt);
      ctx.clearRect(0, 0, cv.width, cv.height);
      this.run.render(ctx, cv);
    }

    requestAnimationFrame(tt => this.loop(tt));
  },
};

window.addEventListener('DOMContentLoaded', () => AR.Main.init());
