// Asset-Loader
AR.Assets = {
  img: {},
  LIST: [
    'spider_huntsman','spider_orbweaver','spider_jumper','spider_widow','spider_tarantula',
    'prey_fly','prey_moth','prey_beetle','prey_firefly',
    'boss_rat','boss_centipede','boss_cat',
    'threat_hand','threat_slipper','threat_vacuum',
  ],
  BGS: ['bg_keller','bg_bad','bg_wohnzimmer'],

  load(onDone) {
    const all = [
      ...this.LIST.map(n => ({ n, src:`assets/img/${n}.png` })),
      ...this.BGS.map(n => ({ n, src:`assets/img/${n}.jpg` })),
    ];
    let left = all.length;
    const done = () => { if (--left <= 0) onDone(); };
    for (const a of all) {
      const im = new Image();
      im.onload = done;
      im.onerror = done;   // fehlendes Bild -> prozeduraler Fallback beim Zeichnen
      im.src = a.src;
      this.img[a.n] = im;
    }
    if (!all.length) onDone();
  },

  ok(name) { const i = this.img[name]; return i && i.complete && i.naturalWidth > 0; },
};
