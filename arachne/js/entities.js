// Entities: Spinne, Netze, Beute, Partikel
(function(){
const W = () => AR.World, C = () => AR.CONF;

// ---------- Spinne ----------
AR.Spider = class {
  constructor(char, stats, biome) {
    this.char = char; this.stats = stats; this.biome = biome;
    this.r = 26 * char.scale;
    this.mode = 'surface';
    const room = { x:0, y:0, w:C().WORLD_W, h:C().WORLD_H };
    this.surf = { rect: room, inner: true, p: C().WORLD_W / 2 };  // Mitte des Bodens
    this.x = 0; this.y = 0; this.vx = 0; this.vy = 0;
    this.thread = null;         // { ax, ay, len }
    this.facing = 1;
    this.angle = 0;
    this.walkPhase = 0;
    this.moving = false;
    this.stunned = 0;
    this.frozen = false;
    this.playDeadLeft = stats.playdead ? 1 : 0;
    this.invuln = 0;
    this.adrenaline = 0;        // Jago
    this.armor = 0;             // Chitin-Perk
    this.bristles = char.sig === 'bristles' ? 1 : 0;
    this.tint = null;
    this.airTime = 0;
    this.syncPos();
  }

  syncPos() {
    const q = W().pointAt(this.surf.rect, this.surf.p, this.surf.inner);
    this.x = q.x + q.nx * this.r * .9;
    this.y = q.y + q.ny * this.r * .9;
    this.normal = { x: q.nx, y: q.ny };
    this.angle = Math.atan2(q.nx, -q.ny);
  }

  onCeiling() { return this.mode === 'surface' && this.normal && this.normal.y > .5; }
  onFloorish() { return this.mode === 'surface' && this.normal && this.normal.y < -.5; }
  onWall() { return this.mode === 'surface' && this.normal && Math.abs(this.normal.x) > .5; }

  speedNow(run) {
    let s = this.stats.speed * (1 + (run.perkMods.speed || 0));
    if (this.onWall() || this.onCeiling()) {
      s *= this.stats.ceiling ? 1 : C().CLIMB_FACTOR;
      if (this.onWall()) s *= 1 + this.stats.wallSprint;
    }
    if (this.adrenaline > 0) s *= 1.6;
    if (run.webAt(this.x, this.y)) s *= (1 - .45) * (1 + this.stats.webSprint); // Netz bremst, außer Netzsprinter
    if (this.frozen) s = 0;
    return s;
  }

  update(dt, run) {
    const v = AR.Input.vec();
    if (this.stunned > 0) { this.stunned -= dt; return; }
    if (this.invuln > 0) this.invuln -= dt;
    if (this.adrenaline > 0) this.adrenaline -= dt;

    if (this.mode === 'surface') {
      const t = W().tangentAt(this.surf.rect, this.surf.p, this.surf.inner);
      let d = v.x * t.x + v.y * t.y;
      // Ecken-Assistenz: Input zeigt "um die Ecke" (z.B. Hoch-Drücken am
      // Fuß der Wand) -> in die Richtung bewegen, deren nahe Tangente passt
      if (Math.abs(d) < .25 && Math.hypot(v.x, v.y) > .3) {
        const ta = W().tangentAt(this.surf.rect, this.surf.p + 48, this.surf.inner);
        const tb = W().tangentAt(this.surf.rect, this.surf.p - 48, this.surf.inner);
        const da = v.x * ta.x + v.y * ta.y;
        const db = -(v.x * tb.x + v.y * tb.y);
        if (Math.max(da, db) > .4) d = da >= db ? .8 : -.8;
      }
      const sp = this.speedNow(run);
      this.moving = Math.abs(d) > .15;
      if (this.moving) {
        this.surf.p += d * sp * dt;
        this.walkPhase += dt * sp * .13;
        this.facing = d >= 0 ? 1 : -1;
        if (!(run.perkMods.silent) && this.onFloorish()) run.addNoise(dt * Math.abs(d) * 1.4);
      }
      this.syncPos();
    }
    else if (this.mode === 'air') {
      this.airTime += dt;
      this.vy += C().GRAVITY * dt;
      this.vx += v.x * 320 * dt;               // Luftkontrolle
      this.x += this.vx * dt; this.y += this.vy * dt;
      this.angle = Math.atan2(this.vx, 900) * .5;

      // Beute anspringen (Springspinne)
      if (this.char.sig === 'pounce') {
        const p = run.freePreyAt(this.x, this.y, this.r + 20);
        if (p) run.pounceCatch(p);
      }

      // Landen?
      const hit = this.collide(run);
      if (hit) {
        this.mode = 'surface';
        this.surf = hit;
        this.syncPos();
        AR.Audio.land();
        run.fx.burst(this.x, this.y, '#9ab', 6);
        const fallStun = this.airTime > 1.05 && !(run.perkMods.noStun);
        if (fallStun) this.stunned = C().STUN_TIME * (1 - this.stats.fallResist);
        this.airTime = 0;
      }
      // Wasser?
      const hz = W().inHazard(this.biome, this.x, this.y);
      if (hz) run.kill('water');
    }
    else if (this.mode === 'thread') {
      const th = this.thread;
      const sp = this.stats.speed * .8;
      if (Math.abs(v.y) > .2) {
        th.len += v.y * sp * dt;
        if (v.y > 0) run.spendSilk(C().THREAD_COST_PER_S * dt * this.stats.silkCostMul * (1 + (run.perkMods.silkCost || 0)));
      }
      th.len = Math.max(4, Math.min(th.len, C().WORLD_H - th.ay - 30));
      this.x = th.ax + Math.sin(performance.now() / 600 + th.len * .01) * 6;
      this.y = th.ay + th.len;
      this.angle = 0;
      if (th.len <= 6) {   // wieder oben angekommen
        const s = W().nearestSurface(this.biome, th.ax, th.ay, 60);
        if (s) { this.mode = 'surface'; this.surf = s; this.thread = null; this.syncPos(); }
      }
    }
  }

  collide(run) {
    const b = this.biome, pad = this.r * .5;
    // Raumgrenzen
    if (this.x < pad || this.x > C().WORLD_W - pad || this.y < pad || this.y > C().WORLD_H - pad) {
      this.x = Math.max(pad, Math.min(C().WORLD_W - pad, this.x));
      this.y = Math.max(pad, Math.min(C().WORLD_H - pad, this.y));
      const room = { x:0, y:0, w:C().WORLD_W, h:C().WORLD_H };
      return { rect: room, inner: true, p: W().closestParam(room, this.x, this.y, true).p };
    }
    const f = W().insideFurniture(b, this.x, this.y, pad * .4);
    if (f) {
      const c = W().closestParam(f, this.x, this.y, false);
      return { rect: f, inner: false, p: c.p };
    }
    return null;
  }

  jump(run) {
    if (this.stunned > 0 || this.frozen) return;
    const v = AR.Input.vec();
    if (this.mode === 'thread') { this.detachThread(); return; }
    if (this.mode !== 'surface') return;

    // Auf der Decke + Joystick unten => Abseilen
    if (this.onCeiling() && v.y > .35) {
      this.thread = { ax: this.x, ay: this.y + this.r * .4, len: 12 };
      this.mode = 'thread';
      AR.Audio.silk();
      return;
    }
    const jp = this.stats.jump * (1 + (run.perkMods.jump || 0));
    let jx = v.x, jy = v.y;
    if (Math.hypot(jx, jy) < .25) { jx = this.normal.x; jy = this.normal.y; }
    const l = Math.hypot(jx, jy) || 1;
    this.vx = jx / l * jp; this.vy = jy / l * jp;
    this.mode = 'air'; this.airTime = 0;
    AR.Audio.jump();
    if (!(run.perkMods.silent)) run.addNoise(2);
  }

  detachThread() {
    this.mode = 'air'; this.thread = null;
    this.vx = 0; this.vy = 40; this.airTime = 0;
  }

  draw(ctx, run) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Abseilfaden
    if (this.mode === 'thread' && this.thread) {
      ctx.strokeStyle = 'rgba(210,240,245,.75)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(this.thread.ax - this.x, this.thread.ay - this.thread.len - this.y + this.thread.len);
      ctx.lineTo(0, -this.r * .4);
      ctx.stroke();
    }

    ctx.rotate(this.angle);
    ctx.scale(this.facing, 1);
    if (this.moving) ctx.rotate(Math.sin(this.walkPhase) * .06);
    if (this.stunned > 0) ctx.rotate(Math.sin(performance.now() / 50) * .12);
    if (this.invuln > 0 && Math.floor(performance.now() / 90) % 2) ctx.globalAlpha = .35;

    const img = AR.Assets.img[this.char.img];
    const sz = this.r * 2.4;
    let filter = '';
    if (this.tint === 'dark') filter = 'brightness(.55) saturate(.8)';
    if (this.tint === 'gold') filter = 'sepia(.6) saturate(2.2) brightness(1.1)';
    if (this.frozen) filter += ' grayscale(.7) brightness(.8)';
    if (filter) ctx.filter = filter.trim();

    if (AR.Assets.ok(this.char.img)) {
      ctx.drawImage(img, -sz / 2, -sz / 2, sz, sz);
    } else {
      // Prozeduraler Fallback
      ctx.fillStyle = '#3a2c22';
      ctx.beginPath(); ctx.ellipse(0, 0, this.r * .8, this.r * .55, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = '#2a1f18'; ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++) {
        const a = (i - 1.5) * .5;
        ctx.beginPath(); ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * this.r * 1.5, Math.sin(a) * this.r + this.r * .4);
        ctx.moveTo(0, 0);
        ctx.lineTo(-Math.cos(a) * this.r * 1.5, Math.sin(a) * this.r + this.r * .4);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
};

// ---------- Netz ----------
AR.Web = class {
  constructor(spot, run) {
    this.spot = spot;
    this.x = spot.x; this.y = spot.y;
    this.r = 88;
    this.prey = [];            // gefangene Beute
    this.maxPrey = run.char.sig === 'doubleweb' ? 2 : 1;
    this.timer = this.nextCatch(run);
    this.golden = !!run.perkMods.freeWebs;
    this.wobble = Math.random() * 7;
  }

  nextCatch(run) {
    const base = C().WEB_CATCH_BASE / (this.spot.yield || 1);
    return base / (run.stats.catchMul * (1 + (run.perkMods.catchRate || 0))) * (0.75 + Math.random() * .5);
  }

  update(dt, run) {
    if (this.prey.length < this.maxPrey) {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.prey.push(run.rollPrey());
        this.timer = this.nextCatch(run);
        run.fx.burst(this.x, this.y, '#4de8e8', 10);
        AR.Audio.silk();
      }
    }
  }

  draw(ctx, t) {
    ctx.save();
    ctx.translate(this.x, this.y);
    const sway = Math.sin(t / 900 + this.wobble) * .02;
    ctx.rotate(sway);
    const col = this.golden ? 'rgba(255,215,129,' : 'rgba(200,240,245,';
    ctx.lineWidth = 1.1;
    // Speichen
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2;
      ctx.strokeStyle = col + '.5)';
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * this.r, Math.sin(a) * this.r);
      ctx.stroke();
    }
    // Spirale
    ctx.strokeStyle = col + '.35)';
    for (let ring = 1; ring <= 4; ring++) {
      const rr = this.r * ring / 4.4;
      ctx.beginPath();
      for (let i = 0; i <= 8; i++) {
        const a = i / 8 * Math.PI * 2;
        const px = Math.cos(a) * rr, py = Math.sin(a) * rr * (1 + Math.sin(a * 3 + this.wobble) * .04);
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.stroke();
    }
    // Glow im Zentrum, wenn Beute wartet
    if (this.prey.length) {
      const pulse = .5 + Math.sin(t / 300) * .3;
      ctx.fillStyle = `rgba(77,232,232,${.14 * pulse})`;
      ctx.beginPath(); ctx.arc(0, 0, 42, 0, 7); ctx.fill();
      this.prey.forEach((pr, i) => {
        const img = AR.Assets.img[pr.img];
        const s = 46 * pr.scale + 14;
        const ox = (i - (this.prey.length - 1) / 2) * 34;
        const wig = Math.sin(t / 120 + i * 2) * .1;
        ctx.save(); ctx.translate(ox, 0); ctx.rotate(wig);
        if (AR.Assets.ok(pr.img)) ctx.drawImage(img, -s/2, -s/2, s, s);
        else { ctx.fillStyle = '#8a7'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, 7); ctx.fill(); }
        ctx.restore();
      });
    }
    ctx.restore();
  }
};

