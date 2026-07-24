// ARACHNE — Spieldaten & Konstanten
window.AR = window.AR || {};

AR.CONF = {
  WORLD_W: 2100, WORLD_H: 1100,
  SPIDER_SPEED: 150,        // px/s Basis, skaliert mit Movement
  CLIMB_FACTOR: 0.8,        // Wand/Decke relativ zum Boden
  JUMP_POWER: 420,
  GRAVITY: 1150,
  SILK_MAX_BASE: 100,       // Tank, skaliert mit WebGen
  SILK_REGEN: 2.2,          // pro s
  WEB_COST: 34,
  THREAD_COST_PER_S: 3.5,
  WEB_CATCH_BASE: 11,       // s pro Fang, sinkt mit WebGen
  ACTIVITY_RATE: 0.85,      // Menschen-Aktivität pro s (Basis, Biom-skaliert)
  STUN_TIME: 1.1,           // Benommenheit nach hohem Sturz
  FREED_BASE: 0.10,         // Basischance Befreiung bei "Hand"
};

// ---------- Die 5 Spinnen ----------
AR.CHARACTERS = [
  { id:'huntsman', name:'Jago', species:'Riesenkrabbenspinne', role:'Jägerin',
    img:'spider_huntsman', scale:1.0,
    stats:{ mov:5, web:1, res:3, sur:2 },
    sigName:'Adrenalin-Sprint', sig:'adrenaline',
    sigDesc:'Nach jeder Bedrohungswarnung 3 s +60 % Tempo — Flucht ist ihre Waffe.' },
  { id:'orbweaver', name:'Orbelia', species:'Kreuzspinne', role:'Weberin',
    img:'spider_orbweaver', scale:1.0,
    stats:{ mov:2, web:5, res:3, sur:2 },
    sigName:'Meisterweberin', sig:'doubleweb',
    sigDesc:'Ihre Netze halten 2 Beutetiere gleichzeitig statt 1.' },
  { id:'jumper', name:'Pixel', species:'Springspinne', role:'Akrobatin',
    img:'spider_jumper', scale:0.8,
    stats:{ mov:4, web:1, res:2, sur:4 },
    sigName:'Präzisionssprung', sig:'pounce',
    sigDesc:'Springt freifliegende Beute direkt an und erlegt sie ohne Netz.' },
  { id:'widow', name:'Nyx', species:'Schwarze Witwe', role:'Assassine',
    img:'spider_widow', scale:0.9,
    stats:{ mov:2, web:3, res:5, sur:2 },
    sigName:'Giftbiss', sig:'venom',
    sigDesc:'25 % Chance auf doppelte Essenz pro Beute (Gift-Vorverdauung).' },
  { id:'tarantula', name:'Bruno', species:'Vogelspinne', role:'Tank',
    img:'spider_tarantula', scale:1.3,
    stats:{ mov:1, web:2, res:2, sur:5 },
    sigName:'Zähe Borsten', sig:'bristles',
    sigDesc:'Überlebt einmal pro Run einen tödlichen Treffer (nicht den Staubsauger!).' },
];

