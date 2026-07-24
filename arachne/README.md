# 🕷️ ARACHNE — Ein Spinnenleben

Mobile Roguelike · Survival · Spider-Simulator — als reines HTML5/Canvas-Spiel,
ohne Dependencies, ohne Build-Step.

**Spielen:** `index.html` von einem beliebigen Static Host ausliefern
(oder lokal `python3 -m http.server` im Ordner starten). Läuft auf
Mobile (Touch) und Desktop (Tastatur).

## Features

- **5 spielbare Spinnen** mit eigenen Grundwerten und je einem
  Signatur-Perk (Adrenalin-Sprint, Meisterweberin, Präzisionssprung,
  Giftbiss, Zähe Borsten)
- **Echtes Spinnen-Movement:** nahtloses Klettern über Boden, Wände,
  Decke und Möbel (Perimeter-System), Abseilfaden, Sprünge
- **Netzbau-Ökonomie:** Seiden-Tank, Netz-Spots mit Höhe/Ertrag/Sichtbarkeit,
  Beutefang, Run-Perks mit Reroll-Mechanik
- **Der Mensch als Roguelike-Element:** Stampfer, Pantoffel, Staubsauger,
  die greifende Hand — und die seltene **Befreiung** (Glas & Papier)
- **3 Biome** (Keller → Badezimmer → Wohnzimmer) mit 3 Bossen
  (RATTUS, SKOLOPENDRA, MAUZI), die Skilltree-Tiers und Biome gaten
- **Nexus** mit holographischem Blaupausen-Terminal: 4-strängiger
  Skilltree (Movement, WebGeneration, Resource, Survival Tactics),
  Seidenessenz ohne Obergrenze, permanenter Fortschritt
- **Endlos-Modus** „Ewiger Sommer" nach dem Katzen-Boss
- Speicherstand in `localStorage`, prozedurale WebAudio-SFX

## Struktur

```
index.html         Einstieg + DOM-Screens (Titel, Nexus, HUD …)
css/style.css      Holo-/Seiden-UI
js/config.js       Alle Spieldaten (Charaktere, Perks, Skilltree, Biome, Bosse)
js/world.js        Perimeter-Klettergeometrie
js/entities.js     Spinne, Netze, Beute, Partikel
js/threats.js      Menschen-Events
js/boss.js         Bossfights
js/run.js          Run-Orchestrierung, Kamera, Rendering
js/nexus.js        Skilltree-Terminal
assets/img/        Higgsfield-generierte Assets (eine Style-Formel, s. GDD)
design/assets.csv  Asset-Manifest
GDD.md             Vollständiges Game-Design-Dokument
```

Das komplette ausgearbeitete Konzept steht in [GDD.md](GDD.md).
