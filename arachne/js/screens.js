// Overlay-Screens: Titel, Charakterwahl, Tod, Sieg, Perk-Modal
AR.Screens = {
  init() {
    document.getElementById('btn-start').addEventListener('click', () => {
      AR.Audio.init(); AR.Audio.resume(); AR.Audio.click();
      document.getElementById('screen-title').classList.add('hidden');
      if (AR.Save.data.charId) AR.Main.toNexus();
      else this.showCharSelect(false);
    });
    document.getElementById('btn-char-back').addEventListener('click', () => {
      AR.Audio.click();
      document.getElementById('screen-charselect').classList.add('hidden');
      if (AR.Save.data.charId) AR.Main.toNexus();
      else document.getElementById('screen-title').classList.remove('hidden');
    });
    document.getElementById('btn-to-nexus').addEventListener('click', () => {
      AR.Audio.click();
      document.getElementById('screen-death').classList.add('hidden');
      AR.Main.toNexus();
    });
    document.getElementById('btn-victory-nexus').addEventListener('click', () => {
      AR.Audio.click();
      document.getElementById('screen-victory').classList.add('hidden');
      AR.Main.toNexus();
    });
    document.getElementById('btn-retreat').addEventListener('click', () => {
      if (AR.Main.run) AR.Main.run.retreat();
    });
    document.getElementById('btn-perk-take').addEventListener('click', () => {
      const run = AR.Main.run;
      if (!run || !run.pendingPerk) return;
      run.applyPerk(run.pendingPerk);
      this.closePerkModal(run);
    });
    document.getElementById('btn-perk-reroll').addEventListener('click', () => {
      const run = AR.Main.run;
      if (!run || run.rerollsLeft <= 0) { AR.Audio.denied(); return; }
      run.rerollsLeft--;
      run.pendingPerk = run.rollPerk(run.pendingPrey.pool);
      AR.Audio.click();
      this.renderPerkCard(run);
    });

    const hint = 'ontouchstart' in window
      ? 'Joystick links · ⬈ Sprung/Faden · 🕸️ Bauen & Sammeln · 🧊 Erstarren'
      : 'WASD/Pfeile · Space = Sprung/Faden · E = Bauen & Sammeln · Shift = Erstarren';
    document.getElementById('title-hint').textContent =
      hint + ' — Auf der Decke: Joystick ↓ + Sprung = Abseilen';
  },

  showCharSelect(fromNexus) {
    const root = document.getElementById('char-cards');
    root.innerHTML = '';
    for (const c of AR.CHARACTERS) {
      const card = document.createElement('div');
      card.className = 'char-card';
      const bar = v => `<div class="bar"><i style="width:${v * 20}%"></i></div>`;
      card.innerHTML = `
        <div class="portrait" style="background-image:url('assets/img/${c.img}.png')"></div>
        <h4>${c.name}</h4><div class="role">${c.species} · ${c.role}</div>
        <div class="statbars">
          <div class="statrow"><span class="lbl">Movement</span>${bar(c.stats.mov)}</div>
          <div class="statrow"><span class="lbl">WebGen</span>${bar(c.stats.web)}</div>
          <div class="statrow"><span class="lbl">Resource</span>${bar(c.stats.res)}</div>
          <div class="statrow"><span class="lbl">Survival</span>${bar(c.stats.sur)}</div>
        </div>
        <div class="sig"><b>★ ${c.sigName}:</b> ${c.sigDesc}</div>`;
      card.addEventListener('click', () => {
        AR.Audio.buy();
        AR.Save.data.charId = c.id;
        AR.Save.save();
        document.getElementById('screen-charselect').classList.add('hidden');
        AR.Main.toNexus();
      });
      root.appendChild(card);
    }
    document.getElementById('screen-charselect').classList.remove('hidden');
  },

  CAUSES: {
    stomp: ['ZERTRETEN', 'Ein Stiefel. Ein dumpfer Schlag. Dunkelheit. Der Boden ist kein Ort für Spinnen.'],
    swat: ['ZERKLATSCHT', 'Der Pantoffel kam schneller als deine acht Beine. Die Wand war keine gute Idee.'],
    vacuum: ['EINGESAUGT', 'Das Brüllen des Staubsaugers war das Letzte, was du gehört hast. Nichts überlebt den Beutel.'],
    hand: ['ZERQUETSCHT', 'Die Hand kannte keine Gnade. Kein Glas, kein Papier — heute nicht.'],
    water: ['ERTRUNKEN', 'Acht Beine, aber keine Schwimmflügel. Das Wasser hat dich geholt.'],
    boss_rat: ['GEFRESSEN', 'RATTUS war schneller. Im Keller herrscht weiter der Kellerschreck.'],
    boss_centipede: ['ÜBERRANNT', 'Hundert Beine gegen deine acht. SKOLOPENDRA herrscht weiter im Abfluss.'],
    boss_cat: ['ZERSPIELT', 'Für MAUZI warst du nur ein Spielzeug. Katzen spielen nicht sanft.'],
  },

  showDeath(run, cause) {
    document.getElementById('hud').classList.add('hidden');
    const [title, text] = this.CAUSES[cause] || ['GESTORBEN', 'Das Spinnenleben ist kurz und gefährlich.'];
    document.getElementById('death-title').textContent = title;
    document.getElementById('death-cause').textContent = text;
    document.getElementById('death-stats').innerHTML = `
      <div class="dstat"><span>Überlebt</span><b>${Math.floor(run.time)} s</b></div>
      <div class="dstat"><span>Beute verdaut</span><b>${run.preyCount}</b></div>
      <div class="dstat"><span>Netze gebaut</span><b>${run.webs.length}</b></div>
      <div class="dstat"><span>Perks gesammelt</span><b>${run.perks.length}</b></div>
      <div class="dstat"><span>Seidenessenz in den Nexus</span><b>+${run.essence} 🕸️</b></div>
      ${AR.Save.data.pantry ? '<div class="dstat"><span>🍯 Nahrungsspeicher</span><b>1 Beute gerettet!</b></div>' : ''}`;
    document.getElementById('screen-death').classList.remove('hidden');
  },

  showVictory(run) {
    document.getElementById('hud').classList.add('hidden');
    const boss = run.boss.def;
    const gate = AR.BOSS_GATES.find(g => g.boss === boss.id);
    const next = boss.id === 'rat' ? 'Das BADEZIMMER und Skilltree-Tier 2 sind freigeschaltet!'
      : boss.id === 'centipede' ? 'Das WOHNZIMMER und Skilltree-Tier 3 sind freigeschaltet!'
      : 'Der EWIGE SOMMER (Endlos-Modus) ist freigeschaltet — du hast das Haus erobert!';
    document.getElementById('victory-title').textContent = boss.name.split(',')[0] + ' BEZWUNGEN!';
    document.getElementById('victory-text').textContent = next;
    document.getElementById('victory-stats').innerHTML = `
      <div class="dstat"><span>Kampfdauer</span><b>${Math.floor(run.time)} s</b></div>
      <div class="dstat"><span>Seidenessenz in den Nexus</span><b>+${run.essence} 🕸️</b></div>`;
    document.getElementById('screen-victory').classList.remove('hidden');
  },

  showPerkModal(run) {
    this.renderPerkCard(run);
    document.getElementById('screen-perk').classList.remove('hidden');
  },

  renderPerkCard(run) {
    const p = run.pendingPerk;
    const card = document.getElementById('perk-card');
    card.className = 'r-' + p.rarity;
    card.innerHTML = `
      <div class="p-icon">${p.icon}</div>
      <div class="p-name">${p.name}</div>
      <div class="p-desc">${p.desc}</div>
      <div class="p-rarity">${{common:'Gewöhnlich',rare:'Selten',epic:'Episch'}[p.rarity]}</div>`;
    const btn = document.getElementById('btn-perk-reroll');
    document.getElementById('reroll-count').textContent = run.rerollsLeft;
    btn.disabled = run.rerollsLeft <= 0;
    btn.style.display = run.stats.rerolls > 0 ? '' : 'none';
  },

  closePerkModal(run) {
    document.getElementById('screen-perk').classList.add('hidden');
    run.pendingPerk = null;
    run.paused = false;
  },
};