// ---------- Run-Perks (temporär) ----------
AR.PERKS = [
  { id:'adrenal',  icon:'⚡', rarity:'common', name:'Adrenalinschub', desc:'+12 % Bewegungstempo.', mod:{speed:.12} },
  { id:'glands',   icon:'💧', rarity:'common', name:'Seidendrüsen', desc:'Fäden & Netze kosten 20 % weniger Seide.', mod:{silkCost:-.2} },
  { id:'sticky',   icon:'🕸️', rarity:'common', name:'Klebfäden', desc:'Netze fangen 30 % schneller.', mod:{catchRate:.3} },
  { id:'chitin',   icon:'🛡️', rarity:'rare',  name:'Chitinpanzer', desc:'Überlebt 1 Treffer (nicht den Staubsauger).', mod:{armor:1} },
  { id:'shadow',   icon:'🌑', rarity:'rare',  name:'Schattenhaut', desc:'+2 Tarnung — du wirst sichtbar dunkler.', mod:{camo:2, tint:'dark'} },
  { id:'nighteye', icon:'👁️', rarity:'rare',  name:'Nachtaugen', desc:'Events kündigen sich 2 s früher an.', mod:{warn:2} },
  { id:'fat',      icon:'🍯', rarity:'rare',  name:'Fettreserven', desc:'+25 % Essenz pro Beute.', mod:{essence:.25} },
  { id:'feather',  icon:'🪶', rarity:'epic',  name:'Federleicht', desc:'Keine Sturz-Benommenheit, +40 % Sprungweite.', mod:{noStun:1, jump:.4} },
  { id:'phantom',  icon:'👻', rarity:'epic',  name:'Phantomläufer', desc:'Laufen erzeugt keine Aufmerksamkeit.', mod:{silent:1} },
  { id:'golden',   icon:'✨', rarity:'epic',  name:'Goldene Spinnwarzen', desc:'Netzbau kostenlos — Netze glitzern golden.', mod:{freeWebs:1, tint:'gold'} },
];
AR.RARITY_W = { common:60, rare:32, epic:8 };

// ---------- Beute ----------
AR.PREY = [
  { id:'fly',     img:'prey_fly',     name:'Fliege',        w:46, essence:8,  scale:.5,  pool:['common'] },
  { id:'moth',    img:'prey_moth',    name:'Motte',         w:26, essence:14, scale:.7,  pool:['common','rare'] },
  { id:'beetle',  img:'prey_beetle',  name:'Käfer',         w:20, essence:18, scale:.55, pool:['rare'] },
  { id:'firefly', img:'prey_firefly', name:'Glühwürmchen',  w:8,  essence:40, scale:.5,  pool:['epic'] },
];

