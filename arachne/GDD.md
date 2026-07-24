# ARACHNE — Ein Spinnenleben
### Game Design Dokument · Mobile Roguelike · Survival · Spider-Simulator

> Du bist die Spinne. Das Haus ist dein Dungeon. Der Mensch ist dein Endgegner —
> und manchmal, ganz selten, dein Retter.

---

## 1. High Concept

**ARACHNE** ist ein mobiles 2D-Roguelike-Survival-Spiel in Seitenansicht mit
semi-realistischem, filmisch überzeichnetem Look. Du lebst das Leben einer
Hausspinne: Du kletterst über Böden, Wände und Decken, spinnst Netze in
Zimmerecken, fängst Beute, sammelst **Seidenessenz** und stirbst — oft.
Jeder Tod bringt dich zurück in den **Nexus**, eine Traumdimension aus Seide
und holographischen Blaupausen (Minority-Report-Ästhetik), wo du deine
Essenz in einen permanenten 4-strängigen Skilltree investierst.

- **Roguelike:** Jeder Run endet potenziell tödlich — Pantoffel, Stiefel,
  Staubsauger. Perks im Run sind temporär, Essenz und Skilltree sind permanent.
- **Survival:** Seiden-Tank managen, Beute fangen, Tarnung halten,
  Menschen-Aktivität lesen.
- **Simulator:** Echtes Spinnengefühl — Oberflächenklettern, Abseilfaden,
  Netzbau in Ecken, Lauern.
- **Builder:** Wo du deine Netze baust, entscheidet über Ertrag UND Risiko.

**Plattform:** Mobile Browser (Touch, Hochkant/Querformat responsive) +
Desktop (Tastatur). Reines HTML5/Canvas, keine Installation.

---

## 2. Die 5 spielbaren Spinnen (Charakterauswahl)

Jede Spinne hat 4 Grundwerte (1–5) — dieselben vier Werte, die auch die
Skilltree-Stränge anheben — plus **einen einzigartigen Signatur-Perk**,
der die Spielweise fundamental verändert.

| Spinne | Movement | WebGen | Resource | Survival | Signatur-Perk |
|---|---|---|---|---|---|
| **Jago, die Riesenkrabbenspinne** (Jägerin) | 5 | 1 | 3 | 2 | **Adrenalin-Sprint:** Nach jeder Bedrohungswarnung 3 s +60 % Tempo — Flucht ist ihre Waffe. |
| **Orbelia, die Kreuzspinne** (Weberin) | 2 | 5 | 3 | 2 | **Meisterweberin:** Ihre Netze halten 2 Beutetiere gleichzeitig statt 1. |
| **Pixel, die Springspinne** (Akrobatin) | 4 | 1 | 2 | 4 | **Präzisionssprung:** Kann freifliegende Beute direkt anspringen und ohne Netz erlegen. |
| **Nyx, die Schwarze Witwe** (Assassine) | 2 | 3 | 5 | 2 | **Giftbiss:** 25 % Chance, dass gefangene Beute doppelte Essenz gibt (Gift-Vorverdauung). |
| **Bruno, die Vogelspinne** (Tank) | 1 | 2 | 2 | 5 | **Zähe Borsten:** Überlebt einmal pro Run einen tödlichen Treffer (kein Staubsauger!). |

Die Grundwerte skalieren:
- **Movement** → Lauftempo, Klettertempo, Sprungweite
- **WebGen** → Seiden-Tank-Größe, Netzbau-Kosten, Fangtempo der Netze
- **Resource** → Essenz-Ausbeute pro Beute
- **Survival** → Tarnwert (Entdeckungsradius), Warnvorlauf bei Events

---

## 3. Core Loop

```
NEXUS (Skilltree, Charakter, Teleport)
   │  Teleport ins Biom
   ▼
RUN: Erkunden → Netz-Spots finden → Netze bauen (kostet Seide)
   → Netze fangen zufällige Beute → Einsammeln = Essenz + Run-Perk
   → Menschen-Aktivität steigt → Events überleben → tiefer/höher wagen
   │
   ├── TOD (Pantoffel/Tritt/Staubsauger/Boss) ────────────┐
   ├── BEFREIUNG (selten: Glas & Papier → Extraleben) ────┤
   └── BOSS-LOCKRUF → Bossfight → Biom + Skill-Tier frei ─┤
                                                          ▼
                        Gesamte gesammelte Essenz wird im NEXUS gutgeschrieben
                        (kein Verlust beim Tod — der Tod IST der Fortschritt)
```