// ---------- Freifliegende Beute ----------
AR.FreePrey = class {
  constructor(def) {
    this.def = def;
    this.x = 200 + Math.random() * (C().WORLD_W - 400);
    this.y = 120 + Math.random() * (C().WORLD_H - 400);
    this.t = Math.random() * 100;
    this.vx = 0; this.vy = 0;
  }
  update(dt) {
    this.t += dt;
    this.vx = Math.sin(this.t * 1.7) * 90 + Math.sin(this.t * .43) * 60;
    this.vy = Math.cos(this.t * 2.1) * 70;
    this.x += this.vx * dt; this.y += this.vy * dt;
    this.x = Math.max(80, Math.min(C().WORLD_W - 80, this.x));
    this.y = Math.max(80, Math.min(C().WORLD_H - 200, this.y));
  }
  draw(ctx, t) {
    const img = AR.Assets.img[this.def.img];
    const s = 40 * this.def.scale + 12;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.sin(this.t * 8) * .15);
    ctx.scale(this.vx >= 0 ? 1 : -1, 1);
    if (this.def.id === 'firefly') {
      const pulse = .5 + Math.sin(t / 200) * .5;
      ctx.fillStyle = `rgba(77,232,232,${.25 * pulse})`;
      ctx.beginPath(); ctx.arc(0, 0, 26, 0, 7); ctx.fill();
    }
    if (AR.Assets.ok(this.def.img)) ctx.drawImage(img, -s/2, -s/2, s, s);
    else { ctx.fillStyle = '#999'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, 7); ctx.fill(); }
    ctx.restore();
  }
};

// ---------- Partikel ----------
AR.FX = class {
  constructor() { this.list = []; }
  burst(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = 40 + Math.random() * 160;
      this.list.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: .5 + Math.random() * .5, max: 1, color, r: 2 + Math.random() * 3 });
    }
  }
  update(dt) {
    for (const p of this.list) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; p.life -= dt; }
    this.list = this.list.filter(p => p.life > 0);
  }
  draw(ctx) {
    for (const p of this.list) {
      ctx.globalAlpha = Math.max(0, p.life / p.max) * .8;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
};
})();