// ---------- Skilltree: 4 Stränge × 3 Tiers ----------
// kind: 'plus' (+1 Grundwert) | 'special' | 'boss' (Gate)
AR.TREE = [
  // MOVEMENT
  { id:'mov_p1', branch:'mov', tier:1, kind:'plus', name:'Flinke Beine I', max:3, cost:30,
    desc:'+1 Movement pro Stufe.' },
  { id:'corner1', branch:'mov', tier:1, kind:'special', name:'Eckenkletterer I', max:1, cost:80,
    desc:'Netz-Spots auf Höhe 2 werden erreichbar — versteckter, sicherer.' },
  { id:'fall1', branch:'mov', tier:1, kind:'special', name:'Fallgeschick I', max:1, cost:60,
    desc:'Sturz-Benommenheit halbiert.' },
  { id:'mov_p2', branch:'mov', tier:2, kind:'plus', name:'Flinke Beine II', max:3, cost:90,
    desc:'+1 Movement pro Stufe.' },
  { id:'corner2', branch:'mov', tier:2, kind:'special', name:'Eckenkletterer II', max:1, cost:220,
    desc:'Höhe-3-Spots: die sichersten Netzecken des Hauses.' },
  { id:'ceiling', branch:'mov', tier:2, kind:'special', name:'Deckenläufer', max:1, cost:180,
    desc:'Volles Tempo an Wand und Decke.' },
  { id:'mov_p3', branch:'mov', tier:3, kind:'plus', name:'Flinke Beine III', max:4, cost:220,
    desc:'+1 Movement pro Stufe.' },
  { id:'fall2', branch:'mov', tier:3, kind:'special', name:'Fallgeschick II', max:1, cost:380,
    desc:'Nie mehr benommen nach Stürzen.' },
  { id:'wallsprint', branch:'mov', tier:3, kind:'special', name:'Wandsprinter', max:1, cost:420,
    desc:'+25 % Tempo an Wänden.' },

  // WEBGENERATION
  { id:'web_p1', branch:'web', tier:1, kind:'plus', name:'Starke Drüsen I', max:3, cost:30,
    desc:'+1 WebGen pro Stufe.' },
  { id:'reroll1', branch:'web', tier:1, kind:'special', name:'Neuwürfeln I', max:1, cost:100,
    desc:'1× pro Beute: missfallenden Perk neu würfeln.' },
  { id:'tank1', branch:'web', tier:1, kind:'special', name:'Dichte Seide I', max:1, cost:70,
    desc:'+30 % Seiden-Tank.' },
  { id:'web_p2', branch:'web', tier:2, kind:'plus', name:'Starke Drüsen II', max:3, cost:90,
    desc:'+1 WebGen pro Stufe.' },
  { id:'reroll2', branch:'web', tier:2, kind:'special', name:'Neuwürfeln II', max:1, cost:260,
    desc:'2 Rerolls pro Beute.', req:'reroll1' },
  { id:'websprint', branch:'web', tier:2, kind:'special', name:'Netzsprinter', max:1, cost:200,
    desc:'+50 % Tempo auf dem eigenen Netz.' },
  { id:'web_p3', branch:'web', tier:3, kind:'plus', name:'Starke Drüsen III', max:4, cost:220,
    desc:'+1 WebGen pro Stufe.' },
  { id:'reroll3', branch:'web', tier:3, kind:'special', name:'Neuwürfeln III', max:1, cost:520,
    desc:'3 Rerolls pro Beute — Endgame-Luxus.', req:'reroll2' },
  { id:'tank2', branch:'web', tier:3, kind:'special', name:'Dichte Seide II', max:1, cost:400,
    desc:'+60 % Seiden-Tank.', req:'tank1' },

  // RESOURCE
  { id:'res_p1', branch:'res', tier:1, kind:'plus', name:'Verdauung I', max:3, cost:30,
    desc:'+1 Resource pro Stufe.' },
  { id:'gourmet1', branch:'res', tier:1, kind:'special', name:'Feinschmecker I', max:1, cost:80,
    desc:'+10 % Essenz aus Beute.' },
  { id:'res_p2', branch:'res', tier:2, kind:'plus', name:'Verdauung II', max:3, cost:90,
    desc:'+1 Resource pro Stufe.' },
  { id:'thrifty', branch:'res', tier:2, kind:'special', name:'Sparsame Drüsen', max:1, cost:240,
    desc:'−25 % Seidenverbrauch.' },
  { id:'gourmet2', branch:'res', tier:2, kind:'special', name:'Feinschmecker II', max:1, cost:200,
    desc:'+20 % Essenz aus Beute.', req:'gourmet1' },
  { id:'res_p3', branch:'res', tier:3, kind:'plus', name:'Verdauung III', max:4, cost:220,
    desc:'+1 Resource pro Stufe.' },
  { id:'recycler', branch:'res', tier:3, kind:'special', name:'Verwerter', max:1, cost:380,
    desc:'Zerstörte Netze erstatten 50 % Seide.' },
  { id:'goldvein', branch:'res', tier:3, kind:'special', name:'Goldader', max:1, cost:450,
    desc:'Glühwürmchen erscheinen 50 % häufiger.' },

  // SURVIVAL
  { id:'sur_p1', branch:'sur', tier:1, kind:'plus', name:'Instinkte I', max:3, cost:30,
    desc:'+1 Survival pro Stufe.' },
  { id:'camo1', branch:'sur', tier:1, kind:'special', name:'Meistertarnung I', max:1, cost:80,
    desc:'+2 Tarnung — Menschen entdecken dich später.' },
  { id:'sur_p2', branch:'sur', tier:2, kind:'plus', name:'Instinkte II', max:3, cost:90,
    desc:'+1 Survival pro Stufe.' },
  { id:'pantry', branch:'sur', tier:2, kind:'special', name:'Nahrungsspeicher', max:1, cost:260,
    desc:'1 gelagerte Beute übersteht den Tod → Start-Perk im nächsten Run.' },
  { id:'lucky1', branch:'sur', tier:2, kind:'special', name:'Glückspilz I', max:1, cost:180,
    desc:'Befreiungschance bei der Hand +5 %.' },
  { id:'sur_p3', branch:'sur', tier:3, kind:'plus', name:'Instinkte III', max:4, cost:220,
    desc:'+1 Survival pro Stufe.' },
  { id:'playdead', branch:'sur', tier:3, kind:'special', name:'Totstellen', max:1, cost:420,
    desc:'Bei Entdeckung: 2 s unverwundbar erstarren (1×/Run).' },
  { id:'camo2', branch:'sur', tier:3, kind:'special', name:'Meistertarnung II', max:1, cost:380,
    desc:'+3 Tarnung.', req:'camo1' },
  { id:'lucky2', branch:'sur', tier:3, kind:'special', name:'Glückspilz II', max:1, cost:350,
    desc:'Befreiungschance +10 %.', req:'lucky1' },
];

