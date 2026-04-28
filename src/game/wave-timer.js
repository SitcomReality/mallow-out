export class WaveTimer {
  constructor() {
    this.duration = 0;
    this.remaining = 0;
    this.active = false;
  }
  
  start(duration) {
    this.duration = duration;
    this.remaining = duration;
    this.active = true;
  }
  
  update(delta) {
    if (!this.active) return;
    this.remaining = Math.max(0, this.remaining - delta);
  }
  
  addTimeBonus(seconds) {
    if (!this.active) return;
    this.remaining = Math.min(this.duration, this.remaining + seconds);
  }
  
  getRemainingTime() {
    return this.remaining;
  }
  
  isComplete() {
    return this.active && this.remaining <= 0;
  }
  
  stop() {
    this.active = false;
  }
}