**Wichtig:** Essenz kennt **kein Maximum**. Alles, was du im Run sammelst,
wandert bei Tod oder Rückkehr vollständig in die Nexus-Bank.

---

## 4. Spinnen-Movement (das Herzstück)

- **Oberflächen-Kletterei:** Die Spinne haftet an Boden, Wänden, Decke und
  Möbelkanten. Der Joystick bewegt sie entlang der Oberfläche; an Ecken und
  Kanten läuft sie nahtlos um die Kurve.
- **Abseilfaden:** Von Decke oder hohen Kanten kann sie sich an einem
  Seidenfaden abseilen und wieder hochklettern (kostet minimal Seide).
- **Sprung:** Absprung von jeder Oberfläche in Joystick-Richtung —
  Springspinnen springen weiter; hohe Stürze machen kurz benommen
  (außer mit Perk „Federleicht").
- **Netz-Tempo:** Auf dem eigenen Netz bewegt man sich langsam — außer mit
  dem WebGen-Skill **Netzsprinter**, der das Netz zur Autobahn macht.
- **Vibrationsprinzip:** Schnelles Laufen auf offenem Boden erzeugt
  „Aufmerksamkeit". Langsames Schleichen und Wandnähe sind sicherer —
  echtes Spinnenverhalten wird belohnt.

---

## 5. Netzbau & Beutesystem

### Netz-Spots
Jedes Biom hat handgesetzte **Netz-Spots** (Eckwinkel) mit 3 Eigenschaften:
- **Höhe (1–3):** Bodennah / mittel / deckennah. Hohe Spots erfordern
  Movement-Skills („Eckenkletterer I/II"), sind aber deutlich sicherer.
- **Ertrag:** Wie schnell und welche Beute sich verfängt (Spots an
  Lichtquellen fangen Motten, feuchte Spots Mücken …).
- **Sichtbarkeit:** Bodennahe, offene Netze treiben die
  **Menschen-Aufmerksamkeit** hoch → mehr Events, gezielte Zerstörung.

### Beute → Perks
Gefangene Beute gibt beim Einsammeln **Essenz + einen Run-Perk** (temporär,
nur dieser Run). Mit dem WebGen-Skill **Neuwürfeln I–III** darf ein
missfallender Perk 1–3× pro Einsammeln neu gerollt werden.

| Beute | Häufigkeit | Essenz | Perk-Pool |
|---|---|---|---|
| Fliege | häufig | 8 | gewöhnlich |
| Motte | mittel | 14 | gewöhnlich/selten |
| Käfer | mittel | 18 | selten |
| Glühwürmchen | selten | 40 | episch + Licht-Aura (Tarnung −, Ertrag +) |

### Run-Perks (Auswahl, stapelbar, beeinflussen Mechanik UND Look)
- **Adrenalinschub** (gew.): +12 % Tempo
- **Seidendrüsen** (gew.): Fäden & Netze −20 % Seidenkosten
- **Klebfäden** (gew.): Netze fangen 30 % schneller
- **Schattenhaut** (selten): +2 Tarnung — die Spinne wird sichtbar dunkler
- **Chitinpanzer** (selten): Überlebt 1 Treffer (Panzer-Glanz-Effekt)
- **Nachtaugen** (selten): Events kündigen sich 2 s früher an
- **Fettreserven** (selten): +25 % Essenz pro Beute
- **Federleicht** (episch): Keine Sturz-Benommenheit, +40 % Sprungweite
- **Phantomläufer** (episch): Laufen erzeugt keine Aufmerksamkeit
- **Goldene Spinnwarzen** (episch): Netzbau kostenlos, Netze glitzern golden

---

## 6. Seidenessenz & Seiden-Tank

- **Seiden-Tank:** Aktive Ressource im Run. Netzbau, Abseilfäden und
  Boss-Attacken (Einwickeln) verbrauchen Seide. Regeneriert langsam;
  Beute-Einsammeln füllt sofort nach.
- **Seidenessenz:** Meta-Währung ohne Limit. Fließt bei Tod/Rückkehr
  vollständig in die Nexus-Bank. Der **Resource-Strang** erhöht die Ausbeute,
  der Skill **Sparsame Drüsen** senkt Verbrauch, **Verwerter** erstattet
  Seide zerstörter Netze.

---

## 7. Der Mensch — das wandelnde Game Over

Die **Menschen-Aktivität** (0–100) steigt im Run stetig; niedrige, sichtbare
Netze und Lärm beschleunigen sie. Sie taktet die Events:

| Event | Vorwarnung | Gefahr | Konter |
|---|---|---|---|
| **Schritte** | Vibrations-Ringe am Bildschirmrand | Mensch betritt den Raum, scannt sichtbare Zonen | Erstarren, Wandnähe, Tarnung |
| **Stiefel-Stampfer** | Schatten von oben | Tod am Boden (Zone) | Wegsprinten, an die Wand |
| **Pantoffel-Klatsche** | Ausholbewegung | Tod an der Wand (Zone) | Fallen lassen (Abseilfaden!) |
| **Staubsauger** | tiefes Brummen, 5 s | Saugt bodennahe Netze weg; am Boden: Tod (ignoriert Chitinpanzer & Borsten!) | Hoch! Decke! Sofort! |
| **Die Hand** | langsamer Schatten | Greift nach der Spinne | 90 % Tod … |
| **BEFREIUNG** | — | **10 % Chance bei „Hand":** Glas & Papier! Der Mensch trägt dich raus → **Extraleben**, du krabbelst durchs Fenster zurück (im Heim-Biom: direkter Wiedereinstieg am Fenster-Spot). Skill „Glückspilz" erhöht die Chance. | — |

Mit steigender Aktivität kommen Events dichter — ein Run wird nie „sicher".
**Risiko-Design:** Die fettesten Netz-Spots liegen in Menschen-Laufwegen.

---

## 8. Die 3 Biome + Bosse

Alle Biome sind vom Nexus per Teleport erreichbar (nach Freischaltung).

### Biom 1 — Der Keller (leicht)
Staubig, dunkel, wenig Menschen-Verkehr. Tutorial-artige Spot-Dichte,
langsame Event-Taktung. Fenster-Spot = Heimbasis (Befreiungs-Rückkehr).
**Boss: RATTUS, der Kellerschreck** — eine vernarbte Riesenratte.
Angriffe: Sprint-Charge, Schwanzpeitsche. Taktik: Ausweichen, dann die
Schnauze mit Seide einwickeln (3 Phasen).

### Biom 2 — Das Badezimmer (mittel)
Glatte Fliesen (rutschig — Movement zählt), Wasserflächen (tödlich ohne
Perk), hohe Luftfeuchte = Mücken. Häufige, hektische Menschen-Besuche.
**Boss: SKOLOPENDRA, das Abflussmonster** — ein riesiger Hundertfüßer,
der aus dem Abfluss jagt. Rasend schnell an Wänden. Taktik: Netzfallen
über den Abflüssen spannen, dann Segment für Segment einwickeln.

### Biom 3 — Das Wohnzimmer (schwer)
Hell, weitläufig, Dauerpräsenz des Menschen, TV-Licht wechselt die
Sichtbarkeit dynamisch. Beste Beute des Spiels.
**Boss: MAUZI, der Stubentiger** — die Hauskatze. Erkennt Bewegung
gnadenlos, Pranken-Kombos, Sprung-Verfolgung. Taktik: Bewegungs-Stopps
im richtigen Moment (Katzen sehen nur Bewegung!), Laserpointer-Ablenkung
(Umgebungs-Gimmick), dann Nase einwickeln.

---

## 9. Der Nexus & der Skilltree

Der Nexus ist eine Traumdimension: ein kolossales Netz im Void, davor ein
**holographisches Blaupausen-Terminal**. Hier wird Essenz ausgegeben.

### Struktur: 4 Stränge × 3 Tiers
Jeder Strang besteht aus **+1-Knoten** (erhöhen den Strang-Grundwert — 
kleine Effekte, die sich massiv summieren) und **Sonder-Perks**:

**MOVEMENT** *(Sonder-Perks max. 2 Stufen)*
- T1: +1-Knoten · **Eckenkletterer I** (Netz-Spots Höhe 2) · **Fallgeschick I**
- T2: +1-Knoten · **Eckenkletterer II** (Höhe 3 — die sichersten Spots des Spiels) · **Deckenläufer** (volles Tempo an der Decke)
- T3: +1-Knoten · **Fallgeschick II** (nie benommen) · **Wandsprinter**

**WEBGENERATION** *(Reroll-Perk hat 3 Stufen)*
- T1: +1-Knoten · **Neuwürfeln I** · **Dichte Seide I** (+Tank)
- T2: +1-Knoten · **Neuwürfeln II** · **Netzsprinter** (Tempo-Boost auf eigenem Netz)
- T3: +1-Knoten · **Neuwürfeln III** (3 Rerolls im Endgame) · **Dichte Seide II**

**RESOURCE**
- T1: +1-Knoten · **Feinschmecker I** (+10 % Essenz)
- T2: +1-Knoten · **Sparsame Drüsen** (−25 % Seidenverbrauch) · **Feinschmecker II**
- T3: +1-Knoten · **Verwerter** (zerstörte Netze erstatten 50 % Seide) · **Goldader** (Glühwürmchen +50 % häufiger)

**SURVIVAL TACTICS**
- T1: +1-Knoten · **Meistertarnung I**
- T2: +1-Knoten · **Nahrungsspeicher** (1 gelagerte Beute übersteht den Tod → Start-Perk im nächsten Run) · **Glückspilz I** (Befreiungschance +5 %)
- T3: +1-Knoten · **Totstellen** (bei Entdeckung: 2 s unverwundbar erstarren, 1×/Run) · **Meistertarnung II** · **Glückspilz II**

### Boss-Gates
- **Alle 4 Stränge laufen am Ende von Tier 1 in den Knoten „RATTUS BEZWINGEN"**.
  Ohne Kellerboss-Kill: Tier 2 bleibt gesperrt — aber alle Tier-1-Knoten
  können weiter ausgebaut werden (horizontaler Fortschritt statt Blockade).
- Rattus tot → **Badezimmer-Teleport** + Tier 2 offen.
- Skolopendra tot → **Wohnzimmer-Teleport** + Tier 3 offen.
- Mauzi tot → **Endlos-Modus** („Ewiger Sommer": alle Biome, doppelte
  Event-Dichte, Essenz ×1,5) + goldenes Nexus-Cosmetic.

---

## 10. Steuerung

**Touch (Mobile):**
- Links: virtueller Joystick (Bewegung entlang Oberflächen)
- Rechts: 3 Buttons — **Sprung/Faden**, **Netz bauen/Einsammeln/Interagieren**, **Erstarren/Totstellen**

**Desktop:** WASD/Pfeile = Bewegung · Space = Sprung/Faden · E = Bauen/Sammeln · Shift = Erstarren

---

## 11. Art Direction

**STYLE FORMULA** (byte-identisch in jedem generierten Asset):
> semi-realistic painterly digital illustration with cinematic detail and
> slightly exaggerated playful proportions, organic naturalistic silhouettes
> with soft dark-umber edge lines, environments in muted dusty browns and
> cool slate greys with deep warm shadows, spider heroes in rich amber-orange
> and cream markings that pop against the surroundings, prey and web pickups
> marked with luminous cyan-teal glow, moody household twilight atmosphere
> with soft volumetric light, dramatic yet playful, high contrast between
> game elements and backgrounds, clean readable silhouettes, consistent
> side-view perspective across all assets

- **Spinnen & Kreaturen:** semi-realistisch, warm beleuchtet, leicht
  überzeichnete Proportionen (Charakter statt Horror).
- **Signalfarbe Cyan-Teal:** ausschließlich für Interaktives — Netze, Beute-
  Glow, Nexus-Hologramme, UI-Akzente.
- **Nexus:** dunkles Void, Seidenstränge, schwebende Blaupausen-Panels.
- **UI:** dünne Holo-Linien, Glaspanels, Seiden-Textur-Rahmen.

## 12. Audio
Prozedurale WebAudio-SFX (kein Asset-Download): Seiden-„Pling", dumpfe
Stampfer mit Screenshake, Staubsauger-Drone, Nexus-Ambient-Pad.

## 13. Technik
- Pures HTML5/Canvas/JS, keine Dependencies, offline-fähig
- Läuft direkt von jedem Static Host (oder `file://`)
- Speicherstand: `localStorage` (Essenz-Bank, Skilltree, Boss-Flags, Statistiken)
- 60 FPS Ziel, Performance-Budget für schwache Mobilgeräte