// Boss-Gates: Tier N+1 aller Stränge erst nach Boss-Kill
AR.BOSS_GATES = [
  { afterTier:1, boss:'rat',      name:'RATTUS BEZWINGEN', biome:'keller',
    desc:'Alle Stränge laufen in diesen Knoten: Besiege den Kellerschreck, um Tier 2 und das Badezimmer freizuschalten.' },
  { afterTier:2, boss:'centipede', name:'SKOLOPENDRA BEZWINGEN', biome:'bad',
    desc:'Besiege das Abflussmonster, um Tier 3 und das Wohnzimmer freizuschalten.' },
  { afterTier:3, boss:'cat',      name:'MAUZI BEZWINGEN', biome:'wohnzimmer',
    desc:'Besiege den Stubentiger und öffne den Ewigen Sommer (Endlos-Modus).' },
];

// ---------- Biome ----------
// Spots: x,y in Weltkoordinaten, h = Höhenstufe 1-3, yield = Fangtempo-Faktor,
// vis = Sichtbarkeit (Aufmerksamkeits-Zuwachs), lure = Beute-Gewichtung-Bonus
AR.BIOMES = {
  keller: {
    id:'keller', name:'Der Keller', diff:'LEICHT', bg:'bg_keller', boss:'rat',
    desc:'Staubig, dunkel, ruhig. Perfekt zum Lernen — bis die Kellertreppe knarrt.',
    actRate:.6, eventMin:14, eventMax:26, escalation:.010,
    furniture:[
      { x:120,  y:780, w:420, h:320 },   // Regal
      { x:760,  y:900, w:360, h:200 },   // Kisten
      { x:1420, y:820, w:300, h:280 },   // Werkbank
      { x:1800, y:940, w:220, h:160 },   // Karton
    ],
    windowSpot:{ x:1980, y:180 },
    spots:[
      { x:60,   y:1040, h:1, yield:1.0, vis:1.6, name:'Bodenecke' },
      { x:2040, y:1040, h:1, yield:1.1, vis:1.5, name:'Kartonwinkel' },
      { x:545,  y:770,  h:1, yield:1.2, vis:1.2, name:'Regalkante' },
      { x:60,   y:520,  h:2, yield:1.1, vis:0.7, name:'Rohrnische' },
      { x:1725, y:800,  h:2, yield:1.3, vis:0.8, name:'Werkbankwinkel' },
      { x:60,   y:70,   h:3, yield:1.2, vis:0.3, name:'Deckenecke West' },
      { x:2040, y:70,   h:3, yield:1.5, vis:0.3, name:'Fensterecke' },
    ],
  },
  bad: {
    id:'bad', name:'Das Badezimmer', diff:'MITTEL', bg:'bg_bad', boss:'centipede',
    desc:'Glatte Fliesen, tödliches Wasser, hektische Besuche — aber die Mücken sind fett.',
    actRate:1.0, eventMin:10, eventMax:19, escalation:.016,
    furniture:[
      { x:150,  y:840, w:640, h:260 },   // Badewanne
      { x:1180, y:760, w:380, h:340 },   // Waschbecken
      { x:1760, y:880, w:260, h:220 },   // Wäschekorb
    ],
    windowSpot:{ x:1050, y:150 },
    hazards:[ { x:150, y:1060, w:640, h:40, type:'water' } ],
    spots:[
      { x:60,   y:1040, h:1, yield:1.2, vis:1.7, name:'Abflussecke' },
      { x:2040, y:1040, h:1, yield:1.1, vis:1.5, name:'Korbwinkel' },
      { x:1180, y:730,  h:1, yield:1.4, vis:1.3, name:'Beckenkante' },
      { x:2040, y:500,  h:2, yield:1.3, vis:0.8, name:'Spiegelkante' },
      { x:60,   y:450,  h:2, yield:1.4, vis:0.7, name:'Duschstange' },
      { x:60,   y:70,   h:3, yield:1.5, vis:0.3, name:'Lüftungsecke' },
      { x:2040, y:70,   h:3, yield:1.7, vis:0.3, name:'Deckenlampe' },
    ],
  },
  wohnzimmer: {
    id:'wohnzimmer', name:'Das Wohnzimmer', diff:'SCHWER', bg:'bg_wohnzimmer', boss:'cat',
    desc:'Hell, weitläufig, der Mensch wohnt hier. Die beste Beute des Hauses — und Mauzi.',
    actRate:1.5, eventMin:8, eventMax:15, escalation:.022,
    furniture:[
      { x:130,  y:760, w:620, h:340 },   // Sofa
      { x:950,  y:600, w:340, h:500 },   // Regal
      { x:1500, y:820, w:420, h:280 },   // TV-Board
    ],
    windowSpot:{ x:1980, y:160 },
    spots:[
      { x:60,   y:1040, h:1, yield:1.3, vis:1.8, name:'Sofaritze' },
      { x:2040, y:1040, h:1, yield:1.2, vis:1.6, name:'Kabelecke' },
      { x:1290, y:570,  h:1, yield:1.5, vis:1.4, name:'Regalfach' },
      { x:60,   y:430,  h:2, yield:1.5, vis:0.8, name:'Gardinenfalte' },
      { x:1920, y:790,  h:2, yield:1.6, vis:0.9, name:'TV-Winkel (warm!)' },
      { x:60,   y:70,   h:3, yield:1.7, vis:0.3, name:'Stuckecke' },
      { x:2040, y:70,   h:3, yield:2.0, vis:0.35, name:'Lampenschirm' },
    ],
  },
};

