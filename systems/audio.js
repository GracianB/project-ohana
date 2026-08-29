export class AudioSystem {
  constructor({ events } = {}) {
    this.events = events;
    this.enabled = false;
    this.volume = 0.6;
    this.music = new Map();
    this.effects = new Map();
    this.currentMusic = null;
  }

  registerMusic(id, src) {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = this.volume * 0.45;
    this.music.set(id, audio);
    return audio;
  }

  registerEffect(id, src) {
    const audio = new Audio(src);
    audio.volume = this.volume;
    this.effects.set(id, audio);
    return audio;
  }

  async unlock() {
    this.enabled = true;
    this.events?.emit("audio:unlocked");
  }

  playEffect(id) {
    if (!this.enabled) return;

    const source = this.effects.get(id);
    if (!source) return;

    const sound = source.cloneNode();
    sound.volume = this.volume;
    sound.play().catch(() => {});
  }

  playMusic(id) {
    if (!this.enabled || this.currentMusic === id) return;

    this.stopMusic();

    const audio = this.music.get(id);
    if (!audio) return;

    this.currentMusic = id;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  stopMusic() {
    if (!this.currentMusic) return;

    const audio = this.music.get(this.currentMusic);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    this.currentMusic = null;
  }

  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));

    for (const audio of this.music.values()) {
      audio.volume = this.volume * 0.45;
    }

    for (const audio of this.effects.values()) {
      audio.volume = this.volume;
    }
  }
}
