// Ein Run: Gameplay-Orchestrierung, Kamera, Rendering, HUD
(function(){
const C = () => AR.CONF;

AR.Run = class {
  constructor(biomeId, bossMode) {
    const save = AR.Save.data;
    this.biome = AR.BIOMES[biomeId];
    this.char = AR.CHARACTERS.find(c => c.id === save.charId) || AR.CHARACTERS[0];
    this.stats = AR.Save.buildStats(this.char);
    this.bossMode = !!bossMode;

    this.spider = new AR.Spider(this.char, this.stats, this.biome);
    this.webs = [];
    this.freePrey = [];
    this.fx = new AR.FX();
    this.threats = new AR.Threats(this);
    this.boss = null;

    this.silk = this.stats.silkMax;
    this.essence = 0;
    this.preyCount = 0;
    this.time = 0;
    this.paused = false;
    this.over = false;
    this.perks = [];
    this.perkMods = {};
    this.rerollsLeft = 0;
    this.pendingPerk = null;
    this.pendingPrey = null;
    this.cam = { x:0, y:0, shake:0 };
    this.toastTimer = 0;

    for (let i = 0; i < 4; i++) this.spawnPrey();

    // Nahrungsspeicher: gelagerte Beute aus letztem Run
    if (save.pantry) {
      const def = AR.PREY.find(p => p.id === save.pantry) || AR.PREY[0];
      save.pantry = null; AR.Save.save();
      setTimeout(() => {
        this.toast('🍯 Nahrungsspeicher: gelagerte ' + def.name + ' verdaut!');
        this.collectPrey(def, true);
      }, 900);
    }

    if (this.bossMode) {
      const bdef = AR.BOSSES[this.biome.boss];
      this.toast(bdef.intro, 4.2);
      setTimeout(() => { if (!this.over) { this.boss = new AR.Boss(bdef, this); this.showBossBar(); this.toast(bdef.hint, 5); } }, 3200);
    }

    // Input-Callbacks
    AR.Input.onJump = () => !this.paused && this.spider.jump(this);
    AR.Input.onAct = () => !this.paused && this.action();
    AR.Input.onFreeze = (down) => this.freeze(down);

    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('boss-bar-wrap').classList.add('hidden');
    this.rebuildPerkChips();
  }

  // ---------- Ressourcen ----------
  spendSilk(n) { this.silk = Math.max(0, this.silk - n); }
  gainSilk(n) { this.silk = Math.min(this.stats.silkMax, this.silk + n); }
  addNoise(n) { this.threats.addNoise(n); }

  webAt(x, y) {
    for (const w of this.webs) if (Math.hypot(w.x - x, w.y - y) < w.r) return w;
    return null;
  }

  // ---------- Beute ----------
  spawnPrey() {
    const defs = [];
    for (const p of AR.PREY) {
      let w = p.w;
      if (p.id === 'firefly' && this.stats.goldvein) w *= 1.5;
      defs.push({ p, w });
    }
    const tot = defs.reduce((s, d) => s + d.w, 0);
    let r = Math.random() * tot;
    for (const d of defs) { r -= d.w; if (r <= 0) { this.freePrey.push(new AR.FreePrey(d.p)); return; } }
  }

  rollPrey() {
    const defs = AR.PREY.map(p => ({ p, w: p.id === 'firefly' && this.stats.goldvein ? p.w * 1.5 : p.w }));
    const tot = defs.reduce((s, d) => s + d.w, 0);
    let r = Math.random() * tot;
    for (const d of defs) { r -= d.w; if (r <= 0) return d.p; }
    return AR.PREY[0];
  }

  freePreyAt(x, y, r) {
    for (const p of this.freePrey) if (Math.hypot(p.x - x, p.y - y) < r) return p;
    return null;
  }

  pounceCatch(p) {
    this.freePrey.splice(this.freePrey.indexOf(p), 1);
    this.fx.burst(p.x, p.y, '#4de8e8', 12);
    AR.Audio.collect();
    this.collectPrey(p.def);
    setTimeout(() => this.spawnPrey(), 4000 + Math.random() * 6000);
  }

  collectPrey(def, skipEssence) {
    // Essenz sofort
    if (!skipEssence) {
      let e = def.essence * this.stats.essenceMul * (1 + (this.perkMods.essence || 0));
      if (this.char.sig === 'venom' && Math.random() < .25) { e *= 2; this.toast('☠️ Giftbiss! Doppelte Essenz!'); }
      this.essence += Math.round(e);
      this.gainSilk(this.stats.silkMax * .3);
      this.preyCount++;
      AR.Save.data.stats.preyEaten++;
    }
    // Nahrungsspeicher füllen
    if (this.stats.pantry && !AR.Save.data.pantry && Math.random() < .5) {
      AR.Save.data.pantry = def.id; AR.Save.save();
    }
    // Perk würfeln & Modal zeigen
    this.rerollsLeft = this.stats.rerolls;
    this.pendingPrey = def;
    this.pendingPerk = this.rollPerk(def.pool);
    this.paused = true;
    AR.Screens.showPerkModal(this);
  }

  rollPerk(pool) {
    const cand = AR.PERKS.filter(p => pool.includes(p.rarity));
    const list = cand.length ? cand : AR.PERKS;
    const tot = list.reduce((s, p) => s + AR.RARITY_W[p.rarity], 0);
    let r = Math.random() * tot;
    for (const p of list) { r -= AR.RARITY_W[p.rarity]; if (r <= 0) return p; }
    return list[0];
  }

  applyPerk(perk) {
    this.perks.push(perk);
    for (const [k, v] of Object.entries(perk.mod)) {
      if (k === 'tint') this.spider.tint = v;
      else if (k === 'armor') this.spider.armor += v;
      else this.perkMods[k] = (this.perkMods[k] || 0) + v;
    }
    AR.Audio.perk();
    this.rebuildPerkChips();
  }

  rebuildPerkChips() {
    const el = document.getElementById('hud-perks');
    el.innerHTML = '';
    for (const p of this.perks) {
      const c = document.createElement('div');
      c.className = 'perk-chip r-' + p.rarity;
      c.textContent = p.icon;
      c.title = p.name;
      el.appendChild(c);
    }
    if (this.spider.armor > 0) {
      const c = document.createElement('div');
      c.className = 'perk-chip r-rare'; c.textContent = '🛡️';
      el.appendChild(c);
    }
  }

  // ---------- Aktionen ----------
  action() {
    const sp = this.spider;
    // 1. Boss einwickeln
    if (this.boss && this.boss.tryWrap()) return;
    // 2. Beute aus Netz sammeln
    for (const w of this.webs) {
      if (w.prey.length && Math.hypot(w.x - sp.x, w.y - sp.y) < w.r + 30) {
        const def = w.prey.shift();
        AR.Audio.collect();
        this.fx.burst(w.x, w.y, '#4de8e8', 14);
        this.collectPrey(def);
        return;
      }
    }
    // 3. Netz bauen
    const spot = this.spotNear(sp.x, sp.y, 120);
    if (spot) {
      if (spot.h > this.stats.maxSpotH) { this.toast('🔒 Zu hoch! Skill „Eckenkletterer" nötig.'); AR.Audio.denied(); return; }
      if (this.webAt(spot.x, spot.y)) { this.toast('Hier hängt schon ein Netz.'); return; }
      const cost = this.perkMods.freeWebs ? 0 :
        C().WEB_COST * this.stats.silkCostMul * (1 + (this.perkMods.silkCost || 0));
      if (this.silk < cost) { this.toast('Nicht genug Seide!'); AR.Audio.denied(); return; }
      this.spendSilk(cost);
      this.webs.push(new AR.Web(spot, this));
      AR.Audio.webBuild();
      this.fx.burst(spot.x, spot.y, '#c8f0f5', 16);
      this.addNoise(1.2);
      return;
    }
    this.toast('🕸️ = an Netz-Spots bauen, Beute sammeln, Bosse wickeln');
  }

  spotNear(x, y, r) {
    for (const s of this.biome.spots) if (Math.hypot(s.x - x, s.y - y) < r) return s;
    return null;
  }

  destroyWeb(w, byHuman) {
    const i = this.webs.indexOf(w);
    if (i < 0) return;
    this.webs.splice(i, 1);
    this.fx.burst(w.x, w.y, byHuman ? '#e85a4d' : '#c8f0f5', 18);
    if (this.stats.recycler) {
      const refund = C().WEB_COST * .5;
      this.gainSilk(refund);
      this.toast('♻️ Verwerter: Seide zurückgewonnen.');
    }
  }

  freeze(down) {
    const sp = this.spider;
    sp.frozen = down;
    if (down && this.stats.playdead && sp.playDeadLeft > 0 &&
        this.threats.active && this.threats.active.phase === 'warn') {
      sp.playDeadLeft--;
      sp.invuln = 2.2;
      this.toast('🧊 Totstellen! 2 s unverwundbar.');
    }
  }

  pulseActButton(on) {
    document.getElementById('tbtn-act').classList.toggle('pulse', on);
  }

  // ---------- Tod, Befreiung, Sieg ----------
  kill(cause) {
    if (this.over || this.spider.invuln > 0) return;
    this.over = true;
    AR.Audio.death();
    AR.Audio.vacuum(false);
    this.shake(20);
    this.fx.burst(this.spider.x, this.spider.y, '#e85a4d', 30);
    const s = AR.Save.data;
    s.stats.deaths++; s.stats.runs++;
    s.stats.bestRun = Math.max(s.stats.bestRun, this.essence);
    s.essence += this.essence; s.stats.essenceTotal += this.essence;
    AR.Save.save();
    setTimeout(() => AR.Screens.showDeath(this, cause), 900);
  }

  retreat() {
    if (this.over) return;
    this.over = true;
    const s = AR.Save.data;
    s.stats.runs++;
    s.stats.bestRun = Math.max(s.stats.bestRun, this.essence);
    s.essence += this.essence; s.stats.essenceTotal += this.essence;
    AR.Save.save();
    AR.Main.toNexus();
  }

  freedByHuman() {
    const sp = this.spider;
    AR.Audio.freed();
    AR.Save.data.stats.freed++;
    AR.Save.save();
    this.toast('🫙 BEFREIT! Glas & Papier — der Mensch trägt dich hinaus … du krabbelst durchs Fenster zurück!', 5);
    const w = this.biome.windowSpot || { x: C().WORLD_W - 100, y: 150 };
    sp.mode = 'surface';
    const near = AR.World.nearestSurface(this.biome, w.x, w.y);
    sp.surf = near; sp.syncPos();
    sp.invuln = 3.5;
    this.essence += 25;                    // Dankbarkeits-Bonus
    this.threats.activity = Math.max(0, this.threats.activity - 35);
  }

  bossDefeated() {
    if (this.over) return;
    this.over = true;
    AR.Audio.bossDead();
    const s = AR.Save.data;
    s.bosses[this.boss.def.id] = true;
    s.stats.runs++;
    s.essence += this.essence; s.stats.essenceTotal += this.essence;
    if (this.boss.def.id === 'cat') s.endless = true;
    AR.Save.save();
    setTimeout(() => AR.Screens.showVictory(this), 800);
  }

  showBossBar() {
    document.getElementById('boss-bar-wrap').classList.remove('hidden');
    document.getElementById('boss-name').textContent = this.boss.def.name;
  }

  // ---------- UI-Helfer ----------
  toast(msg, dur) {
    const el = document.getElementById('hud-toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    this.toastTimer = dur || 2.6;
  }
  showWarning(msg) {
    const el = document.getElementById('hud-warning');
    el.textContent = msg;
    el.classList.remove('hidden');
  }
  hideWarning() { document.getElementById('hud-warning').classList.add('hidden'); }
  shake(n) { this.cam.shake = Math.max(this.cam.shake, n); }

  // ---------- Update & Render ----------
  update(dt) {
    if (this.paused || this.over) return;
    this.time += dt;
    this.gainSilk(C().SILK_REGEN * dt);
    this.spider.update(dt, this);
    for (const w of this.webs) w.update(dt, this);
    for (const p of this.freePrey) p.update(dt);
    if (this.freePrey.length < 3 && Math.random() < dt * .2) this.spawnPrey();
    if (!this.bossMode) this.threats.update(dt);
    else if (this.boss) this.boss.update(dt);
    this.fx.update(dt);
    if (this.toastTimer > 0) {
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) document.getElementById('hud-toast').classList.add('hidden');
    }
    this.updateHud();
  }

  updateHud() {
    document.getElementById('essence-val').textContent = this.essence;
    document.getElementById('lives-val').textContent =
      1 + this.spider.armor + this.spider.bristles + (this.spider.playDeadLeft || 0);
    document.getElementById('hud-silk-bar').style.width = (this.silk / this.stats.silkMax * 100) + '%';
    document.getElementById('hud-activity-bar').style.width = this.threats.activity + '%';
    if (this.boss) {
      document.getElementById('boss-bar').style.width = (this.boss.hp / this.boss.maxHp * 100) + '%';
    }
  }

  render(ctx, cv) {
    const t = performance.now();
    // Kamera
    const zoom = Math.max(cv.width / C().WORLD_W, cv.height / C().WORLD_H) * 1.42;
    let cx = this.spider.x - cv.width / 2 / zoom;
    let cy = this.spider.y - cv.height / 2 / zoom;
    cx = Math.max(0, Math.min(C().WORLD_W - cv.width / zoom, cx));
    cy = Math.max(0, Math.min(C().WORLD_H - cv.height / zoom, cy));
    this.cam.x += (cx - this.cam.x) * .12;
    this.cam.y += (cy - this.cam.y) * .12;
    let sx = 0, sy = 0;
    if (this.cam.shake > 0) {
      sx = (Math.random() - .5) * this.cam.shake;
      sy = (Math.random() - .5) * this.cam.shake;
      this.cam.shake *= .88;
    }

    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(-this.cam.x + sx, -this.cam.y + sy);

    // Hintergrund
    const bg = AR.Assets.img[this.biome.bg];
    if (AR.Assets.ok(this.biome.bg)) {
      ctx.drawImage(bg, 0, 0, C().WORLD_W, C().WORLD_H);
    } else {
      ctx.fillStyle = '#181c22';
      ctx.fillRect(0, 0, C().WORLD_W, C().WORLD_H);
    }
    // Abdunkeln für Lesbarkeit
    ctx.fillStyle = 'rgba(8,10,14,.22)';
    ctx.fillRect(0, 0, C().WORLD_W, C().WORLD_H);

    // Möbel-Silhouetten
    for (const f of this.biome.furniture) {
      const g = ctx.createLinearGradient(f.x, f.y, f.x, f.y + f.h);
      g.addColorStop(0, 'rgba(22,26,34,.30)');
      g.addColorStop(1, 'rgba(12,14,20,.38)');
      ctx.fillStyle = g;
      ctx.fillRect(f.x, f.y, f.w, f.h);
      ctx.strokeStyle = 'rgba(140,170,190,.18)';
      ctx.lineWidth = 2;
      ctx.strokeRect(f.x, f.y, f.w, f.h);
      ctx.strokeStyle = 'rgba(77,232,232,.25)';
      ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x + f.w, f.y); ctx.stroke();
    }

    // Wasser-Gefahren
    if (this.biome.hazards) for (const hz of this.biome.hazards) {
      const wg = ctx.createLinearGradient(0, hz.y, 0, hz.y + hz.h);
      wg.addColorStop(0, 'rgba(60,140,180,.55)');
      wg.addColorStop(1, 'rgba(20,60,100,.7)');
      ctx.fillStyle = wg;
      ctx.fillRect(hz.x, hz.y + Math.sin(t / 500) * 3, hz.w, hz.h);
    }

    // Fenster-Spot (Heimbasis)
    if (this.biome.windowSpot) {
      const w = this.biome.windowSpot;
      ctx.strokeStyle = `rgba(255,215,129,${.25 + Math.sin(t/700) * .12})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(w.x - 46, w.y - 60, 92, 120);
    }

    // Netz-Spots (Marker)
    for (const s of this.biome.spots) {
      if (this.webAt(s.x, s.y)) continue;
      const locked = s.h > this.stats.maxSpotH;
      const pulse = .35 + Math.sin(t / 500 + s.x) * .2;
      ctx.strokeStyle = locked ? `rgba(150,150,160,${pulse * .5})` : `rgba(77,232,232,${pulse})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 7]);
      ctx.beginPath(); ctx.arc(s.x, s.y, 40, 0, 7); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = locked ? 'rgba(170,170,180,.7)' : 'rgba(77,232,232,.85)';
      ctx.font = '22px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(locked ? '🔒' : '🕸', s.x, s.y + 8);
      ctx.font = '13px sans-serif';
      ctx.fillStyle = 'rgba(200,225,235,.55)';
      ctx.fillText(s.name, s.x, s.y + 62);
    }

    for (const w of this.webs) w.draw(ctx, t);
    for (const p of this.freePrey) p.draw(ctx, t);
    if (this.boss) this.boss.draw(ctx, t);
    if (!this.bossMode) this.threats.draw(ctx, t);
    this.spider.draw(ctx, this);
    this.fx.draw(ctx);

    // Vignette
    ctx.restore();
    const vg = ctx.createRadialGradient(cv.width/2, cv.height/2, cv.height*.42, cv.width/2, cv.height/2, cv.height*.85);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,.42)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, cv.width, cv.height);
  }
};
})();
