// Eingabe: virtueller Joystick (Touch) + Tastatur
AR.Input = {
  joy: { x:0, y:0, active:false, id:null, baseX:0, baseY:0 },
  keys: {},
  // Buttons feuern Events über Callbacks (von Run gesetzt)
  onJump: null, onAct: null, onFreeze: null,
  actHeld: false,

  init() {
    const zone = document.getElementById('joy-zone');
    const base = document.getElementById('joy-base');
    const knob = document.getElementById('joy-knob');
    const R = 46;

    const setKnob = (dx, dy) => {
      const len = Math.hypot(dx, dy) || 1;
      const cl = Math.min(len, R);
      const nx = dx / len * cl, ny = dy / len * cl;
      knob.style.transform = `translate(${nx}px,${ny}px)`;
      this.joy.x = nx / R; this.joy.y = ny / R;
    };

    zone.addEventListener('touchstart', e => {
      e.preventDefault();
      const t = e.changedTouches[0];
      this.joy.active = true; this.joy.id = t.identifier;
      this.joy.baseX = t.clientX; this.joy.baseY = t.clientY;
      base.style.display = 'block';
      base.style.left = t.clientX + 'px'; base.style.top = t.clientY + 'px';
      base.style.margin = '-55px 0 0 -55px';
      setKnob(0, 0);
      AR.Audio.init(); AR.Audio.resume();
    }, { passive:false });

    zone.addEventListener('touchmove', e => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (t.identifier !== this.joy.id) continue;
        setKnob(t.clientX - this.joy.baseX, t.clientY - this.joy.baseY);
      }
    }, { passive:false });

    const endJoy = e => {
      for (const t of e.changedTouches) {
        if (t.identifier !== this.joy.id) continue;
        this.joy.active = false; this.joy.id = null;
        this.joy.x = 0; this.joy.y = 0;
        base.style.display = 'none';
      }
    };
    zone.addEventListener('touchend', endJoy);
    zone.addEventListener('touchcancel', endJoy);

    // Buttons
    const bind = (id, down, up) => {
      const el = document.getElementById(id);
      const d = e => { e.preventDefault(); AR.Audio.init(); AR.Audio.resume(); down && down(); };
      const u = e => { e.preventDefault(); up && up(); };
      el.addEventListener('touchstart', d, { passive:false });
      el.addEventListener('touchend', u, { passive:false });
      el.addEventListener('mousedown', d);
      el.addEventListener('mouseup', u);
    };
    bind('tbtn-jump', () => this.onJump && this.onJump());
    bind('tbtn-act', () => { this.actHeld = true; this.onAct && this.onAct(); }, () => this.actHeld = false);
    bind('tbtn-freeze', () => this.onFreeze && this.onFreeze(true), () => this.onFreeze && this.onFreeze(false));

    // Tastatur
    window.addEventListener('keydown', e => {
      if (e.repeat) { this.keys[e.code] = true; return; }
      this.keys[e.code] = true;
      AR.Audio.init(); AR.Audio.resume();
      if (e.code === 'Space') { e.preventDefault(); this.onJump && this.onJump(); }
      if (e.code === 'KeyE') { this.actHeld = true; this.onAct && this.onAct(); }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.onFreeze && this.onFreeze(true);
    });
    window.addEventListener('keyup', e => {
      this.keys[e.code] = false;
      if (e.code === 'KeyE') this.actHeld = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.onFreeze && this.onFreeze(false);
    });
  },

  // kombinierter Bewegungsvektor (-1..1)
  vec() {
    let x = this.joy.x, y = this.joy.y;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) x -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) x += 1;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) y -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) y += 1;
    const l = Math.hypot(x, y);
    if (l > 1) { x /= l; y /= l; }
    return { x, y };
  },
};
