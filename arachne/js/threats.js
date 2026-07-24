// Menschen-Bedrohungen: Event-Manager + einzelne Gefahren
(function(){
const C = () => AR.CONF;

AR.Threats = class {
  constructor(run) {
    this.run = run;
    this.activity = 0;                 // 0-100
    this.noise = 0;
    this.active = null;                // laufendes Event
    this.nextIn = this.rollDelay(1.6); // erste Schonfrist
    this.time = 0;
  }

  rollDelay(mult) {
    const b = this.run.biome;
    const escal = 1 / (1 + this.activity / 90);   // hohe Aktivität = dichtere Events
    return (b.eventMin + Math.random() * (b.eventMax - b.eventMin)) * (mult || 1) * escal;
  }

  addNoise(n) { this.noise = Math.min(20, this.noise + n); }

  visibleWebPenalty() {
    let v = 0;
    for (const w of this.run.webs) v += (w.spot.vis || 1) * .05;
    return v;
  }

  update(dt) {
    this.time += dt;
    const b = this.run.biome;
    this.activity = Math.min(100, this.activity +
      dt * (C().ACTIVITY_RATE * b.actRate + this.noise * .06 + this.visibleWebPenalty())
      + this.run.time * b.escalation * dt);
    this.noise = Math.max(0, this.noise - dt * 2.2);

    if (this.active) { this.updateEvent(dt); return; }
    this.nextIn -= dt * (1 + this.activity / 120);
    if (this.nextIn <= 0) this.spawnEvent();
  }

  spawnEvent() {
    const r = this.run, sp = r.spider;
    const pool = [];
    // Gefahr abhängig davon, WO die Spinne ist
    if (sp.onFloorish() || sp.mode !== 'surface') pool.push('stomp','stomp','vacuum','hand');
    if (sp.onWall()) pool.push('swat','swat','hand');
    if (sp.onCeiling()) pool.push('vacuum','hand');
    if (this.activity > 55) pool.push('vacuum');
    if (!pool.length) pool.push('stomp');
    const type = pool[Math.floor(Math.random() * pool.length)];

    const warnBase = { stomp:2.2, swat:2.0, vacuum:4.6, hand:2.8 }[type];
    const warn = warnBase + r.stats.warnBonus + (r.perkMods.warn || 0);
    const tx = sp.x, ty = sp.y;   // Ziel: aktuelle Position (mit Tarnungs-Streuung)
    const scatter = Math.max(0, (r.stats.camo + (r.perkMods.camo || 0)) - 2) * 30;
    const ox = (Math.random() - .5) * 2 * scatter;

    this.active = { type, warn, t: 0, phase: 'warn', x: tx + ox, y: ty, prog: 0 };
    AR.Audio.warn();
    r.showWarning({
      stomp:  '👣 SCHRITTE! Der Boden bebt …',
      swat:   '🥿 PANTOFFEL! Weg von der Wand!',
      vacuum: '🌪️ STAUBSAUGER!! HOCH! SOFORT!',
      hand:   '🖐️ EINE HAND NÄHERT SICH …',
    }[type]);
    if (type === 'vacuum') AR.Audio.vacuum(true);
    if (r.char.sig === 'adrenaline') sp.adrenaline = 3;
  }

  updateEvent(dt) {
    const e = this.active, r = this.run, sp = r.spider;
    e.t += dt;

    if (e.phase === 'warn') {
      if (e.t >= e.warn) { e.phase = 'strike'; e.t = 0; r.hideWarning(); }
      return;
    }

    // strike-Phase
    e.prog = Math.min(1, e.t / this.strikeDur(e.type));
    switch (e.type) {
      case 'stomp': {
        if (e.prog >= 1) {
          AR.Audio.stomp(); r.shake(14);
          const inZone = sp.onFloorish() && Math.abs(sp.x - e.x) < 150 && sp.y > C().WORLD_H * .8;
          if (inZone) this.hit('stomp');
          this.finish();
        }
        break;
      }
      case 'swat': {
        if (e.prog >= 1) {
          AR.Audio.stomp(); r.shake(10);
          const inZone = sp.onWall() && Math.hypot(sp.x - e.x, sp.y - e.y) < 190;
          if (inZone) this.hit('swat');
          this.finish();
        }
        break;
      }
      case 'vacuum': {
        // Fährt über den Boden, saugt bodennahe Netze & Spinne am Boden
        const dur = this.strikeDur('vacuum');
        e.x = e.prog * C().WORLD_W;
        e.y = C().WORLD_H - 90;
        r.shake(2);
        for (const w of [...r.webs]) {
          if (w.spot.h === 1 && Math.abs(w.x - e.x) < 130) r.destroyWeb(w, true);
        }
        if (sp.y > C().WORLD_H * .74 && Math.abs(sp.x - e.x) < 130 && sp.invuln <= 0) {
          this.hit('vacuum');
        }
        if (e.t >= dur) { AR.Audio.vacuum(false); this.finish(); }
        break;
      }
      case 'hand': {
        // Senkt sich auf die Zielposition
        if (e.prog >= 1) {
          const caught = Math.hypot(sp.x - e.x, sp.y - e.y) < 170 && sp.invuln <= 0 && !sp.frozen;
          if (caught) {
            if (Math.random() < r.stats.freedChance) r.freedByHuman();
            else this.hit('hand');
          }
          this.finish();
        }
        break;
      }
    }
  }

  strikeDur(type) { return { stomp:.45, swat:.5, vacuum:3.6, hand:1.15 }[type]; }

  hit(type) {
    const r = this.run, sp = r.spider;
    if (sp.invuln > 0) return;
    if (type !== 'vacuum') {           // Staubsauger ignoriert alles
      if (sp.armor > 0) { sp.armor--; sp.invuln = 1.6; r.toast('🛡️ Chitinpanzer zerbrochen — überlebt!'); r.rebuildPerkChips(); return; }
      if (sp.bristles > 0) { sp.bristles--; sp.invuln = 1.6; r.toast('🪮 Zähe Borsten — überlebt!'); return; }
    }
    r.kill(type);
  }

  finish() {
    if (this.active && this.active.type === 'vacuum') AR.Audio.vacuum(false);
    this.active = null;
    this.nextIn = this.rollDelay(1);
    this.run.hideWarning();
  }

  draw(ctx, t) {
    const e = this.active;
    if (!e) return;
    const r = this.run;

    if (e.phase === 'warn') {
      // Warn-Markierung
      const blink = .35 + Math.sin(t / 110) * .25;
      ctx.strokeStyle = `rgba(232,90,77,${blink})`;
      ctx.lineWidth = 3;
      if (e.type === 'stomp') {
        ctx.strokeRect(e.x - 150, C().WORLD_H - 40, 300, 34);
      } else if (e.type === 'vacuum') {
        ctx.strokeRect(4, C().WORLD_H - 210, C().WORLD_W - 8, 200);
      } else {
        ctx.beginPath(); ctx.arc(e.x, e.y, 175, 0, 7); ctx.stroke();
      }
      return;
    }

    // Strike-Darstellung mit generierten Sprites
    const drawThreat = (img, x, y, size, rot, flip) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0);
      if (flip) ctx.scale(-1, 1);
      if (AR.Assets.ok(img)) ctx.drawImage(AR.Assets.img[img], -size/2, -size/2, size, size);
      else { ctx.fillStyle = 'rgba(60,50,45,.9)'; ctx.beginPath(); ctx.arc(0, 0, size/3, 0, 7); ctx.fill(); }
      ctx.restore();
    };

    switch (e.type) {
      case 'stomp': {
        const y = -200 + e.prog * (C().WORLD_H - 30 + 200 - 160);
        drawThreat('threat_slipper', e.x, y, 420, .12);
        break;
      }
      case 'swat': {
        const from = e.x < C().WORLD_W / 2 ? -260 : C().WORLD_W + 260;
        const x = from + (e.x - from) * e.prog;
        drawThreat('threat_slipper', x, e.y, 380, e.x < C().WORLD_W/2 ? Math.PI/2 : -Math.PI/2);
        break;
      }
      case 'vacuum': {
        drawThreat('threat_vacuum', e.x, e.y - 60, 520, Math.sin(t/150) * .05);
        // Saug-Partikel
        if (Math.random() < .5) r.fx.burst(e.x + (Math.random()-.5)*200, C().WORLD_H - 30, '#887', 1);
        break;
      }
      case 'hand': {
        const y = -300 + e.prog * (e.y + 300 - 80);
        drawThreat('threat_hand', e.x, y, 480, Math.sin(e.prog * 3) * .06);
        break;
      }
    }
  }
};
})();