// ---------- Bosse ----------
AR.BOSSES = {
  rat: { id:'rat', name:'RATTUS, der Kellerschreck', img:'boss_rat', hp:3, scale:3.2,
    speed:220, biome:'keller',
    intro:'Ein Knurren aus dem Dunkel. RATTUS hat deine Netze satt.',
    hint:'Locke ihn in deine Netze — verfängt er sich, WICKLE IHN EIN (🕸️)!' },
  centipede: { id:'centipede', name:'SKOLOPENDRA, das Abflussmonster', img:'boss_centipede', hp:4, scale:2.8,
    speed:330, biome:'bad',
    intro:'Es kriecht aus dem Abfluss. Hundert Beine. Ein Ziel: du.',
    hint:'Sie jagt auch an Wänden! Netzfallen spannen, einwickeln, ausweichen.' },
  cat: { id:'cat', name:'MAUZI, der Stubentiger', img:'boss_cat', hp:5, scale:4.5,
    speed:290, biome:'wohnzimmer',
    intro:'Zwei Pupillen weiten sich. Der Endgegner des Hauses hat dich gesehen.',
    hint:'Katzen jagen Bewegung: ERSTARRE (🧊) im richtigen Moment, dann in die Netze locken!' },
};

AR.BRANCH_META = {
  mov:{ name:'Movement', icon:'🦵', statDesc:'Lauf-, Kletter- & Sprungkraft' },
  web:{ name:'WebGeneration', icon:'🕸️', statDesc:'Tank, Netzkosten, Fangtempo' },
  res:{ name:'Resource', icon:'🍯', statDesc:'Essenz-Ausbeute' },
  sur:{ name:'Survival Tactics', icon:'🌿', statDesc:'Tarnung & Warnvorlauf' },
};
