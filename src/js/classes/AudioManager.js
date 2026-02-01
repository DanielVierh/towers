export class AudioManager {
  constructor(storageKeyPrefix = "towers.audio") {
    this.storageKeyPrefix = storageKeyPrefix;

    this._ctx = null;
    this._masterGain = null;

    this._muted = false;
    this._volume = 0.35;

    this._lastPlayedAt = new Map();

    this._unlocked = false;
    this._unlockHandlerBound = false;

    this._loadSettings();
  }

  _loadSettings() {
    try {
      const muted = localStorage.getItem(`${this.storageKeyPrefix}.muted`);
      const volume = localStorage.getItem(`${this.storageKeyPrefix}.volume`);
      if (muted !== null) this._muted = muted === "true";
      if (volume !== null && !Number.isNaN(Number(volume))) {
        this._volume = Math.max(0, Math.min(1, Number(volume)));
      }
    } catch (e) {
      // ignore (privacy mode / disabled storage)
    }
  }

  _saveSettings() {
    try {
      localStorage.setItem(
        `${this.storageKeyPrefix}.muted`,
        String(this._muted),
      );
      localStorage.setItem(
        `${this.storageKeyPrefix}.volume`,
        String(this._volume),
      );
    } catch (e) {
      // ignore
    }
  }

  get muted() {
    return this._muted;
  }

  get volume() {
    return this._volume;
  }

  setMuted(muted) {
    this._muted = Boolean(muted);
    this._applyGain();
    this._saveSettings();
  }

  toggleMute() {
    this.setMuted(!this._muted);
    return this._muted;
  }

  setVolume(volume01) {
    const v = Number(volume01);
    if (Number.isNaN(v)) return;
    this._volume = Math.max(0, Math.min(1, v));
    this._applyGain();
    this._saveSettings();
  }

  _ensureContext() {
    if (this._ctx && this._masterGain) return true;

    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return false;

    this._ctx = new AudioContextCtor();
    this._masterGain = this._ctx.createGain();
    this._masterGain.connect(this._ctx.destination);
    this._applyGain();

    return true;
  }

  _applyGain() {
    if (!this._masterGain) return;
    const target = this._muted ? 0 : this._volume;
    this._masterGain.gain.setTargetAtTime(
      target,
      this._ctx ? this._ctx.currentTime : 0,
      0.01,
    );
  }

  bindUserGestureUnlock() {
    if (this._unlockHandlerBound) return;
    this._unlockHandlerBound = true;

    const unlock = async () => {
      try {
        if (!this._ensureContext()) return;
        if (this._ctx.state === "suspended") {
          await this._ctx.resume();
        }
        this._unlocked = true;
      } catch (e) {
        // ignore
      }
    };

    // Once the user interacts, browsers allow audio.
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock);
  }

  _cooldownMsForKey(key) {
    switch (key) {
      case "laser_red":
      case "laser_blue":
      case "laser_green":
        return 60;
      case "missile":
        return 120;
      case "creep_death":
        return 80;
      case "explosion":
        return 140;
      case "life_lost":
        return 200;
      case "ui_click":
        return 40;
      case "purchase_ok":
      case "purchase_fail":
        return 180;
      case "game_over":
        return 2000;
      case "start":
        return 800;
      default:
        return 80;
    }
  }

  _canPlay(key, nowMs, cooldownMs, force) {
    if (force) return true;
    const last = this._lastPlayedAt.get(key) ?? 0;
    return nowMs - last >= cooldownMs;
  }

  play(key, opts = {}) {
    if (this._muted) return;
    if (!this._ensureContext()) return;

    const nowMs = performance.now();
    const cooldownMs = opts.cooldownMs ?? this._cooldownMsForKey(key);
    const force = Boolean(opts.force);
    if (!this._canPlay(key, nowMs, cooldownMs, force)) return;
    this._lastPlayedAt.set(key, nowMs);

    // If still suspended, don't throw; just skip quietly.
    if (this._ctx.state === "suspended") return;

    const t0 = this._ctx.currentTime;
    const volume = Math.max(0, Math.min(1, opts.volume ?? 1));

    switch (key) {
      case "laser_red":
        this._beep(t0, {
          freq: 620,
          dur: 0.06,
          type: "triangle",
          gain: 0.075 * volume,
        });
        break;
      case "laser_blue":
        this._beep(t0, {
          freq: 740,
          dur: 0.05,
          type: "sine",
          gain: 0.1 * volume,
        });
        break;
      case "laser_green":
        this._beep(t0, {
          freq: 660,
          dur: 0.06,
          type: "triangle",
          gain: 0.1 * volume,
        });
        break;
      case "missile":
        this._sweep(t0, {
          from: 420,
          to: 180,
          dur: 0.18,
          type: "sawtooth",
          gain: 0.1 * volume,
        });
        break;
      case "creep_death":
        this._thud(t0, { gain: 0.16 * volume });
        break;
      case "explosion":
        this._noiseBurst(t0, { dur: 0.22, gain: 0.22 * volume });
        break;
      case "life_lost":
        this._sweep(t0, {
          from: 260,
          to: 90,
          dur: 0.22,
          type: "sine",
          gain: 0.14 * volume,
        });
        break;
      case "ui_click":
        this._beep(t0, {
          freq: 1200,
          dur: 0.015,
          type: "square",
          gain: 0.06 * volume,
        });
        break;
      case "purchase_ok":
        this._beep(t0, {
          freq: 880,
          dur: 0.05,
          type: "triangle",
          gain: 0.1 * volume,
        });
        this._beep(t0 + 0.055, {
          freq: 1175,
          dur: 0.05,
          type: "triangle",
          gain: 0.1 * volume,
        });
        break;
      case "purchase_fail":
        this._beep(t0, {
          freq: 180,
          dur: 0.12,
          type: "sawtooth",
          gain: 0.1 * volume,
        });
        break;
      case "game_over":
        this._sweep(t0, {
          from: 220,
          to: 55,
          dur: 0.6,
          type: "sine",
          gain: 0.16 * volume,
        });
        break;
      case "start":
        this._beep(t0, {
          freq: 523.25,
          dur: 0.06,
          type: "triangle",
          gain: 0.1 * volume,
        });
        this._beep(t0 + 0.07, {
          freq: 659.25,
          dur: 0.06,
          type: "triangle",
          gain: 0.1 * volume,
        });
        break;
      default:
        this._beep(t0, {
          freq: 800,
          dur: 0.03,
          type: "sine",
          gain: 0.08 * volume,
        });
        break;
    }
  }

  _beep(t0, { freq, dur, type, gain }) {
    const osc = this._ctx.createOscillator();
    const g = this._ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);

    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    osc.connect(g);
    g.connect(this._masterGain);

    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  _sweep(t0, { from, to, dur, type, gain }) {
    const osc = this._ctx.createOscillator();
    const g = this._ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(from, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + dur);

    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    osc.connect(g);
    g.connect(this._masterGain);

    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  _thud(t0, { gain }) {
    // short low hit: pitch drop + noise hint
    this._sweep(t0, { from: 160, to: 70, dur: 0.12, type: "sine", gain });
    this._noiseBurst(t0, { dur: 0.08, gain: gain * 0.55 });
  }

  _noiseBurst(t0, { dur, gain }) {
    const bufferSize = Math.floor(this._ctx.sampleRate * dur);
    const buffer = this._ctx.createBuffer(1, bufferSize, this._ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // white noise with slight decay
      const decay = 1 - i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * decay;
    }

    const src = this._ctx.createBufferSource();
    src.buffer = buffer;

    const g = this._ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    src.connect(g);
    g.connect(this._masterGain);

    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }
}
