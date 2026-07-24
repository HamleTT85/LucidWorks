// Bossfights: RATTUS (Keller), SKOLOPENDRA (Bad), MAUZI (Wohnzimmer)
(function(){
const C = () => AR.CONF, W = () => AR.World;

AR.Boss = class {
  constructor(def, run) {
    this.def = def; this.run = run;
    this.hp = def.hp; this.maxHp = def.hp;
    this.x = C().WORLD_W * .15; this.y = C().WORLD_H - 130;
    this.vx = 0; this.vy = 0;
    this.stun = 0;
    this.state = 'chase';
    this.facing = 1;
    this.size = 130 * def.scale;
    this.perimP = 0;               // für Skolopendra
    this.pounceT = 0;
    this.wrapFlash = 0;
    this.hitCd = 0;
  }

  update(dt) {
    const r = this.run, sp = r.spider;
    if (this.hitCd > 0) this.hitCd -= dt;
    if (this.wrapFlash > 0) this.wrapFlash -= dt;

    if (this.stun > 0) {
      this.stun -= dt;
      if (this.stun <= 0) r.toast(this.def.name.split(',')[0] + ' reißt sich los!');
      return;
    }

    switch (this.def.id) {
      case 'rat': {
        // Bodenjäger: rennt auf Spinnen-x zu, springt gelegentlich
        const dir = Math.sign(sp.x - this.x) || 1;
        this.facing = dir;
        this.vx = dir * this.def.speed;
        this.x += this.vx * dt;
        this.y = C().WORLD_H - this.size * .38;
        break;
      }
      case 'centipede': {
        // Perimeter-Jäger: rast auf der Raumgrenze zur Spinne
        const room = { x:0, y:0, w:C().WORLD_W, h:C().WORLD_H };
        const target = W().closestParam(room, sp.x, sp.y, true).p;
        const P = W().perim(room);
        let diff = ((target - this.perimP) % P + P) % P;
        if (diff > P / 2) diff -= P;
        this.perimP += Math.sign(diff) * Math.min(Math.abs(diff), this.def.speed * dt);
        const q = W().pointAt(room, this.perimP, true);
        this.x = q.x + q.nx * this.size * .2;
        this.y = q.y + q.ny * this.size * .2;
        this.facing = Math.sign(diff) || 1;
        break;
      }
      case 'cat': {
        // Katze: jagt nur BEWEGUNG. Erstarrte/stehende Spinne verwirrt sie.
        const spMoving = sp.moving || sp.mode !== 'surface';
        this.pounceT -= dt;
        if (this.state === 'chase') {
          if (spMoving && !sp.frozen) {
            const dir = Math.sign(sp.x - this.x) || 1;
            this.facing = dir;
            this.x += dir * this.def.speed * dt;
            if (this.pounceT <= 0 && Math.abs(sp.x - this.x) < 500 && sp.y < C().WORLD_H - 250) {
              // Sprung an die Wand nach oben
              this.state = 'pounce';
              this.vy = -820; this.vx = Math.sign(sp.x - this.x) * 420;
            }
          } else {
            // verwirrtes Umherstreifen
            this.x += Math.sin(performance.now() / 700) * this.def.speed * .25 * dt;
          }
          this.y = C().WORLD_H - this.size * .35;
        } else if (this.state === 'pounce') {
          this.vy += C().GRAVITY * 1.15 * dt;
          this.x += this.vx * dt; this.y += this.vy * dt;
          if (this.y >= C().WORLD_H - this.size * .35) {
            this.y = C().WORLD_H - this.size * .35;
            this.state = 'chase';
            this.pounceT = 2.6;
            this.run.shake(9); AR.Audio.stomp();
          }
        }
        break;
      }
    }
    this.x = Math.max(this.size * .3, Math.min(C().WORLD_W - this.size * .3, this.x));

    // Netzfalle?
    for (const w of [...r.webs]) {
      if (Math.hypot(w.x - this.x, w.y - this.y) < this.size * .45 + w.r * .6) {
        r.destroyWeb(w, false);
        this.stun = 3.5;
        r.toast('🕸️ ' + this.def.name.split(',')[0] + ' hängt im Netz — EINWICKELN (🕸️)!');
        r.pulseActButton(true);
        AR.Audio.webBuild();
        return;
      }
    }

    // Trifft er die Spinne?
    const hitR = this.size * .38 + sp.r;
    if (this.hitCd <= 0 && sp.invuln <= 0 && Math.hypot(sp.x - this.x, sp.y - this.y) < hitR) {
      const dodgedCat = this.def.id === 'cat' && (sp.frozen || (!sp.moving && sp.mode === 'surface'));
      if (!dodgedCat) {
        this.hitCd = 1.2;
        if (sp.armor > 0) { sp.armor--; sp.invuln = 1.6; r.toast('🛡️ Chitinpanzer zerbrochen!'); r.rebuildPerkChips(); }
        else if (sp.bristles > 0) { sp.bristles--; sp.invuln = 1.6; r.toast('🪮 Zähe Borsten — überlebt!'); }
        else r.kill('boss_' + this.def.id);
      }
    }
  }

  tryWrap() {
    const r = this.run, sp = r.spider;
    if (this.stun <= 0) return false;
    if (Math.hypot(sp.x - this.x, sp.y - this.y) > this.size * .7) return false;
    if (r.silk < 18) { r.toast('Nicht genug Seide zum Einwickeln!'); return true; }
    r.spendSilk(18);
    this.hp--;
    this.wrapFlash = .4;
    this.stun = Math.max(this.stun, 1.2);
    AR.Audio.bossHit();
    r.shake(8);
    r.fx.burst(this.x, this.y, '#4de8e8', 22);
    r.pulseActButton(false);
    if (this.hp <= 0) r.bossDefeated();
    else r.toast(`Gewickelt! Noch ${this.hp}× …`);
    return true;
  }

  draw(ctx, t) {
    ctx.save();
    ctx.translate(this.x, this.y);
    if (this.stun > 0) ctx.rotate(Math.sin(t / 90) * .08);
    ctx.scale(this.facing, 1);
    const img = this.def.img;
    if (AR.Assets.ok(img)) {
      ctx.drawImage(AR.Assets.img[img], -this.size/2, -this.size/2, this.size, this.size);
    } else {
      ctx.fillStyle = '#5a4438';
      ctx.beginPath(); ctx.ellipse(0, 0, this.size*.4, this.size*.28, 0, 0, 7); ctx.fill();
    }
    ctx.restore();
    // Seiden-Wicklung bei Stun
    if (this.stun > 0) {
      ctx.strokeStyle = 'rgba(210,240,245,.7)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.size * .42, this.size * (.12 + i * .07),
          .3 + i * .1 + Math.sin(t/300) * .05, 0, 7);
        ctx.stroke();
      }
    }
    if (this.wrapFlash > 0) {
      ctx.fillStyle = `rgba(77,232,232,${this.wrapFlash})`;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.size * .6, 0, 7); ctx.fill();
    }
  }
};
})();
