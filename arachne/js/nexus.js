// Der Nexus: Blaupausen-Terminal (Skilltree), Teleport, Spinnen-Info
AR.Nexus = {
  show() {
    document.getElementById('screen-nexus').classList.remove('hidden');
    document.getElementById('hud').classList.add('hidden');
    this.renderAll();
  },
  hide() { document.getElementById('screen-nexus').classList.add('hidden'); },

  init() {
    document.querySelectorAll('.ntab').forEach(tab => {
      tab.addEventListener('click', () => {
        AR.Audio.click();
        document.querySelectorAll('.ntab').forEach(x => x.classList.remove('active'));
        tab.classList.add('active');
        for (const p of ['skills','teleport','spider']) {
          document.getElementById('nexus-panel-' + p).classList.toggle('hidden', p !== tab.dataset.tab);
        }
      });
    });
    document.getElementById('btn-change-char').addEventListener('click', () => {
      AR.Audio.click();
      this.hide();
      AR.Screens.showCharSelect(true);
    });
  },

  renderAll() {
    document.getElementById('nexus-essence').textContent = AR.Save.data.essence.toLocaleString('de-DE');
    this.renderTree();
    this.renderTeleport();
    this.renderSpider();
  },

  nodeCost(node, lvl) { return Math.round(node.cost * Math.pow(1.6, lvl)); },

  canBuy(node) {
    const s = AR.Save;
    const lvl = s.nodeLevel(node.id);
    if (lvl >= node.max) return false;
    if (node.tier > s.maxUnlockedTier()) return false;
    if (node.req && !s.nodeLevel(node.req)) return false;
    return s.data.essence >= this.nodeCost(node, lvl);
  },

  renderTree() {
    const root = document.getElementById('skill-tree');
    root.innerHTML = '';
    const s = AR.Save;
    const maxTier = s.maxUnlockedTier();
    const stats = s.data.charId ? s.buildStats(AR.CHARACTERS.find(c => c.id === s.data.charId)) : null;

    for (const branch of ['mov','web','res','sur']) {
      const meta = AR.BRANCH_META[branch];
      const col = document.createElement('div');
      col.className = 'branch';
      const base = stats ? stats.base[branch] : '–';
      col.innerHTML = `<h4>${meta.icon} ${meta.name}</h4>
        <div class="basestat">Grundwert: ${base} · ${meta.statDesc}</div>`;

      for (let tier = 1; tier <= 3; tier++) {
        const tl = document.createElement('div');
        tl.className = 'tier-label';
        tl.textContent = `— TIER ${tier}${tier > maxTier ? ' 🔒' : ''} —`;
        col.appendChild(tl);
        const wrap = document.createElement('div');
        if (tier > maxTier) wrap.className = 'tier-locked';
        for (const node of AR.TREE.filter(n => n.branch === branch && n.tier === tier)) {
          wrap.appendChild(this.nodeEl(node, tier > maxTier));
        }
        col.appendChild(wrap);

        // Boss-Gate nach diesem Tier (in jedem Strang als Hinweis, klickbar)
        const gate = AR.BOSS_GATES.find(g => g.afterTier === tier);
        if (gate && tier <= 3) {
          const defeated = !!s.data.bosses[gate.boss];
          const g = document.createElement('div');
          g.className = 'node bossnode' + (defeated ? ' defeated' : '');
          g.innerHTML = `<div class="n-name">${defeated ? '✓ ' : '⚔ '}${gate.name}</div>` +
            (defeated ? '' : `<div class="n-desc">${gate.desc}</div>`);
          if (!defeated && s.biomeUnlocked(gate.biome)) {
            g.addEventListener('click', () => {
              AR.Audio.click();
              AR.Main.startRun(gate.biome, true);
            });
            g.querySelector('.n-desc').innerHTML += '<br><b style="color:#e85a4d">▶ Zum Bossfight teleportieren</b>';
          }
          col.appendChild(g);
        }
      }
      root.appendChild(col);
    }
  },

  nodeEl(node, tierLocked) {
    const s = AR.Save;
    const lvl = s.nodeLevel(node.id);
    const cost = this.nodeCost(node, lvl);
    const maxed = lvl >= node.max;
    const reqMissing = node.req && !s.nodeLevel(node.req);
    const el = document.createElement('div');
    el.className = 'node' +
      (maxed ? ' maxed' : '') +
      (tierLocked || reqMissing ? ' locked' : (this.canBuy(node) ? ' affordable' : ''));
    el.style.marginBottom = '.45rem';
    el.innerHTML = `
      <div class="n-lvl">${lvl}/${node.max}</div>
      <div class="n-name">${node.kind === 'plus' ? '＋ ' : '★ '}${node.name}</div>
      <div class="n-desc">${node.desc}${reqMissing ? ' <i>(benötigt Vorstufe)</i>' : ''}</div>
      <div class="n-cost">${maxed ? 'MAX' : '🕸️ ' + cost.toLocaleString('de-DE')}</div>`;
    if (!maxed && !tierLocked && !reqMissing) {
      el.addEventListener('click', () => {
        if (!this.canBuy(node)) { AR.Audio.denied(); return; }
        s.data.essence -= cost;
        s.data.tree[node.id] = lvl + 1;
        s.save();
        AR.Audio.buy();
        this.renderAll();
      });
    }
    return el;
  },

  renderTeleport() {
    const root = document.getElementById('teleport-list');
    root.innerHTML = '';
    const s = AR.Save;
    for (const b of Object.values(AR.BIOMES)) {
      const unlocked = s.biomeUnlocked(b.id);
      const bossDead = !!s.data.bosses[b.boss];
      const card = document.createElement('div');
      card.className = 'tp-card' + (unlocked ? '' : ' locked');
      card.innerHTML = `
        <div class="tp-thumb" style="background-image:url('assets/img/${b.bg}.jpg')"></div>
        <div>
          <h4>${b.name} ${bossDead ? '👑' : ''}</h4>
          <div class="tp-diff">${b.diff}</div>
          <p>${unlocked ? b.desc : '🔒 Besiege den vorherigen Boss, um dieses Biom freizuschalten.'}</p>
        </div>`;
      if (unlocked) {
        card.addEventListener('click', () => { AR.Audio.click(); AR.Main.startRun(b.id, false); });
        if (!bossDead) {
          const btn = document.createElement('button');
          btn.className = 'btn-ghost bossbtn';
          btn.textContent = '⚔ Boss';
          btn.addEventListener('click', ev => {
            ev.stopPropagation();
            AR.Audio.click();
            AR.Main.startRun(b.id, true);
          });
          card.appendChild(btn);
        }
      }
      root.appendChild(card);
    }
    if (s.data.endless) {
      const card = document.createElement('div');
      card.className = 'tp-card';
      card.style.borderColor = 'var(--gold)';
      card.innerHTML = `
        <div class="tp-thumb" style="background-image:url('assets/img/bg_wohnzimmer.jpg');filter:sepia(.5) saturate(1.6)"></div>
        <div><h4 style="color:var(--gold)">☀️ Ewiger Sommer</h4>
        <div class="tp-diff">ENDLOS</div>
        <p>Alle Bosse besiegt! Doppelte Event-Dichte, Essenz ×1,5 — wie lange überlebst du?</p></div>`;
      card.addEventListener('click', () => { AR.Audio.click(); AR.Main.startRun('wohnzimmer', false, true); });
      root.appendChild(card);
    }
  },

  renderSpider() {
    const root = document.getElementById('spider-info');
    const char = AR.CHARACTERS.find(c => c.id === AR.Save.data.charId);
    if (!char) { root.innerHTML = '<p style="color:var(--muted)">Keine Spinne gewählt.</p>'; return; }
    const st = AR.Save.buildStats(char);
    const d = AR.Save.data.stats;
    root.innerHTML = `
      <div class="portrait" style="background-image:url('assets/img/${char.img}.png')"></div>
      <h4>${char.name} · ${char.species}</h4>
      <div class="stats-final">
        <b>${char.sigName}:</b> ${char.sigDesc}<br><br>
        Movement <b>${st.base.mov}</b> · WebGen <b>${st.base.web}</b> ·
        Resource <b>${st.base.res}</b> · Survival <b>${st.base.sur}</b><br>
        Tempo <b>${Math.round(st.speed)}</b> · Seiden-Tank <b>${Math.round(st.silkMax)}</b> ·
        Essenz-Multiplikator <b>×${st.essenceMul.toFixed(2)}</b> · Tarnung <b>${st.camo}</b><br>
        Max. Spot-Höhe <b>${st.maxSpotH}</b> · Rerolls <b>${st.rerolls}</b><br><br>
        Runs <b>${d.runs}</b> · Tode <b>${d.deaths}</b> · Befreiungen <b>${d.freed}</b> ·
        Beute <b>${d.preyEaten}</b> · Essenz gesamt <b>${d.essenceTotal.toLocaleString('de-DE')}</b> ·
        Bester Run <b>${d.bestRun}</b>
      </div>`;
  },
};
