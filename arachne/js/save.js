// Speicherstand (localStorage)
AR.Save = {
  KEY: 'arachne_save_v1',
  data: null,

  fresh() {
    return {
      essence: 0,
      charId: null,
      tree: {},           // nodeId -> level
      bosses: {},         // bossId -> true
      pantry: null,       // gelagerter Perk-Id (Nahrungsspeicher)
      endless: false,
      stats: { runs:0, deaths:0, freed:0, preyEaten:0, essenceTotal:0, bestRun:0 },
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      this.data = raw ? Object.assign(this.fresh(), JSON.parse(raw)) : this.fresh();
    } catch(e) { this.data = this.fresh(); }
    return this.data;
  },

  save() {
    try { localStorage.setItem(this.KEY, JSON.stringify(this.data)); } catch(e) {}
  },

  nodeLevel(id) { return this.data.tree[id] || 0; },

  // Aggregierte Meta-Stats aus Charakter + Skilltree
  buildStats(char) {
    const d = this.data, lvl = id => this.nodeLevel(id);
    const s = { mov:char.stats.mov, web:char.stats.web, res:char.stats.res, sur:char.stats.sur };
    for (const n of AR.TREE) if (n.kind === 'plus' && lvl(n.id) > 0) s[n.branch] += lvl(n.id);
    return {
      base: s,
      speed: AR.CONF.SPIDER_SPEED * (1 + s.mov * 0.09),
      jump: AR.CONF.JUMP_POWER * (1 + s.mov * 0.05),
      silkMax: AR.CONF.SILK_MAX_BASE * (1 + s.web * 0.12)
        * (1 + (lvl('tank1') ? .3 : 0) + (lvl('tank2') ? .6 : 0)),
      silkCostMul: Math.max(.3, 1 - s.web * 0.05 - (lvl('thrifty') ? .25 : 0)),
      catchMul: 1 + s.web * 0.10,
      essenceMul: (1 + s.res * 0.10) * (1 + (lvl('gourmet1') ? .1 : 0) + (lvl('gourmet2') ? .2 : 0)),
      camo: s.sur + (lvl('camo1') ? 2 : 0) + (lvl('camo2') ? 3 : 0),
      warnBonus: s.sur * 0.25,
      maxSpotH: 1 + (lvl('corner1') ? 1 : 0) + (lvl('corner2') ? 1 : 0),
      ceiling: !!lvl('ceiling'),
      wallSprint: lvl('wallsprint') ? .25 : 0,
      fallResist: lvl('fall2') ? 1 : (lvl('fall1') ? .5 : 0),
      rerolls: lvl('reroll3') ? 3 : lvl('reroll2') ? 2 : lvl('reroll1') ? 1 : 0,
      webSprint: lvl('websprint') ? .5 : 0,
      recycler: !!lvl('recycler'),
      goldvein: !!lvl('goldvein'),
      pantry: !!lvl('pantry'),
      playdead: !!lvl('playdead'),
      freedChance: AR.CONF.FREED_BASE + (lvl('lucky1') ? .05 : 0) + (lvl('lucky2') ? .10 : 0),
    };
  },

  // Skilltree-Zugriff
  maxUnlockedTier() {
    let tier = 1;
    for (const g of AR.BOSS_GATES) if (this.data.bosses[g.boss]) tier = g.afterTier + 1;
    return Math.min(tier, 3);
  },

  biomeUnlocked(biomeId) {
    if (biomeId === 'keller') return true;
    if (biomeId === 'bad') return !!this.data.bosses.rat;
    if (biomeId === 'wohnzimmer') return !!this.data.bosses.centipede;
    return false;
  },
};
