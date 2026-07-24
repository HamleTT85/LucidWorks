// Welt-Geometrie: Perimeter-Klettern auf Raumgrenze (innen) und Möbeln (außen)
AR.World = {
  // ---- Rechteck-Perimeter-Mathematik ----
  // Parameter p läuft im Uhrzeigersinn (Möbel/außen) bzw. so, dass die Spinne
  // immer "auf" der Fläche steht. Segmente:
  // OUTER (Möbel): top L->R | right T->B | bottom R->L | left B->T
  // INNER (Raum):  floor L->R | right wall B->T | ceiling R->L | left wall T->B
  perim(rect) { return 2 * (rect.w + rect.h); },

  pointAt(rect, p, inner) {
    const { x, y, w, h } = rect;
    const P = this.perim(rect);
    p = ((p % P) + P) % P;
    if (!inner) {
      if (p < w) return { x: x + p, y: y, nx: 0, ny: -1 };                       // top
      p -= w;
      if (p < h) return { x: x + w, y: y + p, nx: 1, ny: 0 };                    // right
      p -= h;
      if (p < w) return { x: x + w - p, y: y + h, nx: 0, ny: 1 };                // bottom
      p -= w;
      return { x: x, y: y + h - p, nx: -1, ny: 0 };                              // left
    } else {
      if (p < w) return { x: x + p, y: y + h, nx: 0, ny: -1 };                   // floor
      p -= w;
      if (p < h) return { x: x + w, y: y + h - p, nx: -1, ny: 0 };               // right wall
      p -= h;
      if (p < w) return { x: x + w - p, y: y, nx: 0, ny: 1 };                    // ceiling
      p -= w;
      return { x: x, y: y + p, nx: 1, ny: 0 };                                   // left wall
    }
  },

  tangentAt(rect, p, inner) {
    const a = this.pointAt(rect, p, inner);
    const b = this.pointAt(rect, p + 2, inner);
    let tx = b.x - a.x, ty = b.y - a.y;
    const l = Math.hypot(tx, ty) || 1;
    return { x: tx / l, y: ty / l };
  },

  closestParam(rect, px, py, inner) {
    // Segmente einzeln prüfen
    const { x, y, w, h } = rect;
    const cl = (v, a, b) => Math.max(a, Math.min(b, v));
    let best = null, bestD = Infinity, bestP = 0;
    const segs = !inner ? [
      { p0: 0,        pt: t => ({ x: x + t, y: y }),          len: w, coord: () => cl(px - x, 0, w) },
      { p0: w,        pt: t => ({ x: x + w, y: y + t }),      len: h, coord: () => cl(py - y, 0, h) },
      { p0: w + h,    pt: t => ({ x: x + w - t, y: y + h }),  len: w, coord: () => cl(x + w - px, 0, w) },
      { p0: 2*w + h,  pt: t => ({ x: x, y: y + h - t }),      len: h, coord: () => cl(y + h - py, 0, h) },
    ] : [
      { p0: 0,        pt: t => ({ x: x + t, y: y + h }),      len: w, coord: () => cl(px - x, 0, w) },
      { p0: w,        pt: t => ({ x: x + w, y: y + h - t }),  len: h, coord: () => cl(y + h - py, 0, h) },
      { p0: w + h,    pt: t => ({ x: x + w - t, y: y }),      len: w, coord: () => cl(x + w - px, 0, w) },
      { p0: 2*w + h,  pt: t => ({ x: x, y: y + t }),          len: h, coord: () => cl(py - y, 0, h) },
    ];
    for (const s of segs) {
      const t = s.coord();
      const q = s.pt(t);
      const d = (q.x - px) ** 2 + (q.y - py) ** 2;
      if (d < bestD) { bestD = d; bestP = s.p0 + t; best = q; }
    }
    return { p: bestP, d: Math.sqrt(bestD), pt: best };
  },

  // Welche Oberfläche ist einem Punkt am nächsten? (Raum + Möbel)
  nearestSurface(biome, px, py, maxDist) {
    const room = { x: 0, y: 0, w: AR.CONF.WORLD_W, h: AR.CONF.WORLD_H };
    let best = { rect: room, inner: true, ...this.closestParam(room, px, py, true) };
    for (const f of biome.furniture) {
      const c = this.closestParam(f, px, py, false);
      if (c.d < best.d) best = { rect: f, inner: false, ...c };
    }
    if (maxDist !== undefined && best.d > maxDist) return null;
    return best;
  },

  // Kollision eines Punkts mit Möbeln (fürs Fallen)
  insideFurniture(biome, px, py, pad) {
    pad = pad || 0;
    for (const f of biome.furniture) {
      if (px > f.x - pad && px < f.x + f.w + pad && py > f.y - pad && py < f.y + f.h + pad) return f;
    }
    return null;
  },

  inHazard(biome, px, py) {
    if (!biome.hazards) return null;
    for (const hz of biome.hazards) {
      if (px > hz.x && px < hz.x + hz.w && py > hz.y && py < hz.y + hz.h) return hz;
    }
    return null;
  },

  // Höhenstufe einer y-Koordinate (1 = bodennah, 3 = deckennah)
  heightLevel(y) {
    const H = AR.CONF.WORLD_H;
    if (y > H * 0.62) return 1;
    if (y > H * 0.3) return 2;
    return 3;
  },
};
